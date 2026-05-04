"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { ProductGrid } from "@/components/storefront/ProductGrid";
import { FilterSidebar, type Filters } from "@/components/storefront/FilterSidebar";
import { SortSelect, type SortKey } from "@/components/storefront/SortSelect";
import { categoryBySlug } from "@/data/categories";
import { useLanguage } from "@/i18n/LanguageProvider";
import { listProducts } from "@/lib/repository";
import type { CategorySlug, Product } from "@/types";
import type { DictionaryKey } from "@/i18n/strings";

export default function CategoryPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug as CategorySlug;
  const cat = categoryBySlug(slug);
  const { t } = useLanguage();
  const [products, setProducts] = React.useState<Product[]>([]);
  const [filters, setFilters] = React.useState<Filters>({
    categorySlug: slug ?? "all",
    priceMaxCents: 5000,
    dietary: [],
  });
  const [sort, setSort] = React.useState<SortKey>("newest");

  React.useEffect(() => {
    setProducts(listProducts());
  }, []);

  React.useEffect(() => {
    setFilters((f) => ({ ...f, categorySlug: slug ?? "all" }));
  }, [slug]);

  if (!cat) notFound();

  const filtered = React.useMemo(() => {
    let list = products.filter((p) => p.categorySlug === slug);
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
  }, [products, slug, filters.priceMaxCents, filters.dietary, sort]);

  return (
    <div className="container py-8">
      <nav className="mb-4 flex items-center gap-1 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-ink">{t("shop.breadcrumbHome")}</Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/shop" className="hover:text-ink">{t("shop.breadcrumbShop")}</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-ink">{t(`category.${cat.slug}` as DictionaryKey)}</span>
      </nav>
      <div className="mb-6 flex items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold">
            {t(`category.${cat.slug}` as DictionaryKey)}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("shop.resultsCount", { n: filtered.length })}
          </p>
        </div>
        <SortSelect value={sort} onChange={setSort} />
      </div>
      <div className="grid gap-6 md:grid-cols-[260px,1fr]">
        <FilterSidebar
          hideCategory
          filters={filters}
          onChange={setFilters}
        />
        <ProductGrid products={filtered} />
      </div>
    </div>
  );
}
