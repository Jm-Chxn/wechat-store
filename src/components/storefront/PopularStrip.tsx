"use client";

import * as React from "react";
import { ProductCard } from "@/components/storefront/ProductCard";
import { useLanguage } from "@/i18n/LanguageProvider";
import type { Product } from "@/types";

export function PopularStrip({ products }: { products: Product[] }) {
  const { t } = useLanguage();
  return (
    <section className="container py-12">
      <div className="mb-6 flex items-end justify-between">
        <h2 className="text-2xl font-semibold">{t("home.popularThisWeek")}</h2>
      </div>
      <div className="no-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
        {products.map((p) => (
          <div key={p.id} className="w-64 shrink-0">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </section>
  );
}
