import { type NextRequest } from "next/server";
import { requireAdmin } from "@/app/api/_lib/auth";
import { createAdminClient } from "@/app/api/_lib/supabase-admin";
import { apiError, ok } from "@/app/api/_lib/response";

export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  const supabase = createAdminClient();

  // Total users
  const { count: totalUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  // Today's date range
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const { data: todayOrders } = await supabase
    .from("orders")
    .select("total_cents, created_at")
    .gte("created_at", todayStart.toISOString())
    .lte("created_at", todayEnd.toISOString());

  const ordersToday = todayOrders?.length ?? 0;
  const revenueTodayCents = (todayOrders ?? []).reduce(
    (sum, o) => sum + (o.total_cents ?? 0),
    0,
  );

  // Last 7 days breakdown
  const ordersLast7d: { date: string; orders: number; revenue: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const day = new Date();
    day.setDate(day.getDate() - i);
    day.setHours(0, 0, 0, 0);
    const dayEnd = new Date(day);
    dayEnd.setHours(23, 59, 59, 999);

    const { data: dayOrders } = await supabase
      .from("orders")
      .select("total_cents")
      .gte("created_at", day.toISOString())
      .lte("created_at", dayEnd.toISOString());

    const dateStr = day.toISOString().slice(0, 10);
    const dayRevenueCents = (dayOrders ?? []).reduce(
      (sum, o) => sum + (o.total_cents ?? 0),
      0,
    );
    ordersLast7d.push({
      date: dateStr,
      orders: dayOrders?.length ?? 0,
      revenue: dayRevenueCents / 100, // dollars
    });
  }

  // Revenue by category (via order_items → products)
  const { data: orderItems } = await supabase
    .from("order_items")
    .select("unit_price_cents, quantity, product_id, products(category_slug)");

  const categoryRevenue = new Map<string, number>();
  for (const item of orderItems ?? []) {
    const products = item.products as { category_slug?: string } | null;
    const slug = products?.category_slug;
    if (!slug) continue;
    const rev = (item.unit_price_cents ?? 0) * (item.quantity ?? 0);
    categoryRevenue.set(slug, (categoryRevenue.get(slug) ?? 0) + rev);
  }

  const revenueByCategory = Array.from(categoryRevenue.entries()).map(
    ([categorySlug, revenue]) => ({ categorySlug, revenue }),
  );

  // Top category by revenue
  let topCategorySlug: string | null = null;
  let maxRev = 0;
  for (const [slug, rev] of categoryRevenue.entries()) {
    if (rev > maxRev) {
      maxRev = rev;
      topCategorySlug = slug;
    }
  }

  return ok({
    totalUsers: totalUsers ?? 0,
    ordersToday,
    revenueTodayCents,
    topCategorySlug,
    ordersLast7d,
    revenueByCategory,
  });
}
