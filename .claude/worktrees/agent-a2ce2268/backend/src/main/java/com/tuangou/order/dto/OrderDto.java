package com.tuangou.order.dto;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record OrderDto(
    String id,
    UUID userId,
    String guestName,
    Integer subtotalCents,
    Integer deliveryFeeCents,
    Integer totalCents,
    String status,
    String pickupCommunityEn,
    String pickupCommunityZh,
    OffsetDateTime createdAt,
    List<OrderItemDto> items
) {}
