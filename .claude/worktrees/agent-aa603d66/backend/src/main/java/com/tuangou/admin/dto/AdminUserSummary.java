package com.tuangou.admin.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record AdminUserSummary(
    UUID userId,
    String nickname,
    String avatarUrl,
    String role,
    OffsetDateTime createdAt,
    OffsetDateTime lastSeenAt,
    int orderCount,
    int activityCount,
    int totalSpentCents
) {}
