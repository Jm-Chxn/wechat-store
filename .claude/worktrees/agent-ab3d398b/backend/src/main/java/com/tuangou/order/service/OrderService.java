package com.tuangou.order.service;

import com.tuangou.cart.entity.CartEntity;
import com.tuangou.cart.repo.CartItemRepository;
import com.tuangou.cart.repo.CartRepository;
import com.tuangou.catalog.entity.ProductEntity;
import com.tuangou.catalog.repo.ProductRepository;
import com.tuangou.common.error.ApiException;
import com.tuangou.order.dto.OrderDto;
import com.tuangou.order.dto.OrderItemDto;
import com.tuangou.order.dto.PlaceOrderRequest;
import com.tuangou.order.entity.OrderEntity;
import com.tuangou.order.entity.OrderItemEntity;
import com.tuangou.order.repo.OrderItemRepository;
import com.tuangou.order.repo.OrderRepository;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrderService {

  private static final int FREE_DELIVERY_THRESHOLD_CENTS = 5000;
  private static final int DEFAULT_DELIVERY_FEE_CENTS = 199;

  private final OrderRepository orders;
  private final OrderItemRepository orderItems;
  private final ProductRepository products;
  private final CartRepository carts;
  private final CartItemRepository cartItems;

  public OrderService(OrderRepository orders,
                      OrderItemRepository orderItems,
                      ProductRepository products,
                      CartRepository carts,
                      CartItemRepository cartItems) {
    this.orders = orders;
    this.orderItems = orderItems;
    this.products = products;
    this.carts = carts;
    this.cartItems = cartItems;
  }

  @Transactional
  public OrderDto place(UUID userId, PlaceOrderRequest req) {
    if (req.items() == null || req.items().isEmpty()) throw ApiException.badRequest("items required");

    Map<String, ProductEntity> byId = new HashMap<>();
    products.findAllById(req.items().stream().map(PlaceOrderRequest.OrderLineRequest::productId).toList())
        .forEach(p -> byId.put(p.getId(), p));

    int subtotal = 0;
    List<OrderItemEntity> items = new ArrayList<>();
    String orderId = "ord_" + UUID.randomUUID().toString().substring(0, 12);
    for (PlaceOrderRequest.OrderLineRequest line : req.items()) {
      ProductEntity p = byId.get(line.productId());
      if (p == null) throw ApiException.notFound("product " + line.productId());
      int unit = p.getPriceCents();
      subtotal += unit * line.quantity();
      items.add(OrderItemEntity.builder()
          .orderId(orderId)
          .productId(p.getId())
          .nameEn(p.getNameEn())
          .nameZh(p.getNameZh())
          .imageUrl(p.getImageUrl())
          .unitPriceCents(unit)
          .quantity(line.quantity())
          .build());
    }

    int deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD_CENTS ? 0 : DEFAULT_DELIVERY_FEE_CENTS;
    int total = subtotal + deliveryFee;

    OrderEntity order = OrderEntity.builder()
        .id(orderId)
        .userId(userId)
        .guestName(req.guestName())
        .subtotalCents(subtotal)
        .deliveryFeeCents(deliveryFee)
        .totalCents(total)
        .status("CONFIRMED")
        .pickupCommunityEn(req.pickupCommunityEn())
        .pickupCommunityZh(req.pickupCommunityZh())
        .build();
    orders.save(order);
    orderItems.saveAll(items);

    if (userId != null) {
      carts.findByUserId(userId).ifPresent((CartEntity c) -> cartItems.deleteByCartId(c.getId()));
    }

    return toDto(order, items);
  }

  @Transactional(readOnly = true)
  public List<OrderDto> listForUser(UUID userId) {
    List<OrderEntity> all = orders.findByUserIdOrderByCreatedAtDesc(userId);
    return all.stream().map(o -> toDto(o, orderItems.findByOrderId(o.getId()))).toList();
  }

  @Transactional(readOnly = true)
  public OrderDto get(String orderId, UUID userId, boolean isAdmin) {
    OrderEntity o = orders.findById(orderId).orElseThrow(() -> ApiException.notFound("order"));
    if (!isAdmin && (o.getUserId() == null || !o.getUserId().equals(userId))) {
      throw ApiException.notFound("order");
    }
    return toDto(o, orderItems.findByOrderId(o.getId()));
  }

  @Transactional
  public OrderDto updateStatus(String orderId, String status) {
    OrderEntity o = orders.findById(orderId).orElseThrow(() -> ApiException.notFound("order"));
    if (!List.of("CONFIRMED", "PROCESSING", "COMPLETED", "CANCELLED").contains(status)) {
      throw ApiException.badRequest("invalid status");
    }
    o.setStatus(status);
    orders.save(o);
    return toDto(o, orderItems.findByOrderId(o.getId()));
  }

  @Transactional(readOnly = true)
  public List<OrderDto> listAll() {
    return orders.findAll().stream()
        .sorted((a, b) -> b.getCreatedAt() == null ? -1
            : (a.getCreatedAt() == null ? 1 : b.getCreatedAt().compareTo(a.getCreatedAt())))
        .map(o -> toDto(o, orderItems.findByOrderId(o.getId())))
        .toList();
  }

  OrderDto toDto(OrderEntity o, List<OrderItemEntity> items) {
    List<OrderItemDto> dtos = items.stream().map(i ->
        new OrderItemDto(i.getProductId(), i.getNameEn(), i.getNameZh(),
            i.getImageUrl(), i.getUnitPriceCents(), i.getQuantity())).toList();
    return new OrderDto(o.getId(), o.getUserId(), o.getGuestName(),
        o.getSubtotalCents(), o.getDeliveryFeeCents(), o.getTotalCents(),
        o.getStatus(), o.getPickupCommunityEn(), o.getPickupCommunityZh(),
        o.getCreatedAt(), dtos);
  }
}
