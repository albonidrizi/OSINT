package com.osint.dto

import com.osint.model.Scan
import com.osint.model.ScanStatus
import com.osint.model.ScanTool
import java.time.LocalDateTime

data class ScanResponse(
    val id: Long,
    val domain: String,
    val tool: ScanTool,
    val startTime: LocalDateTime,
    val endTime: LocalDateTime?,
    val status: ScanStatus,
    val results: String?,
    val errorMessage: String?
) {
    companion object {
        fun from(scan: Scan): ScanResponse {
            return ScanResponse(
                id = scan.id!!,
                domain = scan.domain,
                tool = scan.tool,
                startTime = scan.startTime,
                endTime = scan.endTime,
                status = scan.status,
                results = scan.results,
                errorMessage = scan.errorMessage
            )
        }
    }
}

