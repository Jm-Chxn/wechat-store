package com.tuangou.cart.dto;

import java.util.List;
import java.util.UUID;

public record CartDto(UUID cartId, List<CartItemDto> items, Integer subtotalCents) {}
