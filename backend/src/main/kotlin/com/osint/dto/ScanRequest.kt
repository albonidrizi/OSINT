package com.osint.dto

import com.osint.model.ScanTool

data class ScanRequest(
    val domain: String,
    val tool: ScanTool,
    val limit: Int? = null,
    val sources: String? = null
)

