package com.tuangou;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class TuangouApplicationTests {

  @Test
  void contextLoads() {
    // smoke test: Spring context wires up under the H2-backed test profile
  }
}
