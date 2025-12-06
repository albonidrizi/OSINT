package com.osint.service

import com.osint.dto.ScanRequest
import com.osint.model.ScanStatus
import com.osint.repository.ScanRepository
import com.fasterxml.jackson.databind.ObjectMapper
import org.springframework.scheduling.annotation.Async
import org.springframework.stereotype.Service
import java.time.LocalDateTime

@Service
class ScanExecutor(
    private val scanRepository: ScanRepository,
    private val dockerService: DockerService,
    private val objectMapper: ObjectMapper
) {
    
    @Async("taskExecutor")
    fun executeScanAsync(scanId: Long, request: ScanRequest) {
        val scan = scanRepository.findById(scanId).orElseThrow()
        
        try {
            // Execute Docker container
            val output = dockerService.executeScan(
                domain = request.domain,
                tool = request.tool,
                limit = request.limit,
                sources = request.sources
            )
            
            // Parse results
            val parsedResults = dockerService.parseResults(request.tool, output)
            val resultsJson = objectMapper.writeValueAsString(parsedResults)
            
            // Update scan
            scan.status = ScanStatus.COMPLETED
            scan.endTime = LocalDateTime.now()
            scan.results = resultsJson
            scanRepository.save(scan)
            
        } catch (e: Exception) {
            scan.status = ScanStatus.FAILED
            scan.endTime = LocalDateTime.now()
            scan.errorMessage = e.message
            scanRepository.save(scan)
        }
    }
}
