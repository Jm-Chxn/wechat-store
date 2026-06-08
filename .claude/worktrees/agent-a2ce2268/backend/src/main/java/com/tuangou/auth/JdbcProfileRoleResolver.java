package com.tuangou.auth;

import java.util.UUID;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class JdbcProfileRoleResolver implements ProfileRoleResolver {

  private final JdbcTemplate jdbcTemplate;

  public JdbcProfileRoleResolver(JdbcTemplate jdbcTemplate) {
    this.jdbcTemplate = jdbcTemplate;
  }

  @Override
  public String resolveRole(UUID userId) {
    try {
      String role = jdbcTemplate.queryForObject(
          "SELECT role FROM profiles WHERE user_id = ?", String.class, userId);
      return role == null ? "user" : role;
    } catch (EmptyResultDataAccessException ex) {
      return "user";
    } catch (Exception ex) {
      return "user";
    }
  }
}
