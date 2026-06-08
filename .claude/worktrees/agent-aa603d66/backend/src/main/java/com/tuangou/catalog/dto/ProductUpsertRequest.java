package com.tuangou.catalog.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record ProductUpsertRequest(
    String id,
    @NotBlank String slug,
    @NotBlank String nameEn,
    @NotBlank String nameZh,
    String descriptionEn,
    String descriptionZh,
    @NotNull @Min(0) Integer price,
    String packSizeEn,
    String packSizeZh,
    @NotBlank String stockStatus,
    @NotNull @Min(0) Integer stockCount,
    Boolean isNew,
    List<String> dietaryTags,
    String imageUrl,
    @NotBlank String categorySlug
) {}
