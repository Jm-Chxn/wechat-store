package com.tuangou.catalog.service;

import com.tuangou.catalog.dto.CategoryDto;
import com.tuangou.catalog.dto.ProductDto;
import com.tuangou.catalog.dto.ProductUpsertRequest;
import com.tuangou.catalog.entity.ProductEntity;
import com.tuangou.catalog.mapper.CatalogMapper;
import com.tuangou.catalog.repo.CategoryRepository;
import com.tuangou.catalog.repo.ProductRepository;
import com.tuangou.common.error.ApiException;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CatalogService {
  private final ProductRepository products;
  private final CategoryRepository categories;
  private final CatalogMapper mapper;

  public CatalogService(ProductRepository products, CategoryRepository categories, CatalogMapper mapper) {
    this.products = products;
    this.categories = categories;
    this.mapper = mapper;
  }

  @Transactional(readOnly = true)
  public List<ProductDto> listProducts() {
    return products.findAll().stream().sorted(Comparator.comparing(ProductEntity::getId)).map(mapper::toDto).toList();
  }

  @Transactional(readOnly = true)
  public ProductDto getProduct(String slugOrId) {
    return products
        .findBySlug(slugOrId)
        .or(() -> products.findById(slugOrId))
        .map(mapper::toDto)
        .orElseThrow(() -> ApiException.notFound("product"));
  }

  @Transactional(readOnly = true)
  public List<CategoryDto> listCategories() {
    return categories.findAll().stream()
        .sorted(Comparator.comparing(c -> c.getSortOrder() == null ? 0 : c.getSortOrder()))
        .map(mapper::toDto).toList();
  }

  @Transactional
  public ProductDto upsert(ProductUpsertRequest req) {
    String id = req.id() == null || req.id().isBlank() ? "p_" + UUID.randomUUID().toString().substring(0, 8) : req.id();
    ProductEntity entity = mapper.toEntity(req);
    entity.setId(id);
    ProductEntity saved = products.save(entity);
    return mapper.toDto(saved);
  }

  @Transactional
  public void delete(String id) {
    if (!products.existsById(id)) throw ApiException.notFound("product");
    products.deleteById(id);
  }
}
