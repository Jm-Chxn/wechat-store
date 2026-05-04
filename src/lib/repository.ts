// Repository — the only module that touches localStorage for domain data.
// Swap this file when wiring a real backend; the rest of the app should not
// need to change.

import { products as seedProducts } from "@/data/products";
import { wechatAccounts } from "@/data/wechatAccounts";
import {
  readJSON,
  StorageKeys,
  writeJSON,
} from "@/lib/storage";
import type {
  Activity,
  ActivityType,
  Order,
  OrderStatus,
  Product,
  WeChatAccount,
} from "@/types";
import { uid } from "@/lib/utils";

// --- Products -------------------------------------------------------------

export function listProducts(): Product[] {
  const stored = readJSON<Product[] | null>(StorageKeys.products, null);
  if (stored && Array.isArray(stored) && stored.length > 0) return stored;
  writeJSON(StorageKeys.products, seedProducts);
  return seedProducts;
}

export function getProduct(slugOrId: string): Product | undefined {
  return listProducts().find((p) => p.slug === slugOrId || p.id === slugOrId);
}

export function upsertProduct(p: Product): Product[] {
  const list = listProducts();
  const idx = list.findIndex((x) => x.id === p.id);
  if (idx === -1) list.unshift(p);
  else list[idx] = p;
  writeJSON(StorageKeys.products, list);
  return list;
}

export function deleteProduct(id: string): Product[] {
  const list = listProducts().filter((p) => p.id !== id);
  writeJSON(StorageKeys.products, list);
  return list;
}

export function resetProducts(): Product[] {
  writeJSON(StorageKeys.products, seedProducts);
  return seedProducts;
}

// --- Users ----------------------------------------------------------------

export function listUsers(): WeChatAccount[] {
  return wechatAccounts;
}

export function getUser(openid: string | null | undefined) {
  if (!openid) return undefined;
  return wechatAccounts.find((a) => a.openid === openid);
}

// --- Orders ---------------------------------------------------------------

export function listOrders(userOpenid?: string | null): Order[] {
  const all = readJSON<Order[]>(StorageKeys.orders, []);
  const sorted = [...all].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  if (!userOpenid) return sorted;
  return sorted.filter((o) => o.userOpenid === userOpenid);
}

export function getOrder(id: string): Order | undefined {
  return listOrders().find((o) => o.id === id);
}

export interface PlaceOrderInput {
  userOpenid: string | null;
  guestName?: string;
  items: { productId: string; quantity: number }[];
  pickupCommunityEn: string;
  pickupCommunityZh: string;
}

