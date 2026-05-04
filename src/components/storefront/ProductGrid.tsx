"use client";

import { ProductCard } from "@/components/storefront/ProductCard";
import { useLanguage } from "@/i18n/LanguageProvider";
import type { Product } from "@/types";

export function ProductGrid({
  products,
  emptyKey,
}: {
  products: Product[];
  emptyKey?: "shop.empty";
}) {
  const { t } = useLanguage();
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
