import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format an amount in cents as a USD price string.
 * Used everywhere prices are shown so we have a single source of truth.
 */
export function formatPrice(cents: number, locale: "en" | "zh" = "en") {
  const amount = (cents / 100).toFixed(2);
  return locale === "zh" ? `$${amount}` : `$${amount}`;
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
