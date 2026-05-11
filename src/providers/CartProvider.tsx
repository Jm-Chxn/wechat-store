"use client";

import * as React from "react";
import { useAuth } from "@/providers/AuthProvider";
import { logActivity, mergeGuestCart, fetchServerCart } from "@/lib/repository";
import { api, BACKEND_ENABLED } from "@/lib/api/client";
import { readJSON, StorageKeys, writeJSON } from "@/lib/storage";
import type { CartLine } from "@/types";

interface CartContextValue {
  lines: CartLine[];
  count: number;
  isReady: boolean;
  add: (productId: string, qty?: number) => void;
  remove: (productId: string) => void;
  setQuantity: (productId: string, qty: number) => void;
  clear: () => void;
}

const CartContext = React.createContext<CartContextValue | undefined>(undefined);

interface ServerCartItem {
  id: string;
  productId: string;
  quantity: number;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user, isReady: authReady } = useAuth();
  const [lines, setLines] = React.useState<CartLine[]>([]);
  const [serverIds, setServerIds] = React.useState<Map<string, string>>(new Map());
  const [isReady, setReady] = React.useState(false);
  const [synced, setSynced] = React.useState<string | null>(null);

  // Hydrate from localStorage initially.
  React.useEffect(() => {
    const stored = readJSON<CartLine[]>(StorageKeys.cart, []);
    setLines(stored);
    setReady(true);
  }, []);

  // On sign-in: merge guest cart (if any) into the server cart, then load.
  React.useEffect(() => {
    if (!authReady) return;
    if (!user) {
      setSynced(null);
      setServerIds(new Map());
      return;
    }
    if (synced === user.id) return;
    let cancelled = false;
    void (async () => {
      if (!BACKEND_ENABLED) {
        if (!cancelled) setSynced(user.id);
        return;
      }
      const guest = readJSON<CartLine[]>(StorageKeys.cart, []);
      const merged =
        guest.length > 0
          ? await mergeGuestCart(guest.map((l) => ({ productId: l.productId, quantity: l.quantity })))
          : await fetchServerCart();
      if (cancelled) return;
      if (!merged) {
        setSynced(user.id);
        return;
      }
      const items = (merged.items ?? []) as ServerCartItem[];
      setLines(items.map((i) => ({ productId: i.productId, quantity: i.quantity })));
      const ids = new Map<string, string>();
      items.forEach((i) => ids.set(i.productId, i.id));
      setServerIds(ids);
      writeJSON(StorageKeys.cart, items.map((i) => ({ productId: i.productId, quantity: i.quantity })));
      setSynced(user.id);
    })();
    return () => { cancelled = true; };
  }, [authReady, user, synced]);

  const persistLocal = React.useCallback((next: CartLine[]) => {
    setLines(next);
    writeJSON(StorageKeys.cart, next);
  }, []);

  const add = React.useCallback(
    (productId: string, qty = 1) => {
      const existing = lines.find((l) => l.productId === productId);
      const next = existing
        ? lines.map((l) =>
            l.productId === productId ? { ...l, quantity: l.quantity + qty } : l,
          )
        : [...lines, { productId, quantity: qty }];
      persistLocal(next);
      logActivity("ADD_TO_CART", user?.id ?? null, { productId, qty });
      if (user && BACKEND_ENABLED) {
        void api
          .post<{ items: ServerCartItem[] }>("/api/v1/cart/items", { productId, quantity: qty })
          .then((cart) => {
            const ids = new Map<string, string>();
            (cart.items ?? []).forEach((i) => ids.set(i.productId, i.id));
            setServerIds(ids);
          })
          .catch(() => {});
      }
    },
    [lines, persistLocal, user],
  );

  const remove = React.useCallback(
    (productId: string) => {
      persistLocal(lines.filter((l) => l.productId !== productId));
      const id = serverIds.get(productId);
      if (user && id && BACKEND_ENABLED) {
        void api.delete(`/api/v1/cart/items/${encodeURIComponent(id)}`).catch(() => {});
      }
    },
    [lines, persistLocal, serverIds, user],
  );

  const setQuantity = React.useCallback(
    (productId: string, qty: number) => {
      if (qty <= 0) {
        remove(productId);
        return;
      }
      persistLocal(
        lines.map((l) => (l.productId === productId ? { ...l, quantity: qty } : l)),
      );
      const id = serverIds.get(productId);
      if (user && id && BACKEND_ENABLED) {
        void api.patch(`/api/v1/cart/items/${encodeURIComponent(id)}`, { quantity: qty }).catch(() => {});
      }
    },
    [lines, persistLocal, serverIds, user, remove],
  );

  const clear = React.useCallback(() => persistLocal([]), [persistLocal]);

  const count = React.useMemo(
    () => lines.reduce((s, l) => s + l.quantity, 0),
    [lines],
  );

  const value = React.useMemo<CartContextValue>(
    () => ({ lines, count, isReady, add, remove, setQuantity, clear }),
    [lines, count, isReady, add, remove, setQuantity, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = React.useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
