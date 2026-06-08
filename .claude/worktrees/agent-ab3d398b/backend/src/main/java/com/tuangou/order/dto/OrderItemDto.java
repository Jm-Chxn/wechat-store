package com.tuangou.order.dto;

public record OrderItemDto(
    String productId,
    String nameEn,
    String nameZh,
    String imageUrl,
    Integer unitPriceCents,
    Integer quantity
) {}
