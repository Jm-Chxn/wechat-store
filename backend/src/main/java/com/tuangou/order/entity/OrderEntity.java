package com.tuangou.order.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderEntity {
  @Id
  @Column(name = "id", nullable = false)
  private String id;

  @Column(name = "user_id", columnDefinition = "uuid")
  private UUID userId;

  @Column(name = "guest_name")
  private String guestName;

  @Column(name = "subtotal_cents", nullable = false)
  private Integer subtotalCents;

  @Column(name = "delivery_fee_cents", nullable = false)
  private Integer deliveryFeeCents;

  @Column(name = "total_cents", nullable = false)
  private Integer totalCents;

  @Column(name = "status", nullable = false)
  private String status;

  @Column(name = "pickup_community_en")
  private String pickupCommunityEn;

  @Column(name = "pickup_community_zh")
  private String pickupCommunityZh;

  @Column(name = "created_at", insertable = false, updatable = false)
  private OffsetDateTime createdAt;

  @Column(name = "updated_at", insertable = false, updatable = false)
  private OffsetDateTime updatedAt;
}
