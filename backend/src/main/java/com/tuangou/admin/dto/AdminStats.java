package com.tuangou.admin.dto;

import java.util.List;

public record AdminStats(
    int totalUsers,
    int ordersToday,
    int revenueTodayCents,
    String topCategorySlug,
    List<DayBucket> ordersLast7d,
    List<CategoryRevenue> revenueByCategory
) {
  public record DayBucket(String date, int orders, int revenue) {}
  public record CategoryRevenue(String categorySlug, int revenue) {}
}
