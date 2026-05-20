"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ProductGrid } from "@/components/storefront/ProductGrid";
import { FilterSidebar, type Filters } from "@/components/storefront/FilterSidebar";
import { SortSelect, type SortKey } from "@/components/storefront/SortSelect";
import { useLanguage } from "@/i18n/LanguageProvider";
import { listProducts } from "@/lib/repository";
import type { Product } from "@/types";

export default function ShopPage() {
  const { t } = useLanguage();
  const [products, setProducts] = React.useState<Product[]>([]);
  const [isProductsLoading, setIsProductsLoading] = React.useState(true);
  const [isFilterLoading, setIsFilterLoading] = React.useState(false);
  const [filters, setFilters] = React.useState<Filters>({
    categorySlug: "all",
    priceMaxCents: 5000,
    dietary: [],
  });
  const [sort, setSort] = React.useState<SortKey>("newest");

  React.useEffect(() => {
    let cancelled = false;
    setIsProductsLoading(true);
    void listProducts()
      .then((p) => {
        if (!cancelled) setProducts(p);
      })
      .finally(() => {
        if (!cancelled) setIsProductsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    if (isProductsLoading) return;
    setIsFilterLoading(true);
    const timer = window.setTimeout(() => {
      setIsFilterLoading(false);
    }, 180);
    return () => {
      window.clearTimeout(timer);
    };
  }, [filters, sort, isProductsLoading]);

  const filtered = React.useMemo(() => {
    let list = products.slice();
    if (filters.categorySlug !== "all") {
      list = list.filter((p) => p.categorySlug === filters.categorySlug);
    }
    list = list.filter((p) => p.price <= filters.priceMaxCents);
    if (filters.dietary.length > 0) {
      list = list.filter((p) =>
        filters.dietary.every((d) => p.dietaryTags.includes(d)),
      );
    }
    if (sort === "priceAsc") list.sort((a, b) => a.price - b.price);
    else if (sort === "priceDesc") list.sort((a, b) => b.price - a.price);
    else list.sort((a, b) => Number(b.isNew) - Number(a.isNew));
    return list;
  }, [products, filters, sort]);

  return (
    <div className="container py-8">
      <nav className="mb-4 flex items-center gap-1 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-ink">{t("shop.breadcrumbHome")}</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-ink">{t("shop.breadcrumbShop")}</span>
      </nav>
      <div className="mb-6 flex items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold">{t("shop.title")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("shop.resultsCount", {
              n: isProductsLoading || isFilterLoading ? 0 : filtered.length,
            })}
          </p>
        </div>
        <SortSelect value={sort} onChange={setSort} />
      </div>
      <div className="grid gap-6 md:grid-cols-[260px,1fr]">
        <FilterSidebar filters={filters} onChange={setFilters} />
        <ProductGrid products={filtered} isLoading={isProductsLoading || isFilterLoading} />
      </div>
    </div>
  );
}
