// Direct admin API helpers. Skips the storefront `repository.ts` shape so the
// admin UI can render extra columns (email, phone, customerName) that the
// storefront wire types don't carry.

import { api } from "./client";

export interface AdminOrder {
  id: string;
  userId: string | null;
  guestName: string | null;
  customerName: string | null;
  customerWechatId: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  subtotalCents: number;
  deliveryFeeCents: number;
  totalCents: number;
  status: "CONFIRMED" | "PROCESSING" | "COMPLETED" | "CANCELLED";
  pickupCommunityEn: string | null;
  pickupCommunityZh: string | null;
  deliveryAddress: {
    line1: string;
    line2?: string;
    city: string;
    postalCode: string;
  } | null;
  createdAt: string | null;
  items: {
    productId: string;
    nameEn: string;
    nameZh: string;
    imageUrl: string | null;
    unitPriceCents: number;
    quantity: number;
  }[];
}

export interface AdminUser {
  userId: string;
  nickname: string | null;
  fullName: string | null;
  wechatId: string | null;
  avatarUrl: string | null;
  role: "user" | "admin";
  email: string | null;
  phone: string | null;
  createdAt: string | null;
  lastSeenAt: string | null;
  orderCount: number;
  totalSpentCents: number;
  activityCount: number;
}

export interface AdminStatsPayload {
  totalUsers: number;
  ordersToday: number;
  revenueTodayCents: number;
  topCategorySlug: string | null;
  ordersLast7d: { date: string; orders: number; revenue: number }[];
  revenueByCategory: { categorySlug: string; revenue: number }[];
}

export const adminApi = {
  listOrders: () => api.get<AdminOrder[]>("/api/v1/admin/orders", { timeoutMs: 10000 }),
  listUsers: () => api.get<AdminUser[]>("/api/v1/admin/users", { timeoutMs: 10000 }),
  stats: () => api.get<AdminStatsPayload>("/api/v1/admin/stats", { timeoutMs: 15000 }),
  updateOrderStatus: (id: string, status: AdminOrder["status"]) =>
    api.patch<AdminOrder>(`/api/v1/admin/orders/${encodeURIComponent(id)}`, { status }),
  deleteOrder: (id: string) =>
    api.delete(`/api/v1/admin/orders/${encodeURIComponent(id)}`),
};
