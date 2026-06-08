package com.tuangou.admin.service;

import com.tuangou.activity.entity.ActivityEntity;
import com.tuangou.activity.repo.ActivityRepository;
import com.tuangou.admin.dto.AdminStats;
import com.tuangou.admin.dto.AdminUserSummary;
import com.tuangou.admin.entity.ProfileEntity;
import com.tuangou.admin.repo.ProfileRepository;
import com.tuangou.catalog.entity.ProductEntity;
import com.tuangou.catalog.repo.ProductRepository;
import com.tuangou.order.entity.OrderEntity;
import com.tuangou.order.entity.OrderItemEntity;
import com.tuangou.order.repo.OrderItemRepository;
import com.tuangou.order.repo.OrderRepository;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminService {

  private final ProfileRepository profiles;
  private final OrderRepository orders;
  private final OrderItemRepository orderItems;
  private final ActivityRepository activities;
  private final ProductRepository products;

  public AdminService(ProfileRepository profiles,
                      OrderRepository orders,
                      OrderItemRepository orderItems,
                      ActivityRepository activities,
                      ProductRepository products) {
    this.profiles = profiles;
    this.orders = orders;
    this.orderItems = orderItems;
    this.activities = activities;
    this.products = products;
  }

  @Transactional(readOnly = true)
  public List<AdminUserSummary> listUsers() {
    List<ProfileEntity> all = profiles.findAll();
    Map<UUID, Integer> orderCountByUser = new HashMap<>();
    Map<UUID, Integer> totalSpentByUser = new HashMap<>();
    for (OrderEntity o : orders.findAll()) {
      if (o.getUserId() == null) continue;
      orderCountByUser.merge(o.getUserId(), 1, Integer::sum);
      totalSpentByUser.merge(o.getUserId(), o.getTotalCents(), Integer::sum);
    }
    Map<UUID, Integer> activityCountByUser = new HashMap<>();
    for (ActivityEntity a : activities.findAll()) {
      if (a.getUserId() == null) continue;
      activityCountByUser.merge(a.getUserId(), 1, Integer::sum);
    }
    List<AdminUserSummary> out = new ArrayList<>(all.size());
    for (ProfileEntity p : all) {
      out.add(new AdminUserSummary(
          p.getUserId(), p.getNickname(), p.getAvatarUrl(), p.getRole(),
          p.getCreatedAt(), p.getLastSeenAt(),
          orderCountByUser.getOrDefault(p.getUserId(), 0),
          activityCountByUser.getOrDefault(p.getUserId(), 0),
          totalSpentByUser.getOrDefault(p.getUserId(), 0)));
    }
    out.sort(Comparator.comparing(
        (AdminUserSummary s) -> s.lastSeenAt() == null ? OffsetDateTime.MIN : s.lastSeenAt()).reversed());
    return out;
  }

  @Transactional(readOnly = true)
  public AdminStats stats() {
    List<OrderEntity> all = orders.findAll();
    OffsetDateTime startOfToday = LocalDate.now().atStartOfDay().atOffset(ZoneOffset.UTC);
    int ordersToday = 0;
    int revenueToday = 0;
    for (OrderEntity o : all) {
      if (o.getCreatedAt() != null && o.getCreatedAt().isAfter(startOfToday)) {
        ordersToday++;
        revenueToday += o.getTotalCents();
      }
    }

    Set<UUID> seenUsers = new HashSet<>();
    activities.findAll().forEach(a -> { if (a.getUserId() != null) seenUsers.add(a.getUserId()); });
    int totalUsers = seenUsers.size();

    List<AdminStats.DayBucket> last7 = new ArrayList<>(7);
    for (int i = 6; i >= 0; i--) {
      LocalDate d = LocalDate.now().minusDays(i);
      OffsetDateTime windowStart = d.atStartOfDay().atOffset(ZoneOffset.UTC);
      OffsetDateTime windowEnd = windowStart.plusDays(1);
      int dayOrders = 0;
      int dayRevenue = 0;
      for (OrderEntity o : all) {
        if (o.getCreatedAt() == null) continue;
        if (!o.getCreatedAt().isBefore(windowStart) && o.getCreatedAt().isBefore(windowEnd)) {
          dayOrders++;
          dayRevenue += o.getTotalCents();
        }
      }
      last7.add(new AdminStats.DayBucket(
          (d.getMonthValue()) + "/" + d.getDayOfMonth(),
          dayOrders, dayRevenue / 100));
    }

    Map<String, String> productCategory = new HashMap<>();
    for (ProductEntity p : products.findAll()) productCategory.put(p.getId(), p.getCategorySlug());
    Map<String, Integer> revenueByCat = new HashMap<>();
    for (OrderItemEntity i : orderItems.findAll()) {
      String cat = productCategory.get(i.getProductId());
      if (cat == null) continue;
      revenueByCat.merge(cat, i.getUnitPriceCents() * i.getQuantity(), Integer::sum);
    }
    List<AdminStats.CategoryRevenue> revenueList = revenueByCat.entrySet().stream()
        .map(e -> new AdminStats.CategoryRevenue(e.getKey(), e.getValue()))
        .sorted((a, b) -> b.revenue() - a.revenue())
        .toList();
    String topCategory = revenueList.isEmpty() ? null : revenueList.get(0).categorySlug();

    return new AdminStats(totalUsers, ordersToday, revenueToday, topCategory, last7, revenueList);
  }
}
