package com.tuangou.catalog.mapper;

import com.tuangou.catalog.dto.CategoryDto;
import com.tuangou.catalog.dto.ProductDto;
import com.tuangou.catalog.dto.ProductUpsertRequest;
import com.tuangou.catalog.entity.CategoryEntity;
import com.tuangou.catalog.entity.ProductEntity;
import java.util.List;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper
public interface CatalogMapper {

  CategoryDto toDto(CategoryEntity entity);

  default ProductDto toDto(ProductEntity entity) {
    if (entity == null) return null;
    List<String> tags =
        entity.getDietaryTags() == null ? List.of() : List.copyOf(entity.getDietaryTags());
    return new ProductDto(
        entity.getId(),
        entity.getSlug(),
        entity.getNameEn(),
        entity.getNameZh(),
        entity.getDescriptionEn(),
        entity.getDescriptionZh(),
        entity.getPriceCents(),
        entity.getPackSizeEn(),
        entity.getPackSizeZh(),
        entity.getStockStatus(),
        entity.getStockCount(),
        entity.getIsNew(),
        tags,
        entity.getImageUrl(),
        entity.getCategorySlug());
  }

  @Mapping(target = "createdAt", ignore = true)
  @Mapping(target = "updatedAt", ignore = true)
  @Mapping(target = "priceCents", source = "price")
  @Mapping(target = "dietaryTags", expression = "java(req.dietaryTags() == null ? new java.util.ArrayList<String>() : new java.util.ArrayList<String>(req.dietaryTags()))")
  ProductEntity toEntity(ProductUpsertRequest req);
}
