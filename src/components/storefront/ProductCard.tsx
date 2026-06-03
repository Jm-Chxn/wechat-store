"use client";

import * as React from "react";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/storefront/ProductImage";
import { NewBadge, StockBadge } from "@/components/storefront/StockBadge";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useCart } from "@/providers/CartProvider";
import { useToast } from "@/components/ui/toast";
import { cn, formatPrice } from "@/lib/utils";
import type { Product } from "@/types";

interface Props {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: Props) {
  const { t, locale } = useLanguage();
  const { add } = useCart();
  const { toast } = useToast();
  const oos = product.stockStatus === "OUT_OF_STOCK";

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (oos) return;
    add(product.id, 1);
    toast({
      title: t("product.added"),
      description: locale === "zh" ? product.nameZh : product.nameEn,
    });
  };

  return (
    <Link
      href={`/product/${product.slug}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface card-lift",
        oos && "opacity-90",
        className,
      )}
    >
      <div className="relative aspect-square overflow-hidden">
        <ProductImage
          src={product.imageUrl}
          alt={locale === "zh" ? product.nameZh : product.nameEn}
          rounded="none"
          className={cn(
            "transition-transform duration-300 group-hover:scale-[1.04]",
            oos && "grayscale",
          )}
        />
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {product.isNew && <NewBadge />}
          <StockBadge status={product.stockStatus} />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="line-clamp-1 font-semibold leading-tight">
              {locale === "zh" ? product.nameZh : product.nameEn}
            </h3>
            <p className="line-clamp-1 text-xs text-muted-foreground">
              {locale === "zh" ? product.nameEn : product.nameZh} ·{" "}
              {locale === "zh" ? product.packSizeZh : product.packSizeEn}
            </p>
          </div>
          <div className="text-right text-base font-semibold text-primary">
            {formatPrice(product.price)}
          </div>
        </div>
        <Button
          variant={oos ? "outline" : "default"}
          size="default"
          onClick={handleAdd}
          disabled={oos}
          className="mt-auto"
        >
          <ShoppingBag className="h-4 w-4" />
          {oos ? t("product.outOfStock") : t("product.addToCart")}
        </Button>
      </div>
    </Link>
  );
}
