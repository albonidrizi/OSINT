package com.osint.controller

import com.fasterxml.jackson.databind.ObjectMapper
import com.osint.dto.ScanRequest
import com.osint.model.Scan
import com.osint.model.ScanStatus
import com.osint.model.ScanTool
import com.osint.service.ScanService
import com.ninjasquad.springmockk.MockkBean
import io.mockk.every
import io.mockk.verify
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*
import java.time.LocalDateTime

@WebMvcTest(ScanController::class)
class ScanControllerTest(@Autowired val mockMvc: MockMvc, @Autowired val objectMapper: ObjectMapper) {

    @MockkBean
    private lateinit var scanService: ScanService

    @Test
    fun `initiateScan should return 201 when request is valid`() {
        // Given
        val request = ScanRequest("example.com", ScanTool.THEHARVESTER)
        val scan = Scan(id = 1L, domain = "example.com", tool = ScanTool.THEHARVESTER, startTime = LocalDateTime.now(), status = ScanStatus.RUNNING)
        
        every { scanService.initiateScan(any()) } returns scan

        // When/Then
        mockMvc.perform(post("/api/scans")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.domain").value("example.com"))
            .andExpect(jsonPath("$.status").value("RUNNING"))
            
        verify(exactly = 1) { scanService.initiateScan(any()) }
    }

    @Test
    fun `initiateScan should return 400 when domain is blank`() {
        // Given
        val request = ScanRequest("", ScanTool.THEHARVESTER)

        // When/Then
        mockMvc.perform(post("/api/scans")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isBadRequest)
            
        verify(exactly = 0) { scanService.initiateScan(any()) }
    }

    @Test
    fun `getAllScans should return 200 and list of scans`() {
        // Given
        val scan = Scan(id = 1L, domain = "example.com", tool = ScanTool.AMASS, startTime = LocalDateTime.now(), status = ScanStatus.COMPLETED)
        every { scanService.getAllScans() } returns listOf(scan)

        // When/Then
        mockMvc.perform(get("/api/scans"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$[0].id").value(1))
            .andExpect(jsonPath("$[0].domain").value("example.com"))
            
        verify(exactly = 1) { scanService.getAllScans() }
    }

    @Test
    fun `getScanById should return 200 when found`() {
        // Given
        val scan = Scan(id = 1L, domain = "example.com", tool = ScanTool.AMASS, startTime = LocalDateTime.now(), status = ScanStatus.COMPLETED)
        every { scanService.getScanById(1L) } returns scan

        // When/Then
        mockMvc.perform(get("/api/scans/1"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.id").value(1))
            
        verify(exactly = 1) { scanService.getScanById(1L) }
    }

    @Test
    fun `getScanById should return 404 when not found`() {
        // Given
        every { scanService.getScanById(99L) } returns null

        // When/Then
        mockMvc.perform(get("/api/scans/99"))
            .andExpect(status().isNotFound)
            
        verify(exactly = 1) { scanService.getScanById(99L) }
    }

    @Test
    fun `deleteAllScans should return 204`() {
        // Given
        every { scanService.deleteAllScans() } returns Unit

        // When/Then
        mockMvc.perform(delete("/api/scans"))
            .andExpect(status().isNoContent)
            
        verify(exactly = 1) { scanService.deleteAllScans() }
    }
}
