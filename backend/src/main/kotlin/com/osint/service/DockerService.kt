package com.osint.service

import com.github.dockerjava.api.DockerClient
import com.github.dockerjava.api.async.ResultCallback
import com.github.dockerjava.api.model.Frame
import com.github.dockerjava.api.model.HostConfig
import com.github.dockerjava.api.model.WaitResponse
import com.github.dockerjava.core.DockerClientBuilder
import com.github.dockerjava.core.DefaultDockerClientConfig
import com.github.dockerjava.zerodep.ZerodepDockerHttpClient
import com.osint.model.ScanTool
import org.springframework.stereotype.Service
import java.io.ByteArrayOutputStream
import java.net.URI
import java.nio.charset.StandardCharsets
import java.util.concurrent.TimeUnit

@Service
class DockerService {
    
    private val dockerClient: DockerClient by lazy {
        val config = DefaultDockerClientConfig.createDefaultConfigBuilder()
            .withDockerHost("unix:///var/run/docker.sock")
            .build()
        
        val httpClient = ZerodepDockerHttpClient.Builder()
            .dockerHost(URI.create("unix:///var/run/docker.sock"))
            .build()
        
        DockerClientBuilder.getInstance(config)
            .withDockerHttpClient(httpClient)
            .build()
    }
    
    fun executeScan(domain: String, tool: ScanTool, limit: Int? = null, sources: String? = null): String {
        return when (tool) {
            ScanTool.THEHARVESTER -> executeTheHarvester(domain, limit, sources)
            ScanTool.AMASS -> executeAmass(domain)
        }
    }
    
    private fun executeTheHarvester(domain: String, limit: Int?, sources: String?): String {
        val imageName = "ghcr.io/laramies/theharvester:latest"
        
        // Ensure image exists
        try {
            dockerClient.inspectImageCmd(imageName).exec()
        } catch (e: com.github.dockerjava.api.exception.NotFoundException) {
            println("Image $imageName not found locally. Pulling...")
            try {
                dockerClient.pullImageCmd(imageName).start().awaitCompletion(300, TimeUnit.SECONDS)
                println("Image $imageName pulled successfully.")
            } catch (pullEx: Exception) {
                return "Error: Failed to pull image $imageName. ${pullEx.message}"
            }
        } catch (e: Exception) {
            println("Error checking image: ${e.message}")
        }
        
        // Build command
        val command = mutableListOf(
            "-d",
            domain,
            "-b",
            sources?.takeIf { it.isNotBlank() } ?: "all"
        )
        
        if (limit != null) {
            command.add("-l")
            command.add(limit.toString())
        }
        
        // Override entrypoint to use theHarvester instead of restfulHarvest.py
        return executeContainer(imageName, command, listOf("theHarvester"))
    }
    
    private fun executeAmass(domain: String): String {
        val imageName = "caffix/amass:latest"
        
        // Pull image if not exists
        try {
            dockerClient.pullImageCmd(imageName).start().awaitCompletion(60, TimeUnit.SECONDS)
        } catch (e: Exception) {
            // Image might already exist
        }
        
        // Build command - use passive mode for reliability
        val command = listOf(
            "enum",
            "-passive",
            "-d",
            domain
        )
        
        return executeContainer(imageName, command)
    }
    
    private fun executeContainer(imageName: String, command: List<String>, entrypoint: List<String>? = null): String {
        val outputStream = ByteArrayOutputStream()
        var containerId: String? = null
        
        try {
            // Create container
            var containerCmd = dockerClient.createContainerCmd(imageName)
                .withCmd(*command.toTypedArray())
                .withHostConfig(
                    HostConfig.newHostConfig()
                        .withAutoRemove(false)
                )
            
            if (entrypoint != null) {
                containerCmd = containerCmd.withEntrypoint(*entrypoint.toTypedArray())
            }
            
            val createContainerResponse = containerCmd.exec()
            containerId = createContainerResponse.id
            
            // Start container
            dockerClient.startContainerCmd(containerId).exec()
            
            // Wait for container to finish
            val waitCallback = object : ResultCallback.Adapter<WaitResponse>() {
                override fun onComplete() { }
            }
            dockerClient.waitContainerCmd(containerId).exec(waitCallback)
            waitCallback.awaitCompletion(300, TimeUnit.SECONDS)
            
            // Get logs
            val callback = object : ResultCallback.Adapter<Frame>() {
                override fun onNext(item: Frame) {
                    outputStream.write(item.payload)
                }
            }
            
            dockerClient.logContainerCmd(containerId)
                .withStdOut(true)
                .withStdErr(true)
                .exec(callback)
            
            callback.awaitCompletion(10, TimeUnit.SECONDS)
            
        } catch (e: Exception) {
            return "Error executing container: ${e.message}\n${e.stackTraceToString()}"
        } finally {
            containerId?.let { id ->
                try {
                    dockerClient.removeContainerCmd(id).exec()
                } catch (e: Exception) { }
            }
        }
        
        return outputStream.toString(StandardCharsets.UTF_8)
    }
    
    fun parseResults(tool: ScanTool, output: String): Map<String, Any> {
        return when (tool) {
            ScanTool.THEHARVESTER -> parseTheHarvesterResults(output)
            ScanTool.AMASS -> parseAmassResults(output)
        }
    }
    
    private fun parseTheHarvesterResults(output: String): Map<String, Any> {
        val results = mutableMapOf<String, Any>()
        val emails = mutableSetOf<String>()
        val hosts = mutableSetOf<String>()
        val ips = mutableSetOf<String>()
        val linkedin = mutableSetOf<String>()
        
        output.lines().forEach { line ->
            when {
                line.contains("@") && line.matches(Regex(".*@.*\\..*")) -> {
                    line.trim().split(" ").firstOrNull { it.contains("@") }?.let { emails.add(it) }
                }
                line.contains("linkedin.com") -> linkedin.add(line.trim())
                line.matches(Regex(".*\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}.*")) -> {
                    line.trim().split(" ").firstOrNull { 
                        it.matches(Regex("\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}"))
                    }?.let { ips.add(it) }
                }
                line.contains(".") && !line.contains("@") && line.trim().length > 3 -> {
                    line.trim().split(" ").firstOrNull { 
                        it.contains(".") && !it.contains("@")
                    }?.let { if (it.length > 3) hosts.add(it) }
                }
            }
        }
        
        results["emails"] = emails.toList()
        results["hosts"] = hosts.toList()
        results["ips"] = ips.toList()
        results["linkedin"] = linkedin.toList()
        results["raw"] = output
        
        return results
    }

    private fun parseAmassResults(output: String): Map<String, Any> {
        val results = mutableMapOf<String, Any>()
        val subdomains = mutableSetOf<String>()
        val ips = mutableSetOf<String>()
        
        val domainRegex = Regex("([a-zA-Z0-9]([a-zA-Z0-9\\-]{0,61}[a-zA-Z0-9])?\\.)+[a-zA-Z]{2,}")
        val ipRegex = Regex("\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}")

        output.lines().forEach { line ->
            val trimmed = line.trim()
            if (trimmed.isNotBlank() && !trimmed.startsWith("[") && !trimmed.contains("Amass")) {
                domainRegex.findAll(trimmed).forEach { subdomains.add(it.value) }
                ipRegex.findAll(trimmed).forEach { ips.add(it.value) }
            }
        }
        
        results["subdomains"] = subdomains.toList()
        results["ips"] = ips.toList()
        results["raw"] = output
        
        return results
    }
}
