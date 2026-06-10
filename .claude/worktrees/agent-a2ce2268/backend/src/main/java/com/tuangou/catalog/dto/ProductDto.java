package com.tuangou.catalog.dto;

import java.util.List;

public record ProductDto(
    String id,
    String slug,
    String nameEn,
    String nameZh,
    String descriptionEn,
    String descriptionZh,
    Integer price,
    String packSizeEn,
    String packSizeZh,
    String stockStatus,
    Integer stockCount,
    Boolean isNew,
    List<String> dietaryTags,
    String imageUrl,
    String categorySlug
) {}
