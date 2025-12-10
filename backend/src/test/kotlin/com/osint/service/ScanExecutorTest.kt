package com.osint.service

import com.fasterxml.jackson.databind.ObjectMapper
import com.osint.dto.ScanRequest
import com.osint.model.Scan
import com.osint.model.ScanStatus
import com.osint.model.ScanTool
import com.osint.repository.ScanRepository
import io.mockk.every
import io.mockk.mockk
import io.mockk.slot
import io.mockk.verify
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Test
import java.time.LocalDateTime
import java.util.*

class ScanExecutorTest {

    private val scanRepository = mockk<ScanRepository>(relaxed = true)
    private val dockerService = mockk<DockerService>()
    private val objectMapper = mockk<ObjectMapper>()
    private val scanExecutor = ScanExecutor(scanRepository, dockerService, objectMapper)

    @Test
    fun `executeScanAsync should complete scan successfully`() {
        // Given
        val scanId = 1L
        val request = ScanRequest("example.com", ScanTool.THEHARVESTER)
        val initialScan = Scan(id = scanId, domain = "example.com", tool = ScanTool.THEHARVESTER, startTime = LocalDateTime.now(), status = ScanStatus.RUNNING)
        
        every { scanRepository.findById(scanId) } returns Optional.of(initialScan)
        every { dockerService.executeScan(any(), any(), any(), any()) } returns "raw output"
        every { dockerService.parseResults(any(), any()) } returns mapOf("emails" to listOf("admin@example.com"))
        every { objectMapper.writeValueAsString(any()) } returns """{"emails":["admin@example.com"]}"""
        
        val scanSlot = slot<Scan>()
        every { scanRepository.save(capture(scanSlot)) } returns initialScan

        // When
        scanExecutor.executeScanAsync(scanId, request)

        // Then
        verify(exactly = 1) { dockerService.executeScan("example.com", ScanTool.THEHARVESTER, null, null) }
        verify(exactly = 1) { scanRepository.save(any()) }
        
        val capturedScan = scanSlot.captured
        assertEquals(ScanStatus.COMPLETED, capturedScan.status)
        assertNotNull(capturedScan.endTime)
        assertEquals("""{"emails":["admin@example.com"]}""", capturedScan.results)
    }

    @Test
    fun `executeScanAsync should mark scan as failed on exception`() {
        // Given
        val scanId = 1L
        val request = ScanRequest("example.com", ScanTool.AMASS)
        val initialScan = Scan(id = scanId, domain = "example.com", tool = ScanTool.AMASS, startTime = LocalDateTime.now(), status = ScanStatus.RUNNING)
        
        every { scanRepository.findById(scanId) } returns Optional.of(initialScan)
        every { dockerService.executeScan(any(), any(), any(), any()) } throws RuntimeException("Docker error")
        
        val scanSlot = slot<Scan>()
        every { scanRepository.save(capture(scanSlot)) } returns initialScan

        // When
        scanExecutor.executeScanAsync(scanId, request)

        // Then
        verify(exactly = 1) { scanRepository.save(any()) }
        
        val capturedScan = scanSlot.captured
        assertEquals(ScanStatus.FAILED, capturedScan.status)
        assertNotNull(capturedScan.endTime)
        assertEquals("Docker error", capturedScan.errorMessage)
    }
}
