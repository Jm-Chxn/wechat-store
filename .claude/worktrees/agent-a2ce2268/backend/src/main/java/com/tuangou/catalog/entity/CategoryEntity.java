package com.tuangou.catalog.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "categories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryEntity {
  @Id
  @Column(name = "slug", nullable = false)
  private String slug;

  @Column(name = "name_en", nullable = false)
  private String nameEn;

  @Column(name = "name_zh", nullable = false)
  private String nameZh;

  @Column(name = "icon_name", nullable = false)
  private String iconName;

  @Column(name = "blurb_en")
  private String blurbEn;

  @Column(name = "blurb_zh")
  private String blurbZh;

  @Column(name = "sort_order", nullable = false)
  private Integer sortOrder;
}
