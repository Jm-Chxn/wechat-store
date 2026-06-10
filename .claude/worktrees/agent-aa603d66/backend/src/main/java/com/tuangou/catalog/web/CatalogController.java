package com.tuangou.catalog.web;

import com.tuangou.catalog.dto.CategoryDto;
import com.tuangou.catalog.dto.ProductDto;
import com.tuangou.catalog.service.CatalogService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class CatalogController {
  private final CatalogService service;

  public CatalogController(CatalogService service) {
    this.service = service;
  }

  @GetMapping("/products")
  public List<ProductDto> listProducts() {
    return service.listProducts();
  }

  @GetMapping("/products/{slug}")
  public ProductDto getProduct(@PathVariable String slug) {
    return service.getProduct(slug);
  }

  @GetMapping("/categories")
  public List<CategoryDto> listCategories() {
    return service.listCategories();
  }
}
