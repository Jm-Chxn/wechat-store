package com.tuangou.common;

import java.time.Instant;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {

  @GetMapping("/")
  public Map<String, String> root() {
    return Map.of(
        "name", "tuangou-backend",
        "status", "ok",
        "timestamp", Instant.now().toString()
    );
  }

  @GetMapping("/health")
  public Map<String, String> health() {
    return Map.of("status", "UP", "timestamp", Instant.now().toString());
  }
}
