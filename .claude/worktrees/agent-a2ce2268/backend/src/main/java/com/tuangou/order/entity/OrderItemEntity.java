package com.tuangou.order.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "order_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItemEntity {
  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  @Column(name = "id", columnDefinition = "uuid")
  private UUID id;

  @Column(name = "order_id", nullable = false)
  private String orderId;

  @Column(name = "product_id", nullable = false)
  private String productId;

  @Column(name = "name_en", nullable = false)
  private String nameEn;

  @Column(name = "name_zh", nullable = false)
  private String nameZh;

  @Column(name = "image_url")
  private String imageUrl;

  @Column(name = "unit_price_cents", nullable = false)
  private Integer unitPriceCents;

  @Column(name = "quantity", nullable = false)
  private Integer quantity;
}
