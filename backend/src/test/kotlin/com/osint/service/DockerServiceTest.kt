package com.osint.service

import com.github.dockerjava.api.DockerClient
import com.osint.model.ScanTool
import io.mockk.mockk
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test

class DockerServiceTest {

    private val dockerClient = mockk<DockerClient>(relaxed = true)
    private val dockerService = DockerService(dockerClient)

    @Test
    fun `parseTheHarvesterResults should parse correctly`() {
        // Given
        val output = """
            *******************************************************************
            *  _   _                                            _             *
            * | |_| |__   ___    /\  /\__ _ _ ____   _____  ___| |_ ___ _ __  *
            * | __| '_ \ / _ \  / /_/ / _` | '__\ \ / / _ \/ __| __/ _ \ '__| *
            * | |_| | | |  __/ / __  / (_| | |   \ V /  __/\__ \ ||  __/ |    *
            *  \__|_| |_|\___| \/ /_/ \__,_|_|    \_/ \___||___/\__\___|_|    *
            *                                                                 *
            * theHarvester 4.2.0                                              *
            * Coded by Christian Martorella                                   *
            * Edge-Security Research                                          *
            * cmartorella@edge-security.com                                   *
            *                                                                 *
            *******************************************************************
            
            [*] Target: example.com
            
            [*] Searching google.
            
            [*] Users found: 2
            ---------------------
            user1@example.com
            user2@example.com
            
            [*] Hosts found: 3
            ---------------------
            sub1.example.com:1.2.3.4
            sub2.example.com
            sub3.example.com:5.6.7.8
            
            [*] IPs found: 1
            ---------------------
            1.2.3.4
        """.trimIndent()

        // When
        val result = dockerService.parseResults(ScanTool.THEHARVESTER, output)

        // Then
        val emails = result["emails"] as List<*>
        val hosts = result["hosts"] as List<*>
        val ips = result["ips"] as List<*>

        assertEquals(2, emails.size)
        assertEquals("user1@example.com", emails[0])
        assertEquals("user2@example.com", emails[1])

        assertEquals(3, hosts.size)
        assertEquals("sub1.example.com:1.2.3.4", hosts[0])
        assertEquals("sub2.example.com", hosts[1])
        assertEquals("sub3.example.com:5.6.7.8", hosts[2])

        assertEquals(2, ips.size) // 1.2.3.4 and 5.6.7.8 are both in the output as part of hosts and discovery
        assertEquals("1.2.3.4", ips[0])
        assertEquals("5.6.7.8", ips[1])
    }

    @Test
    fun `parseAmassResults should parse correctly`() {
        // Given
        val output = """
            [google] sub1.example.com 1.2.3.4
            [bing] sub2.example.com
            [yandex] sub3.example.com 5.6.7.8
            [yahoo] sub4.example.com
        """.trimIndent()

        // When
        val result = dockerService.parseResults(ScanTool.AMASS, output)

        // Then
        val subdomains = result["subdomains"] as List<*>
        val ips = result["ips"] as List<*>

        assertEquals(6, subdomains.size)
        // Set contains:
        // sub1.example.com (naked)
        // sub1.example.com 1.2.3.4 (discovery)
        // sub2.example.com (naked and discovery match)
        // sub3.example.com (naked)
        // sub3.example.com 5.6.7.8 (discovery)
        // sub4.example.com (naked and discovery match)
        assertEquals("sub1.example.com", subdomains[0])
        assertEquals("sub1.example.com 1.2.3.4", subdomains[1])
        assertEquals("sub2.example.com", subdomains[2])
        assertEquals("sub3.example.com", subdomains[3])
        assertEquals("sub3.example.com 5.6.7.8", subdomains[4])
        assertEquals("sub4.example.com", subdomains[5])
        
        assertEquals(2, ips.size)
        assertEquals("1.2.3.4", ips[0])
        assertEquals("5.6.7.8", ips[1])
    }
}
