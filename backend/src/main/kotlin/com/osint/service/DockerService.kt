package com.osint.service

import com.github.dockerjava.api.DockerClient
import com.github.dockerjava.api.async.ResultCallback
import com.github.dockerjava.api.command.CreateContainerResponse
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
        try {
            val config = DefaultDockerClientConfig.createDefaultConfigBuilder()
                .withDockerHost("unix:///var/run/docker.sock")
                .build()
            
            DockerClientBuilder.getInstance(config)
                .withDockerHttpClient(
                    ZerodepDockerHttpClient.Builder()
                        .dockerHost(URI.create("unix:///var/run/docker.sock"))
                        .build()
                )
                .build()
        } catch (e: Exception) {
            // Fallback to default if zerodep fails
            DockerClientBuilder.getInstance().build()
        }
    }
    
    fun executeScan(domain: String, tool: ScanTool, limit: Int? = null, sources: String? = null): String {
        return when (tool) {
        command.add("-b")
        command.add(sources?.takeIf { it.isNotBlank() } ?: "all")
        
        if (limit != null) {
            command.add("-l")
            command.add(limit.toString())
        }
        
        return executeContainer(imageName, command)
    }
    
    private fun executeAmass(domain: String): String {
        val imageName = "caffix/amass:latest"
        
        // Pull image if not exists
        try {
            dockerClient.pullImageCmd(imageName).start().awaitCompletion(60, TimeUnit.SECONDS)
        } catch (e: Exception) {
            // Image might already exist
        }
        
        // Build command
        val command = listOf(
            "enum",
            "-d",
            domain,
            "-json",
            "/dev/stdout"
        )
        
        return executeContainer(imageName, command)
    }
    
    private fun executeContainer(imageName: String, command: List<String>): String {
        val outputStream = ByteArrayOutputStream()
        var containerId: String? = null
        
        try {
            // Create container
            val createContainerResponse: CreateContainerResponse = dockerClient.createContainerCmd(imageName)
                .withCmd(*command.toTypedArray())
                .withHostConfig(
                    HostConfig.newHostConfig()
                        .withAutoRemove(false) // Don't auto-remove so we can get logs
                )
                .exec()
            
            containerId = createContainerResponse.id
            
            // Start container
            dockerClient.startContainerCmd(containerId).exec()
            
            // Wait for container to finish (with timeout)
            val waitCallback = object : ResultCallback.Adapter<WaitResponse>() {
                override fun onComplete() {
                    // Container finished
                }
            }
            dockerClient.waitContainerCmd(containerId).exec(waitCallback)
            waitCallback.awaitCompletion(300, TimeUnit.SECONDS)
            
            // Get logs after container finishes
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
            // Clean up container
            containerId?.let { id ->
                try {
                    dockerClient.removeContainerCmd(id).exec()
                } catch (e: Exception) {
                    // Container might already be removed
                }
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
                    val email = line.trim().split(" ").firstOrNull { it.contains("@") }
                    email?.let { emails.add(it) }
                }
                line.contains("Hosts found:") || line.contains("IPs found:") -> {
                    // Extract hosts/IPs from theHarvester output
                }
                line.contains("linkedin.com") -> {
                    val linkedinUrl = line.trim()
                    linkedin.add(linkedinUrl)
                }
                line.matches(Regex(".*\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}.*")) -> {
                    val ip = line.trim().split(" ").firstOrNull { 
                        it.matches(Regex("\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}"))
                    }
                    ip?.let { ips.add(it) }
                }
                line.contains(".") && !line.contains("@") && line.trim().length > 3 -> {
                    // Potential hostname
                    val host = line.trim().split(" ").firstOrNull { 
                        it.contains(".") && !it.contains("@")
                    }
                    host?.let { if (it.length > 3) hosts.add(it) }
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
        
        // Amass JSON output parsing
        output.lines().forEach { line ->
            if (line.trim().startsWith("{") && line.contains("\"name\"")) {
                try {
                    // Simple JSON parsing for subdomains
                    val nameMatch = Regex("\"name\"\\s*:\\s*\"([^\"]+)\"").find(line)
                    nameMatch?.let {
                        val subdomain = it.groupValues[1]
                        subdomains.add(subdomain)
                    }
                    
                    val ipMatch = Regex("\"addr\"\\s*:\\s*\"([^\"]+)\"").find(line)
                    ipMatch?.let {
                        val ip = it.groupValues[1]
                        if (ip.matches(Regex("\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}"))) {
                            ips.add(ip)
                        }
                    }
                } catch (e: Exception) {
                    // Skip malformed JSON lines
                }
            }
        }
        
        results["subdomains"] = subdomains.toList()
        results["ips"] = ips.toList()
        results["raw"] = output
        
        return results
    }
}

