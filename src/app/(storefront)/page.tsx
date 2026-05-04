"use client";

import * as React from "react";
import { Hero } from "@/components/storefront/Hero";
import { TrustBar } from "@/components/storefront/TrustBar";
import { PopularStrip } from "@/components/storefront/PopularStrip";
import { CategoryTiles } from "@/components/storefront/CategoryTiles";
import { NewArrivals } from "@/components/storefront/NewArrivals";
import { CommunityNotice } from "@/components/storefront/CommunityNotice";
import { listProducts } from "@/lib/repository";
import type { Product } from "@/types";

export default function HomePage() {
  const [products, setProducts] = React.useState<Product[]>([]);

  React.useEffect(() => {
    setProducts(listProducts());
  }, []);

  // "Popular This Week" — pick a deterministic sample so it doesn't reshuffle.
  const popular = React.useMemo(
    () => products.filter((p) => p.stockStatus !== "OUT_OF_STOCK").slice(0, 8),
    [products],
  );
  const newArrivals = React.useMemo(
    () => products.filter((p) => p.isNew),
    [products],
  );

  return (
    <>
      <Hero />
      <TrustBar />
      <PopularStrip products={popular} />
      <CommunityNotice />
      <CategoryTiles />
      <NewArrivals products={newArrivals} />
    </>
  );
}
