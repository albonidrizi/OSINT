package com.osint.repository

import com.osint.model.Scan
import com.osint.model.ScanStatus
import com.osint.model.ScanTool
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest
import org.springframework.test.context.ActiveProfiles
import java.time.LocalDateTime

@DataJpaTest
@ActiveProfiles("test")
class ScanRepositoryTest @Autowired constructor(
    val scanRepository: ScanRepository
) {

    @Test
    fun `save should persist scan`() {
        // Given
        val scan = Scan(
            domain = "example.com",
            tool = ScanTool.AMASS,
            startTime = LocalDateTime.now(),
            status = ScanStatus.RUNNING
        )

        // When
        val savedScan = scanRepository.save(scan)

        // Then
        assertNotNull(savedScan.id)
        assertEquals("example.com", savedScan.domain)
    }

    @Test
    fun `findAllByOrderByStartTimeDesc should return scans ordered by start time`() {
        // Given
        val scan1 = Scan(domain = "1.com", tool = ScanTool.AMASS, startTime = LocalDateTime.now().minusHours(2), status = ScanStatus.COMPLETED)
        val scan2 = Scan(domain = "2.com", tool = ScanTool.AMASS, startTime = LocalDateTime.now(), status = ScanStatus.COMPLETED)
        val scan3 = Scan(domain = "3.com", tool = ScanTool.AMASS, startTime = LocalDateTime.now().minusHours(1), status = ScanStatus.COMPLETED)

        scanRepository.saveAll(listOf(scan1, scan2, scan3))

        // When
        val results = scanRepository.findAllByOrderByStartTimeDesc()

        // Then
        assertEquals(3, results.size)
        assertEquals("2.com", results[0].domain) // Newest first
        assertEquals("3.com", results[1].domain)
        assertEquals("1.com", results[2].domain) // Oldest last
    }
}
