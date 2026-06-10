package com.tuangou.cart.repo;

import com.tuangou.cart.entity.CartItemEntity;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

public interface CartItemRepository extends JpaRepository<CartItemEntity, UUID> {
  List<CartItemEntity> findByCartId(UUID cartId);

  Optional<CartItemEntity> findByCartIdAndProductId(UUID cartId, String productId);

  @Transactional
  void deleteByCartId(UUID cartId);
}
