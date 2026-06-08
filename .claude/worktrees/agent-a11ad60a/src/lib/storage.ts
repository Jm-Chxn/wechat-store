// Tiny typed wrapper around localStorage. Lives at the seam between providers
// and persistence so we can swap to a real backend by replacing this module.

const isBrowser = () => typeof window !== "undefined";

export const StorageKeys = {
  lang: "tuangou.lang",
  user: "tuangou.user",
  cart: "tuangou.cart",
  products: "tuangou.products",
  orders: "tuangou.orders",
  activities: "tuangou.activities",
} as const;

export type StorageKey = (typeof StorageKeys)[keyof typeof StorageKeys];

export function readJSON<T>(key: StorageKey, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJSON<T>(key: StorageKey, value: T): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota or serialization errors are non-fatal in the MVP */
  }
}

export function removeKey(key: StorageKey): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(key);
}

export function clearAllTuangou(): void {
  if (!isBrowser()) return;
  Object.values(StorageKeys).forEach((k) => window.localStorage.removeItem(k));
}
