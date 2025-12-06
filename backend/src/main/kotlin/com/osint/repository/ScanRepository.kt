package com.osint.repository

import com.osint.model.Scan
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface ScanRepository : JpaRepository<Scan, Long> {
    fun findAllByOrderByStartTimeDesc(): List<Scan>
}

