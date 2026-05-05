package com.tuangou.auth;

import java.util.UUID;

/** Resolves the {@code profiles.role} column for a user UUID. */
public interface ProfileRoleResolver {
  /**
   * @param userId Supabase auth.users.id
   * @return {@code "admin"} or {@code "user"} (default if no row found or on lookup failure).
   */
  String resolveRole(UUID userId);
}
