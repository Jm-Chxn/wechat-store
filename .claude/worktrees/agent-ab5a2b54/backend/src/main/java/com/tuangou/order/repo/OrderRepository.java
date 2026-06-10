package com.tuangou.order.repo;

import com.tuangou.order.entity.OrderEntity;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<OrderEntity, String> {
  List<OrderEntity> findByUserIdOrderByCreatedAtDesc(UUID userId);
}
