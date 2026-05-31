"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Routes whose JS chunks should be prefetched immediately on app mount.
// This eliminates the "first click is slow" problem by downloading chunks
// in the background before the user navigates.
const STOREFRONT_ROUTES = [
  "/shop",
  "/cart",
  "/checkout",
  "/account",
  "/account/login",
  "/account/orders",
];

export function RoutePreloader() {
  const router = useRouter();

  useEffect(() => {
    // Stagger prefetches slightly to avoid saturating the network on mount
    STOREFRONT_ROUTES.forEach((route, i) => {
      setTimeout(() => router.prefetch(route), i * 100);
    });
  }, [router]);

  return null;
}
