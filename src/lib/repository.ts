// Repository — single source of truth for product/order/user/activity reads
// and writes. Calls the Spring Boot backend at NEXT_PUBLIC_API_BASE_URL with
// the Supabase access token in the Authorization header. The function
// signatures intentionally match the legacy localStorage-backed repository
// so that callers do not need to change their data flows beyond awaiting
// promises.

import { products as seedProducts } from "@/data/products";
import { api, BACKEND_ENABLED } from "@/lib/api/client";
import type {
  Activity,
  ActivityType,
  Order,
  OrderStatus,
  Product,
  Role,
  WeChatAccount,
} from "@/types";

// ---- Wire shapes ---------------------------------------------------------

interface BackendProduct {
  id: string;
  slug: string;
  nameEn: string;
  nameZh: string;
  descriptionEn: string | null;
  descriptionZh: string | null;
  price: number;
  packSizeEn: string | null;
  packSizeZh: string | null;
  stockStatus: "IN_STOCK" | "LIMITED" | "OUT_OF_STOCK";
  stockCount: number;
  isNew: boolean;
  dietaryTags: string[];
  imageUrl: string | null;
  categorySlug: Product["categorySlug"];
}

interface BackendOrderItem {
  productId: string;
  nameEn: string;
  nameZh: string;
  imageUrl: string | null;
  unitPriceCents: number;
  quantity: number;
}

interface BackendDeliveryAddress {
  line1: string;
  line2?: string;
  city: string;
  postalCode: string;
}

interface BackendOrder {
  id: string;
  userId: string | null;
  guestName: string | null;
  subtotalCents: number;
  deliveryFeeCents: number;
  totalCents: number;
  status: OrderStatus;
  pickupCommunityEn: string | null;
  pickupCommunityZh: string | null;
  deliveryAddress?: BackendDeliveryAddress | null;
  createdAt: string | null;
  items: BackendOrderItem[];
}

interface BackendActivity {
  id: string;
  type: string;
  userId: string | null;
  anonId: string | null;
  meta: string | null;
  createdAt: string | null;
}

interface BackendUserSummary {
  userId: string;
  nickname: string | null;
  avatarUrl: string | null;
  role: Role;
  createdAt: string | null;
  lastSeenAt: string | null;
  orderCount: number;
  activityCount: number;
  totalSpentCents: number;
}

interface BackendStats {
  totalUsers: number;
  ordersToday: number;
  revenueTodayCents: number;
  topCategorySlug: string | null;
  ordersLast7d: { date: string; orders: number; revenue: number }[];
  revenueByCategory: { categorySlug: string; revenue: number }[];
}

// ---- Mapping helpers -----------------------------------------------------

function fromBackendProduct(p: BackendProduct): Product {
  return {
    id: p.id,
    slug: p.slug,
    nameEn: p.nameEn,
    nameZh: p.nameZh,
    descriptionEn: p.descriptionEn ?? "",
    descriptionZh: p.descriptionZh ?? "",
    price: p.price,
    packSizeEn: p.packSizeEn ?? "",
    packSizeZh: p.packSizeZh ?? "",
    stockStatus: p.stockStatus,
    stockCount: p.stockCount,
    isNew: !!p.isNew,
    dietaryTags: (p.dietaryTags ?? []) as Product["dietaryTags"],
    imageUrl: p.imageUrl ?? "",
    categorySlug: p.categorySlug,
  };
}

function fromBackendOrder(o: BackendOrder): Order {
  return {
    id: o.id,
    userOpenid: o.userId,
    guestName: o.guestName ?? undefined,
    items: (o.items ?? []).map((it) => ({
      productId: it.productId,
      nameEn: it.nameEn,
      nameZh: it.nameZh,
      imageUrl: it.imageUrl ?? "",
      unitPrice: it.unitPriceCents,
      quantity: it.quantity,
    })),
    subtotal: o.subtotalCents,
    deliveryFee: o.deliveryFeeCents,
    total: o.totalCents,
    status: o.status,
    createdAt: o.createdAt ?? new Date().toISOString(),
    pickupCommunityEn: o.pickupCommunityEn ?? "",
    pickupCommunityZh: o.pickupCommunityZh ?? "",
    deliveryAddress: o.deliveryAddress ?? null,
  };
}

function fromBackendActivity(a: BackendActivity): Activity {
  let meta: Record<string, unknown> | undefined;
  if (a.meta) {
    try {
      meta = JSON.parse(a.meta) as Record<string, unknown>;
    } catch (err) {
      console.warn("[repository] failed to parse activity meta:", (a as { id?: string }).id, err);
      meta = undefined;
    }
  }
  return {
    id: a.id,
    type: a.type as ActivityType,
    userOpenid: a.userId,
    meta,
    createdAt: a.createdAt ?? new Date().toISOString(),
  };
}

