"use client";

import { ProductCard } from "@/components/storefront/ProductCard";
import { useLanguage } from "@/i18n/LanguageProvider";
import type { Product } from "@/types";

export function ProductGrid({
  products,
  emptyKey,
  isLoading = false,
  skeletonCount = 9,
}: {
  products: Product[];
  emptyKey?: "shop.empty";
  isLoading?: boolean;
  skeletonCount?: number;
}) {
  const { t } = useLanguage();
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: skeletonCount }).map((_, idx) => (
          <div
            key={`skeleton-${idx}`}
            className="overflow-hidden rounded-2xl border border-border bg-surface"
            aria-hidden="true"
          >
            <div className="aspect-square animate-pulse bg-secondary/60" />
            <div className="space-y-3 p-4">
              <div className="h-4 w-2/3 animate-pulse rounded bg-secondary/70" />
              <div className="h-3 w-5/6 animate-pulse rounded bg-secondary/60" />
              <div className="h-9 w-full animate-pulse rounded-xl bg-secondary/70" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-surface/60 p-12 text-center text-sm text-muted-foreground">
        {t(emptyKey ?? "shop.empty")}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
