package com.tuangou.cart.web;

import com.tuangou.cart.dto.CartDto;
import com.tuangou.cart.dto.CartItemRequest;
import com.tuangou.cart.dto.CartItemUpdateRequest;
import com.tuangou.cart.dto.CartMergeRequest;
import com.tuangou.cart.service.CartService;
import com.tuangou.common.auth.AuthenticatedUser;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/cart")
public class CartController {

  private final CartService cartService;

  public CartController(CartService cartService) {
    this.cartService = cartService;
  }

  @GetMapping
  public CartDto getCart() {
    return cartService.getCart(AuthenticatedUser.currentUserId());
  }

  @PostMapping("/items")
  public CartDto addItem(@Valid @RequestBody CartItemRequest req) {
    return cartService.addItem(AuthenticatedUser.currentUserId(), req);
  }

  @PatchMapping("/items/{id}")
  public CartDto updateItem(@PathVariable UUID id, @Valid @RequestBody CartItemUpdateRequest req) {
    return cartService.updateItem(AuthenticatedUser.currentUserId(), id, req.quantity());
  }

  @DeleteMapping("/items/{id}")
  public CartDto deleteItem(@PathVariable UUID id) {
    return cartService.removeItem(AuthenticatedUser.currentUserId(), id);
  }

  @PostMapping("/merge")
  public CartDto merge(@RequestBody CartMergeRequest req) {
    return cartService.merge(AuthenticatedUser.currentUserId(), req == null ? null : req.items());
  }
}
