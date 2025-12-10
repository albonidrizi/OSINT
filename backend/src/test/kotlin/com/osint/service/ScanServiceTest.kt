package com.osint.service

import com.osint.dto.ScanRequest
import com.osint.model.Scan
import com.osint.model.ScanStatus
import com.osint.model.ScanTool
import com.osint.repository.ScanRepository
import io.mockk.every
import io.mockk.mockk
import io.mockk.slot
import io.mockk.verify
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import java.time.LocalDateTime
import java.util.*

class ScanServiceTest {

    private val scanRepository = mockk<ScanRepository>()
    private val scanExecutor = mockk<ScanExecutor>(relaxed = true)
    private val scanService = ScanService(scanRepository, scanExecutor)

    @Test
    fun `initiateScan should save scan and execute asynchronously`() {
        // Given
        val request = ScanRequest(
            domain = "example.com",
            tool = ScanTool.THEHARVESTER,
            limit = 100,
            sources = "google"
        )

        val savedScan = Scan(
            id = 1L,
            domain = request.domain,
            tool = request.tool,
            startTime = LocalDateTime.now(),
            status = ScanStatus.RUNNING
        )

        every { scanRepository.save(any()) } returns savedScan

        // When
        val result = scanService.initiateScan(request)

        // Then
        assertEquals(savedScan, result)
        assertEquals(ScanStatus.RUNNING, result.status)
        
        verify(exactly = 1) { scanRepository.save(any()) }
        verify(exactly = 1) { scanExecutor.executeScanAsync(1L, request) }
    }

    @Test
    fun `getAllScans should return list of scans`() {
        // Given
        val scan1 = Scan(id = 1L, domain = "a.com", tool = ScanTool.AMASS, startTime = LocalDateTime.now(), status = ScanStatus.COMPLETED)
        val scan2 = Scan(id = 2L, domain = "b.com", tool = ScanTool.THEHARVESTER, startTime = LocalDateTime.now().minusHours(1), status = ScanStatus.RUNNING)
        
        every { scanRepository.findAllByOrderByStartTimeDesc() } returns listOf(scan1, scan2)

        // When
        val result = scanService.getAllScans()

        // Then
        assertEquals(2, result.size)
        assertEquals(scan1, result[0])
        assertEquals(scan2, result[1])
        verify(exactly = 1) { scanRepository.findAllByOrderByStartTimeDesc() }
    }

    @Test
    fun `getScanById should return scan when found`() {
        // Given
        val scan = Scan(id = 1L, domain = "test.com", tool = ScanTool.AMASS, startTime = LocalDateTime.now(), status = ScanStatus.COMPLETED)
        every { scanRepository.findById(1L) } returns Optional.of(scan)

        // When
        val result = scanService.getScanById(1L)

        // Then
        assertNotNull(result)
        assertEquals(scan, result)
    }

    @Test
    fun `getScanById should return null when not found`() {
        // Given
        every { scanRepository.findById(99L) } returns Optional.empty()

        // When
        val result = scanService.getScanById(99L)

        // Then
        assertNull(result)
    }
    
    @Test
    fun `deleteAllScans should delete all via repository`() {
        // Given
        every { scanRepository.deleteAll() } returns Unit

        // When
        scanService.deleteAllScans()

        // Then
        verify(exactly = 1) { scanRepository.deleteAll() }
    }
}
