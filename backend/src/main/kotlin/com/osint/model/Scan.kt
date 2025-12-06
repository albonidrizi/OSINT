package com.osint.model

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "scans")
data class Scan(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,
    
    @Column(nullable = false)
    val domain: String,
    
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    val tool: ScanTool,
    
    @Column(nullable = false)
    val startTime: LocalDateTime,
    
    @Column(nullable = true)
    var endTime: LocalDateTime? = null,
    
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    var status: ScanStatus = ScanStatus.RUNNING,
    
    @Column(columnDefinition = "TEXT")
    var results: String? = null,
    
    @Column(columnDefinition = "TEXT")
    var errorMessage: String? = null
)

enum class ScanTool {
    THEHARVESTER,
    AMASS
}

enum class ScanStatus {
    RUNNING,
    COMPLETED,
    FAILED
}

