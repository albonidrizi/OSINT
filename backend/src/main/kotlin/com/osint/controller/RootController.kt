package com.osint.controller

import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RestController

@RestController
class RootController {

    @GetMapping("/")
    fun root(): ResponseEntity<Map<String, String>> {
        return ResponseEntity.ok(mapOf(
            "status" to "up",
            "message" to "OSINT API is running",
            "documentation" to "/api/swagger-ui.html (if enabled)",
            "endpoints" to "/api/scans"
        ))
    }
}
