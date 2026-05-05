package com.tuangou.admin.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfileEntity {
  @Id
  @Column(name = "user_id", columnDefinition = "uuid")
  private UUID userId;

  @Column(name = "nickname")
  private String nickname;

  @Column(name = "avatar_url")
  private String avatarUrl;

  @Column(name = "locale", nullable = false)
  private String locale;

  @Column(name = "role", nullable = false)
  private String role;

  @Column(name = "created_at", nullable = false, insertable = false, updatable = false)
  private OffsetDateTime createdAt;

  @Column(name = "last_seen_at")
  private OffsetDateTime lastSeenAt;
}
