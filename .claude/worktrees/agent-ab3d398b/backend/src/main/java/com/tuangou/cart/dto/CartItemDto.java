package com.tuangou.cart.dto;

import java.util.UUID;

public record CartItemDto(
    UUID id,
    String productId,
    Integer quantity,
    String nameEn,
    String nameZh,
    Integer unitPriceCents,
    String imageUrl
) {}
