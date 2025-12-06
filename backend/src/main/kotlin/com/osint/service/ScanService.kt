package com.osint.service

import com.osint.dto.ScanRequest
import com.osint.model.Scan
import com.osint.model.ScanStatus
import com.osint.repository.ScanRepository
import org.springframework.stereotype.Service
import java.time.LocalDateTime

@Service
class ScanService(
    private val scanRepository: ScanRepository,
    private val scanExecutor: ScanExecutor
) {
    
    fun initiateScan(request: ScanRequest): Scan {
        val scan = Scan(
            domain = request.domain,
            tool = request.tool,
            startTime = LocalDateTime.now(),
            status = ScanStatus.RUNNING
        )
        
        val savedScan = scanRepository.save(scan)
        
        // Execute scan asynchronously via separate service (required for @Async to work)
        scanExecutor.executeScanAsync(savedScan.id!!, request)
        
        return savedScan
    }
    
    fun getAllScans(): List<Scan> {
        return scanRepository.findAllByOrderByStartTimeDesc()
    }
    
    fun getScanById(id: Long): Scan? {
        return scanRepository.findById(id).orElse(null)
    }

    fun deleteAllScans() {
        scanRepository.deleteAll()
    }
}


