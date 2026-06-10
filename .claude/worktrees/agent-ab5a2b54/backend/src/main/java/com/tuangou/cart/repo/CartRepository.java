package com.tuangou.cart.repo;

import com.tuangou.cart.entity.CartEntity;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CartRepository extends JpaRepository<CartEntity, UUID> {
  Optional<CartEntity> findByUserId(UUID userId);
}
