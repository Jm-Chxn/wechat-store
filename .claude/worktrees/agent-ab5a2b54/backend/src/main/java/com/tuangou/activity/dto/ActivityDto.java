package com.tuangou.activity.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record ActivityDto(
    UUID id,
    String type,
    UUID userId,
    String anonId,
    String meta,
    OffsetDateTime createdAt
) {}
