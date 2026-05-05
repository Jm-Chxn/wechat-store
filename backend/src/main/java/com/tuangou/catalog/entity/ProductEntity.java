package com.tuangou.catalog.entity;

import com.tuangou.common.jpa.StringListConverter;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductEntity {
  @Id
  @Column(name = "id", nullable = false)
  private String id;

  @Column(name = "slug", nullable = false, unique = true)
  private String slug;

  @Column(name = "name_en", nullable = false)
  private String nameEn;

  @Column(name = "name_zh", nullable = false)
  private String nameZh;

  @Column(name = "description_en")
  private String descriptionEn;

  @Column(name = "description_zh")
  private String descriptionZh;

  @Column(name = "price_cents", nullable = false)
  private Integer priceCents;

  @Column(name = "pack_size_en")
  private String packSizeEn;

  @Column(name = "pack_size_zh")
  private String packSizeZh;

  @Column(name = "stock_status", nullable = false)
  private String stockStatus;

  @Column(name = "stock_count", nullable = false)
  private Integer stockCount;

  @Column(name = "is_new", nullable = false)
  private Boolean isNew;

  @Convert(converter = StringListConverter.class)
  @Column(name = "dietary_tags", nullable = false)
  private List<String> dietaryTags;

  @Column(name = "image_url")
  private String imageUrl;

  @Column(name = "category_slug", nullable = false)
  private String categorySlug;

  @Column(name = "created_at", nullable = false, insertable = false, updatable = false)
  private OffsetDateTime createdAt;

  @Column(name = "updated_at", nullable = false, insertable = false, updatable = false)
  private OffsetDateTime updatedAt;
}
