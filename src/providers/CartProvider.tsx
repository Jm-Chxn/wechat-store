"use client";

import * as React from "react";
import { useAuth } from "@/providers/AuthProvider";
import { logActivity } from "@/lib/repository";
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

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [lines, setLines] = React.useState<CartLine[]>([]);
  const [isReady, setReady] = React.useState(false);

  React.useEffect(() => {
    const stored = readJSON<CartLine[]>(StorageKeys.cart, []);
    setLines(stored);
    setReady(true);
  }, []);

  const persist = React.useCallback((next: CartLine[]) => {
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
      persist(next);
      logActivity("ADD_TO_CART", user?.openid ?? null, { productId, qty });
    },
    [lines, persist, user],
  );

  const remove = React.useCallback(
    (productId: string) => {
      persist(lines.filter((l) => l.productId !== productId));
    },
    [lines, persist],
  );

  const setQuantity = React.useCallback(
    (productId: string, qty: number) => {
      if (qty <= 0) {
        persist(lines.filter((l) => l.productId !== productId));
        return;
      }
      persist(
        lines.map((l) =>
          l.productId === productId ? { ...l, quantity: qty } : l,
        ),
      );
    },
    [lines, persist],
  );

  const clear = React.useCallback(() => persist([]), [persist]);

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