export function placeOrder(input: PlaceOrderInput): Order {
  const products = listProducts();
  const orderItems = input.items
    .map((line) => {
      const p = products.find((pp) => pp.id === line.productId);
      if (!p) return null;
      return {
        productId: p.id,
        nameEn: p.nameEn,
        nameZh: p.nameZh,
        imageUrl: p.imageUrl,
        unitPrice: p.price,
        quantity: line.quantity,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const subtotal = orderItems.reduce(
    (sum, it) => sum + it.unitPrice * it.quantity,
    0,
  );
  const deliveryFee = subtotal >= 5000 ? 0 : 199; // free over $50
  const total = subtotal + deliveryFee;

  const order: Order = {
    id: uid("ord"),
    userOpenid: input.userOpenid,
    guestName: input.guestName,
    items: orderItems,
    subtotal,
    deliveryFee,
    total,
    status: "CONFIRMED",
    createdAt: new Date().toISOString(),
    pickupCommunityEn: input.pickupCommunityEn,
    pickupCommunityZh: input.pickupCommunityZh,
  };

  const all = readJSON<Order[]>(StorageKeys.orders, []);
  all.push(order);
  writeJSON(StorageKeys.orders, all);
  return order;
}

export function updateOrderStatus(orderId: string, status: OrderStatus): Order | undefined {
  const all = readJSON<Order[]>(StorageKeys.orders, []);
  const idx = all.findIndex((o) => o.id === orderId);
  if (idx === -1) return undefined;
  all[idx] = { ...all[idx], status };
  writeJSON(StorageKeys.orders, all);
  return all[idx];
}

// --- Activity -------------------------------------------------------------

export function listActivities(filterUser?: string | null): Activity[] {
  const all = readJSON<Activity[]>(StorageKeys.activities, []);
  const sorted = [...all].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  if (!filterUser) return sorted;
  return sorted.filter((a) => a.userOpenid === filterUser);
}

export function logActivity(
  type: ActivityType,
  userOpenid: string | null,
  meta?: Record<string, unknown>,
): Activity {
  const all = readJSON<Activity[]>(StorageKeys.activities, []);
  const a: Activity = {
    id: uid("act"),
    type,
    userOpenid,
    meta,
    createdAt: new Date().toISOString(),
  };
  all.push(a);
  writeJSON(StorageKeys.activities, all);
  return a;
}

// --- Stats (admin) --------------------------------------------------------

export interface AdminStats {
  totalUsers: number;
  ordersToday: number;
  revenueTodayCents: number;
  topCategorySlug: string | null;
  ordersLast7d: { date: string; orders: number; revenue: number }[];
  revenueByCategory: { categorySlug: string; revenue: number }[];
}

export function computeStats(): AdminStats {
  const orders = listOrders();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const ordersToday = orders.filter(
    (o) => new Date(o.createdAt) >= today,
  );
  const revenueTodayCents = ordersToday.reduce((s, o) => s + o.total, 0);

  // Track unique users with at least one activity
  const acts = listActivities();
  const seen = new Set<string>();
  acts.forEach((a) => a.userOpenid && seen.add(a.userOpenid));
  const totalUsers = seen.size;

  // Last 7 days timeline
  const ordersLast7d: { date: string; orders: number; revenue: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const next = new Date(d);
    next.setDate(d.getDate() + 1);
    const inWindow = orders.filter((o) => {
      const t = new Date(o.createdAt);
      return t >= d && t < next;
    });
    ordersLast7d.push({
      date: `${d.getMonth() + 1}/${d.getDate()}`,
      orders: inWindow.length,
      revenue: Math.round(inWindow.reduce((s, o) => s + o.total, 0) / 100),
    });
  }

  // Revenue by category (uses current product map for category lookup)
  const products = listProducts();
  const productCategoryMap = new Map(products.map((p) => [p.id, p.categorySlug]));
  const byCat = new Map<string, number>();
  orders.forEach((o) => {
    o.items.forEach((it) => {
      const cat = productCategoryMap.get(it.productId);
      if (!cat) return;
      byCat.set(cat, (byCat.get(cat) ?? 0) + it.unitPrice * it.quantity);
    });
  });
  const revenueByCategory = [...byCat.entries()]
    .map(([categorySlug, revenue]) => ({ categorySlug, revenue }))
    .sort((a, b) => b.revenue - a.revenue);

  const topCategorySlug = revenueByCategory[0]?.categorySlug ?? null;

  return {
    totalUsers,
    ordersToday: ordersToday.length,
    revenueTodayCents,
    topCategorySlug,
    ordersLast7d,
    revenueByCategory,
  };
}

/** Aggregate user stats for the admin /admin/users page. */
export function listUserSummaries() {
  const allOrders = listOrders();
  const allActivities = listActivities();
  return wechatAccounts
    .map((acc) => {
      const orders = allOrders.filter((o) => o.userOpenid === acc.openid);
      const activities = allActivities.filter((a) => a.userOpenid === acc.openid);
      const lastActivityAt = activities[0]?.createdAt ?? null;
      const totalSpent = orders.reduce((s, o) => s + o.total, 0);
      return {
        account: acc,
        orderCount: orders.length,
        totalSpent,
        lastActivityAt,
        activityCount: activities.length,
      };
    })
    .filter((s) => s.activityCount > 0 || s.account.role === "admin")
    .sort((a, b) => {
      const at = a.lastActivityAt ? new Date(a.lastActivityAt).getTime() : 0;
      const bt = b.lastActivityAt ? new Date(b.lastActivityAt).getTime() : 0;
      return bt - at;
    });
}