function fromBackendUser(u: BackendUserSummary): WeChatAccount {
  const display = u.nickname || (u.userId ? u.userId.slice(0, 8) : "Member");
  return {
    openid: u.userId,
    nicknameEn: display,
    nicknameZh: display,
    avatarUrl: u.avatarUrl ?? "",
    role: u.role,
    joinedAt: u.createdAt ?? new Date().toISOString(),
  };
}

// ---- Products ------------------------------------------------------------

export async function listProducts(): Promise<Product[]> {
  try {
    const data = await api.get<BackendProduct[]>("/api/v1/products");
    if (Array.isArray(data) && data.length > 0) return data.map(fromBackendProduct);
    return seedProducts;
  } catch {
    return seedProducts;
  }
}

export async function getProduct(slugOrId: string): Promise<Product | undefined> {
  const local = seedProducts.find((p) => p.slug === slugOrId || p.id === slugOrId);
  if (local) return local;
  try {
    if (!BACKEND_ENABLED) return undefined;
    const p = await api.get<BackendProduct>(`/api/v1/products/${encodeURIComponent(slugOrId)}`);
    return fromBackendProduct(p);
  } catch {
    return undefined;
  }
}

export async function upsertProduct(p: Product, isNew: boolean): Promise<Product[]> {
  const payload = {
    id: p.id,
    slug: p.slug,
    nameEn: p.nameEn,
    nameZh: p.nameZh,
    descriptionEn: p.descriptionEn,
    descriptionZh: p.descriptionZh,
    price: p.price,
    packSizeEn: p.packSizeEn,
    packSizeZh: p.packSizeZh,
    stockStatus: p.stockStatus,
    stockCount: p.stockCount,
    isNew: p.isNew,
    dietaryTags: p.dietaryTags,
    imageUrl: p.imageUrl,
    categorySlug: p.categorySlug,
  };
  if (isNew) {
    await api.post<BackendProduct>("/api/v1/admin/products", payload);
  } else {
    await api.patch<BackendProduct>(`/api/v1/admin/products/${encodeURIComponent(p.id)}`, payload);
  }
  return listProducts();
}

export async function deleteProduct(id: string): Promise<Product[]> {
  await api.delete(`/api/v1/admin/products/${encodeURIComponent(id)}`);
  return listProducts();
}

export async function resetProducts(): Promise<Product[]> {
  return listProducts();
}

// ---- Users (admin) -------------------------------------------------------

export async function listUsers(): Promise<WeChatAccount[]> {
  try {
    const rows = await api.get<BackendUserSummary[]>("/api/v1/admin/users");
    return rows.map(fromBackendUser);
  } catch {
    return [];
  }
}

export async function getUser(id: string | null | undefined): Promise<WeChatAccount | undefined> {
  if (!id) return undefined;
  const all = await listUsers();
  return all.find((a) => a.openid === id);
}

// ---- Orders --------------------------------------------------------------

export async function listOrders(userId?: string | null): Promise<Order[]> {
  const path = userId ? "/api/v1/orders" : "/api/v1/admin/orders";
  const rows = await api.get<BackendOrder[]>(path);
  return rows.map(fromBackendOrder);
}

export async function getOrder(id: string): Promise<Order | undefined> {
  try {
    return fromBackendOrder(await api.get<BackendOrder>(`/api/v1/orders/${encodeURIComponent(id)}`));
  } catch {
    return undefined;
  }
}

export interface PlaceOrderInput {
  userOpenid: string | null;
  guestName?: string;
  items: { productId: string; quantity: number }[];
  pickupCommunityEn: string;
  pickupCommunityZh: string;
  deliveryAddress?: {
    line1: string;
    line2?: string;
    city: string;
    postalCode: string;
  };
}

export async function placeOrder(input: PlaceOrderInput): Promise<Order> {
  const order = await api.post<BackendOrder>("/api/v1/orders", {
    items: input.items,
    pickupCommunityEn: input.pickupCommunityEn,
    pickupCommunityZh: input.pickupCommunityZh,
    guestName: input.guestName,
    deliveryAddress: input.deliveryAddress,
  });
  return fromBackendOrder(order);
}

