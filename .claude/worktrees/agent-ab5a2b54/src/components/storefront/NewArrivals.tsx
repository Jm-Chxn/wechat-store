"use client";

import { ProductCard } from "@/components/storefront/ProductCard";
import { useLanguage } from "@/i18n/LanguageProvider";
import type { Product } from "@/types";

export function NewArrivals({ products }: { products: Product[] }) {
  const { t } = useLanguage();
  if (products.length === 0) return null;
  return (
    <section className="container py-12">
      <div className="mb-6 flex items-end justify-between">
        <h2 className="text-2xl font-semibold">{t("home.newArrivals")}</h2>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {products.slice(0, 4).map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
