package com.tuangou.order.web;

import com.tuangou.common.auth.AuthenticatedUser;
import com.tuangou.order.dto.OrderDto;
import com.tuangou.order.dto.PlaceOrderRequest;
import com.tuangou.order.service.OrderService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {
  private final OrderService orderService;

  public OrderController(OrderService orderService) {
    this.orderService = orderService;
  }

  @PostMapping
  public OrderDto place(@Valid @RequestBody PlaceOrderRequest req) {
    return orderService.place(AuthenticatedUser.currentUserId(), req);
  }

  @GetMapping
  public List<OrderDto> listMine() {
    return orderService.listForUser(AuthenticatedUser.currentUserId());
  }

  @GetMapping("/{id}")
  public OrderDto get(@PathVariable String id) {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    boolean isAdmin = auth != null && auth.getAuthorities().stream()
        .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
    return orderService.get(id, AuthenticatedUser.currentUserIdOrNull(), isAdmin);
  }
}
