"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter, notFound } from "next/navigation";
import { ChevronRight, Heart, Minus, Plus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ProductImage } from "@/components/storefront/ProductImage";
import { ProductCard } from "@/components/storefront/ProductCard";
import { NewBadge, StockBadge } from "@/components/storefront/StockBadge";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useCart } from "@/providers/CartProvider";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/providers/AuthProvider";
import { listProducts, getProduct, logActivity } from "@/lib/repository";
import { formatPrice } from "@/lib/utils";
import { categoryBySlug } from "@/data/categories";
import type { Product } from "@/types";
import type { DictionaryKey } from "@/i18n/strings";

export default function ProductDetailPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const { t, locale } = useLanguage();
  const { user } = useAuth();
  const { add } = useCart();
  const { toast } = useToast();

  const [allProducts, setAllProducts] = React.useState<Product[]>([]);
  const [qty, setQty] = React.useState(1);

  React.useEffect(() => {
    setAllProducts(listProducts());
  }, []);

  const product = React.useMemo(
    () => allProducts.find((p) => p.slug === params.slug) ?? getProduct(params.slug),
    [allProducts, params.slug],
  );

  if (!params.slug) notFound();
  if (!product) {
    return (
      <div className="container py-16 text-center text-muted-foreground">
        {t("common.loading")}
      </div>
    );
  }

  const cat = categoryBySlug(product.categorySlug);
  const oos = product.stockStatus === "OUT_OF_STOCK";
  const related = allProducts
    .filter((p) => p.categorySlug === product.categorySlug && p.id !== product.id)
    .slice(0, 4);

  const onAdd = () => {
    if (oos) return;
    add(product.id, qty);
    toast({
      title: t("product.added"),
      description: locale === "zh" ? product.nameZh : product.nameEn,
    });
  };
  const onBuy = () => {
    if (oos) return;
    add(product.id, qty);
    logActivity("CLICK_BUY", user?.id ?? null, { productId: product.id });
    router.push("/checkout");
  };

  return (
    <div className="container py-8">
      <nav className="mb-4 flex items-center gap-1 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-ink">{t("shop.breadcrumbHome")}</Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/shop" className="hover:text-ink">{t("shop.breadcrumbShop")}</Link>
        {cat && (
          <>
            <ChevronRight className="h-4 w-4" />
            <Link href={`/category/${cat.slug}`} className="hover:text-ink">
              {t(`category.${cat.slug}` as DictionaryKey)}
            </Link>
          </>
        )}
        <ChevronRight className="h-4 w-4" />
        <span className="line-clamp-1 text-ink">
          {locale === "zh" ? product.nameZh : product.nameEn}
        </span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="overflow-hidden rounded-2xl border border-border bg-surface">
            <ProductImage
              src={product.imageUrl}
              alt={product.nameEn}
              rounded="none"
              className="aspect-square"
            />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="aspect-square overflow-hidden rounded-xl border border-border bg-surface"
              >
                <ProductImage
                  src={product.imageUrl}
                  alt={`${product.nameEn} ${i + 1}`}
                  rounded="none"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            {product.isNew && <NewBadge />}
            <StockBadge status={product.stockStatus} />
            {product.dietaryTags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {t(`tag.${tag}` as DictionaryKey)}
              </Badge>
            ))}
          </div>
          <div>
            <h1 className="text-3xl font-semibold leading-tight">
              {locale === "zh" ? product.nameZh : product.nameEn}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {locale === "zh" ? product.nameEn : product.nameZh} ·{" "}
              {locale === "zh" ? product.packSizeZh : product.packSizeEn}
            </p>
          </div>
          <div className="text-3xl font-bold text-primary">
            {formatPrice(product.price)}
          </div>
          <p className="max-w-prose text-ink/85">
            {locale === "zh" ? product.descriptionZh : product.descriptionEn}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center rounded-xl border border-border bg-surface">
              <button
                type="button"
                aria-label="-"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="grid h-10 w-10 place-items-center text-muted-foreground hover:text-ink"
                disabled={oos}
              >
                <Minus className="h-4 w-4" />
              </button>
              <input
                aria-label={t("product.qty")}
                type="number"
                value={qty}
                onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
                className="h-10 w-12 border-0 bg-transparent text-center text-sm focus:outline-none"
                disabled={oos}
              />
              <button
                type="button"
                aria-label="+"
                onClick={() => setQty((q) => q + 1)}
                className="grid h-10 w-10 place-items-center text-muted-foreground hover:text-ink"
                disabled={oos}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <Button onClick={onAdd} disabled={oos}>
              <ShoppingBag className="h-4 w-4" />
              {t("product.addToCart")}
            </Button>
            <Button variant="outline" onClick={onBuy} disabled={oos}>
              {t("product.buyNow")}
            </Button>
            <Button variant="ghost" size="icon" aria-label={t("product.savedForLater")}>
              <Heart className="h-4 w-4" />
            </Button>
          </div>

          <Accordion type="single" collapsible className="mt-4 rounded-2xl border border-border bg-surface px-4">
            <AccordionItem value="ingredients">
              <AccordionTrigger>{t("product.ingredients")}</AccordionTrigger>
              <AccordionContent>{t("product.ingredientsBody")}</AccordionContent>
            </AccordionItem>
            <AccordionItem value="nutrition">
              <AccordionTrigger>{t("product.nutrition")}</AccordionTrigger>
              <AccordionContent>{t("product.nutritionBody")}</AccordionContent>
            </AccordionItem>
            <AccordionItem value="storage">
              <AccordionTrigger>{t("product.storage")}</AccordionTrigger>
              <AccordionContent>{t("product.storageBody")}</AccordionContent>
            </AccordionItem>
            <AccordionItem value="origin">
              <AccordionTrigger>{t("product.origin")}</AccordionTrigger>
              <AccordionContent>{t("product.originBody")}</AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="mb-4 text-2xl font-semibold">
            {t("product.youMightAlsoLike")}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
