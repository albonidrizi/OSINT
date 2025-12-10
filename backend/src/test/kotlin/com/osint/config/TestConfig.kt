package com.osint.config

import com.github.dockerjava.api.DockerClient
import io.mockk.mockk
import org.springframework.boot.test.context.TestConfiguration
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Primary

@TestConfiguration
class TestConfig {

    @Bean
    @Primary
    fun dockerClient(): DockerClient {
        return mockk<DockerClient>(relaxed = true)
    }
}
