package com.tuangou.admin.web;

import com.tuangou.activity.dto.ActivityDto;
import com.tuangou.activity.service.ActivityService;
import com.tuangou.admin.dto.AdminStats;
import com.tuangou.admin.dto.AdminUserSummary;
import com.tuangou.admin.service.AdminService;
import com.tuangou.catalog.dto.ProductDto;
import com.tuangou.catalog.dto.ProductUpsertRequest;
import com.tuangou.catalog.service.CatalogService;
import com.tuangou.common.auth.AuthenticatedUser;
import com.tuangou.order.dto.OrderDto;
import com.tuangou.order.dto.OrderStatusUpdateRequest;
import com.tuangou.order.service.OrderService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

  private final AdminService adminService;
  private final ActivityService activityService;
  private final OrderService orderService;
  private final CatalogService catalogService;

  public AdminController(AdminService adminService,
                         ActivityService activityService,
                         OrderService orderService,
                         CatalogService catalogService) {
    this.adminService = adminService;
    this.activityService = activityService;
    this.orderService = orderService;
    this.catalogService = catalogService;
  }

  @GetMapping("/activities")
  public List<ActivityDto> activities() {
    return activityService.listAll();
  }

  @GetMapping("/users")
  public List<AdminUserSummary> users() {
    return adminService.listUsers();
  }

  @GetMapping("/orders")
  public List<OrderDto> orders() {
    return orderService.listAll();
  }

  @PatchMapping("/orders/{id}")
  public OrderDto setOrderStatus(@PathVariable String id,
                                 @Valid @RequestBody OrderStatusUpdateRequest req) {
    return orderService.updateStatus(id, req.status(), AuthenticatedUser.currentUserId(), true);
  }

  @GetMapping("/stats")
  public AdminStats stats() {
    return adminService.stats();
  }

  @PostMapping("/products")
  public ProductDto createProduct(@Valid @RequestBody ProductUpsertRequest req) {
    return catalogService.upsert(req);
  }

  @PatchMapping("/products/{id}")
  public ProductDto updateProduct(@PathVariable String id,
                                  @Valid @RequestBody ProductUpsertRequest req) {
    ProductUpsertRequest withId = new ProductUpsertRequest(
        id, req.slug(), req.nameEn(), req.nameZh(),
        req.descriptionEn(), req.descriptionZh(),
        req.price(), req.packSizeEn(), req.packSizeZh(),
        req.stockStatus(), req.stockCount(), req.isNew(),
        req.dietaryTags(), req.imageUrl(), req.categorySlug());
    return catalogService.upsert(withId);
  }

  @DeleteMapping("/products/{id}")
  public ResponseEntity<Void> deleteProduct(@PathVariable String id) {
    catalogService.delete(id);
    return ResponseEntity.noContent().build();
  }
}
