package com.osint.controller

import com.osint.dto.ScanRequest
import com.osint.dto.ScanResponse
import com.osint.service.ScanService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/scans")
@CrossOrigin(origins = ["http://localhost:3000", "http://localhost:80"])
class ScanController(
    private val scanService: ScanService
) {
    
    @PostMapping
    fun initiateScan(@RequestBody request: ScanRequest): ResponseEntity<ScanResponse> {
        if (request.domain.isBlank()) {
            return ResponseEntity.badRequest().build()
        }
        
        val scan = scanService.initiateScan(request)
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ScanResponse.from(scan))
    }
    
    @GetMapping
    fun getAllScans(): ResponseEntity<List<ScanResponse>> {
        val scans = scanService.getAllScans()
        return ResponseEntity.ok(scans.map { ScanResponse.from(it) })
    }
    
    @GetMapping("/{id}")
    fun getScanById(@PathVariable id: Long): ResponseEntity<ScanResponse> {
        val scan = scanService.getScanById(id)
        return if (scan != null) {
            ResponseEntity.ok(ScanResponse.from(scan))
        } else {
            ResponseEntity.notFound().build()
        }
    }
}

