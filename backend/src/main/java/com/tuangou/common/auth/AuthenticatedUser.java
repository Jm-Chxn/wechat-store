package com.tuangou.common.auth;

import com.tuangou.common.error.ApiException;
import java.util.UUID;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;

public final class AuthenticatedUser {
  private AuthenticatedUser() {}

  public static UUID currentUserId() {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    if (auth == null || !auth.isAuthenticated()) {
      throw ApiException.unauthorized("not authenticated");
    }
    Object principal = auth.getPrincipal();
    if (principal instanceof Jwt jwt) {
      String sub = jwt.getSubject();
      if (sub == null) throw ApiException.unauthorized("no subject claim");
      return UUID.fromString(sub);
    }
    throw ApiException.unauthorized("unsupported principal");
  }

  public static UUID currentUserIdOrNull() {
    try {
      return currentUserId();
    } catch (Exception ex) {
      return null;
    }
  }
}
