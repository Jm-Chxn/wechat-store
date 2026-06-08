package com.tuangou.cart.dto;

import java.util.List;

public record CartMergeRequest(List<CartItemRequest> items) {}
