package com.tuangou.cart.service;

import com.tuangou.cart.dto.CartDto;
import com.tuangou.cart.dto.CartItemDto;
import com.tuangou.cart.dto.CartItemRequest;
import com.tuangou.cart.entity.CartEntity;
import com.tuangou.cart.entity.CartItemEntity;
import com.tuangou.cart.repo.CartItemRepository;
import com.tuangou.cart.repo.CartRepository;
import com.tuangou.catalog.entity.ProductEntity;
import com.tuangou.catalog.repo.ProductRepository;
import com.tuangou.common.error.ApiException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CartService {

  private final CartRepository carts;
  private final CartItemRepository cartItems;
  private final ProductRepository products;

  public CartService(CartRepository carts, CartItemRepository cartItems, ProductRepository products) {
    this.carts = carts;
    this.cartItems = cartItems;
    this.products = products;
  }

  @Transactional
  public CartDto getCart(UUID userId) {
    CartEntity cart = carts.findByUserId(userId).orElseGet(() -> carts.save(CartEntity.builder().userId(userId).build()));
    return toDto(cart);
  }

  @Transactional
  public CartDto addItem(UUID userId, CartItemRequest req) {
    products.findById(req.productId()).orElseThrow(() -> ApiException.notFound("product"));
    CartEntity cart = carts.findByUserId(userId).orElseGet(() -> carts.save(CartEntity.builder().userId(userId).build()));
    CartItemEntity item = cartItems.findByCartIdAndProductId(cart.getId(), req.productId()).orElse(null);
    if (item == null) {
      cartItems.save(CartItemEntity.builder()
          .cartId(cart.getId())
          .productId(req.productId())
          .quantity(req.quantity())
          .build());
    } else {
      item.setQuantity(item.getQuantity() + req.quantity());
      cartItems.save(item);
    }
    return toDto(cart);
  }

  @Transactional
  public CartDto updateItem(UUID userId, UUID itemId, Integer quantity) {
    CartEntity cart = carts.findByUserId(userId).orElseThrow(() -> ApiException.notFound("cart"));
    CartItemEntity item = cartItems.findById(itemId).orElseThrow(() -> ApiException.notFound("cart item"));
    if (!item.getCartId().equals(cart.getId())) throw ApiException.notFound("cart item");
    if (quantity <= 0) {
      cartItems.delete(item);
    } else {
      item.setQuantity(quantity);
      cartItems.save(item);
    }
    return toDto(cart);
  }

  @Transactional
  public CartDto removeItem(UUID userId, UUID itemId) {
    CartEntity cart = carts.findByUserId(userId).orElseThrow(() -> ApiException.notFound("cart"));
    CartItemEntity item = cartItems.findById(itemId).orElseThrow(() -> ApiException.notFound("cart item"));
    if (!item.getCartId().equals(cart.getId())) throw ApiException.notFound("cart item");
    cartItems.delete(item);
    return toDto(cart);
  }

  @Transactional
  public CartDto merge(UUID userId, List<CartItemRequest> guestItems) {
    CartEntity cart = carts.findByUserId(userId).orElseGet(() -> carts.save(CartEntity.builder().userId(userId).build()));
    if (guestItems == null) return toDto(cart);
    Map<String, CartItemEntity> existingByProduct = new HashMap<>();
    for (CartItemEntity ci : cartItems.findByCartId(cart.getId())) {
      existingByProduct.put(ci.getProductId(), ci);
    }
    for (CartItemRequest g : guestItems) {
      if (g == null || g.productId() == null || g.quantity() == null || g.quantity() <= 0) continue;
      if (!products.existsById(g.productId())) continue;
      CartItemEntity existing = existingByProduct.get(g.productId());
      if (existing == null) {
        CartItemEntity created = cartItems.save(CartItemEntity.builder()
            .cartId(cart.getId())
            .productId(g.productId())
            .quantity(g.quantity())
            .build());
        existingByProduct.put(g.productId(), created);
      } else {
        existing.setQuantity(existing.getQuantity() + g.quantity());
        cartItems.save(existing);
      }
    }
    return toDto(cart);
  }

  CartDto toDto(CartEntity cart) {
    List<CartItemEntity> items = cartItems.findByCartId(cart.getId());
    Map<String, ProductEntity> byId = new HashMap<>();
    products.findAllById(items.stream().map(CartItemEntity::getProductId).toList())
        .forEach(p -> byId.put(p.getId(), p));
    int subtotal = 0;
    List<CartItemDto> dto = new ArrayList<>(items.size());
    for (CartItemEntity i : items) {
      ProductEntity p = byId.get(i.getProductId());
      int unit = p == null ? 0 : p.getPriceCents();
      subtotal += unit * i.getQuantity();
      dto.add(new CartItemDto(
          i.getId(), i.getProductId(), i.getQuantity(),
          p == null ? null : p.getNameEn(), p == null ? null : p.getNameZh(),
          unit, p == null ? null : p.getImageUrl()));
    }
    return new CartDto(cart.getId(), dto, subtotal);
  }
}
