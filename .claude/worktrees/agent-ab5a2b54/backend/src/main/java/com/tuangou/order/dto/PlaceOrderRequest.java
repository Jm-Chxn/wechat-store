package com.tuangou.order.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record PlaceOrderRequest(
    @NotEmpty @Valid List<OrderLineRequest> items,
    String pickupCommunityEn,
    String pickupCommunityZh,
    String guestName
) {
  public record OrderLineRequest(
      @NotBlank String productId,
      @NotNull @Min(1) Integer quantity
  ) {}
}
