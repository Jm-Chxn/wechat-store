import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format an amount in cents as a locale-aware price string.
 * Used everywhere prices are shown so we have a single source of truth.
 * When locale is 'zh' or 'zh-CN', formats as CNY (¥). Otherwise formats as USD ($).
 */
export function formatPrice(cents: number, locale?: string): string {
  const amount = cents / 100;
  if (locale === "zh" || locale === "zh-CN") {
    return new Intl.NumberFormat("zh-CN", { style: "currency", currency: "CNY" }).format(amount);
  }
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

/**
 * Extract the best display name for a user with fallbacks:
 * fullName → name → email prefix → "User"
 */
export function getDisplayName(user: { fullName?: string | null; name?: string | null; email?: string | null }): string {
  if (user.fullName) return user.fullName;
  if (user.name) return user.name;
  if (user.email) return user.email.split("@")[0];
  return "User";
}

export function formatDate(iso: string, locale: "en" | "zh" = "en") {
  const d = new Date(iso);
  if (locale === "zh") {
    return d.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Mask an openid like wx_admin_001 → wx_admin_•••1 for the admin user table */
export function maskOpenid(openid: string) {
  if (openid.length <= 4) return openid;
  return `${openid.slice(0, openid.length - 4)}•••${openid.slice(-1)}`;
}

export function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}