export async function cancelOrder(orderId: string): Promise<Order | undefined> {
  try {
    const o = await api.patch<BackendOrder>(`/api/v1/orders/${encodeURIComponent(orderId)}`, {
      status: "CANCELLED",
    });
    return fromBackendOrder(o);
  } catch {
    return undefined;
  }
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order | undefined> {
  try {
    const o = await api.patch<BackendOrder>(`/api/v1/admin/orders/${encodeURIComponent(orderId)}`, { status });
    return fromBackendOrder(o);
  } catch {
    return undefined;
  }
}

// ---- Activity ------------------------------------------------------------

export async function listActivities(filterUser?: string | null): Promise<Activity[]> {
  try {
    const rows = await api.get<BackendActivity[]>("/api/v1/admin/activities");
    const all = rows.map(fromBackendActivity);
    if (!filterUser) return all;
    return all.filter((a) => a.userOpenid === filterUser);
  } catch {
    return [];
  }
}

const PENDING_ACTIVITIES_KEY = "tuangou.pendingActivities";
const MAX_PENDING = 10;
const MAX_RETRIES_STORED = 3;

interface PendingActivity {
  type: ActivityType;
  meta: Record<string, unknown>;
  retries: number;
}

function flushPendingActivities(): void {
  if (typeof window === "undefined") return;
  let pending: PendingActivity[] = [];
  try {
    pending = JSON.parse(localStorage.getItem(PENDING_ACTIVITIES_KEY) ?? "[]") as PendingActivity[];
  } catch {
    pending = [];
  }
  if (pending.length === 0) return;
  // Remove the flushed entries optimistically; failed ones are re-added below
  localStorage.removeItem(PENDING_ACTIVITIES_KEY);
  for (const event of pending) {
    void api.post("/api/v1/events/track", { type: event.type, meta: event.meta }).catch(() => {
      if (event.retries < MAX_RETRIES_STORED) {
        storePendingActivity({ ...event, retries: event.retries + 1 });
      }
    });
  }
}

function storePendingActivity(event: PendingActivity): void {
  if (typeof window === "undefined") return;
  let pending: PendingActivity[] = [];
  try {
    pending = JSON.parse(localStorage.getItem(PENDING_ACTIVITIES_KEY) ?? "[]") as PendingActivity[];
  } catch {
    pending = [];
  }
  pending.push(event);
  // Discard oldest entries if we exceed the max cap
  if (pending.length > MAX_PENDING) {
    pending = pending.slice(pending.length - MAX_PENDING);
  }
  try {
    localStorage.setItem(PENDING_ACTIVITIES_KEY, JSON.stringify(pending));
  } catch {
    // localStorage write failed (e.g. private browsing quota) — silently ignore
  }
}

export function logActivity(
  type: ActivityType,
  userId: string | null,
  meta?: Record<string, unknown>,
): Activity {
  // Fire-and-forget — fan out to backend but do not await; return a synthetic
  // record so the existing call sites stay synchronous.
  const synthetic: Activity = {
    id: `act_${Date.now()}_${Math.floor(Math.random() * 1e6).toString(16)}`,
    type,
    userOpenid: userId,
    meta,
    createdAt: new Date().toISOString(),
  };
  if (typeof window !== "undefined") {
    // First flush any pending events from a previous failed attempt
    flushPendingActivities();
    void api.post("/api/v1/events/track", { type, meta: meta ?? {} }).catch(() => {
      storePendingActivity({ type, meta: meta ?? {}, retries: 0 });
    });
  }
  return synthetic;
}

// ---- Stats (admin) -------------------------------------------------------

export interface AdminStats {
  totalUsers: number;
  ordersToday: number;
  revenueTodayCents: number;
  topCategorySlug: string | null;
  ordersLast7d: { date: string; orders: number; revenue: number }[];
  revenueByCategory: { categorySlug: string; revenue: number }[];
}

export async function computeStats(): Promise<AdminStats> {
  try {
    const s = await api.get<BackendStats>("/api/v1/admin/stats");
    return s;
  } catch {
    return {
      totalUsers: 0,
      ordersToday: 0,
      revenueTodayCents: 0,
      topCategorySlug: null,
      ordersLast7d: [],
      revenueByCategory: [],
    };
  }
}

/** Aggregate user stats for the admin /admin/users page. */
export async function listUserSummaries() {
  const [users, allOrders, allActivities] = await Promise.all([
    listUsers(),
    listOrders(),
    listActivities(),
  ]);
  return users
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
    .sort((a, b) => {
      const at = a.lastActivityAt ? new Date(a.lastActivityAt).getTime() : 0;
      const bt = b.lastActivityAt ? new Date(b.lastActivityAt).getTime() : 0;
      return bt - at;
    });
}

// ---- Cart sync (server-backed for signed-in users) -----------------------

export interface BackendCart {
  cartId: string;
  items: { id: string; productId: string; quantity: number }[];
  subtotalCents: number;
}

export async function fetchServerCart(): Promise<BackendCart | null> {
  try {
    if (!BACKEND_ENABLED) return null;
    return await api.get<BackendCart>("/api/v1/cart");
  } catch {
    return null;
  }
}

export async function mergeGuestCart(items: { productId: string; quantity: number }[]): Promise<BackendCart | null> {
  try {
    if (!BACKEND_ENABLED) return null;
    return await api.post<BackendCart>("/api/v1/cart/merge", { items });
  } catch {
    return null;
  }
}
