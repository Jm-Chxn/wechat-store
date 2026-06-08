package com.tuangou.order.repo;

import com.tuangou.order.entity.OrderItemEntity;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderItemRepository extends JpaRepository<OrderItemEntity, UUID> {
  List<OrderItemEntity> findByOrderId(String orderId);
}
