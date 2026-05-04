"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingBag, Tag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductImage } from "@/components/storefront/ProductImage";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useCart } from "@/providers/CartProvider";
import { listProducts } from "@/lib/repository";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types";

export default function CartPage() {
  const { t, locale } = useLanguage();
  const { lines, setQuantity, remove } = useCart();
  const router = useRouter();
  const [products, setProducts] = React.useState<Product[]>([]);
  const [promo, setPromo] = React.useState("");

  React.useEffect(() => {
    setProducts(listProducts());
  }, []);

  const detailed = lines
    .map((l) => {
      const p = products.find((x) => x.id === l.productId);
      return p ? { ...l, product: p } : null;
    })
    .filter((l): l is NonNullable<typeof l> => l !== null);

  const subtotal = detailed.reduce(
    (s, l) => s + l.product.price * l.quantity,
    0,
  );
  const deliveryFee = subtotal >= 5000 || subtotal === 0 ? 0 : 199;
  const total = subtotal + deliveryFee;

  if (detailed.length === 0) {
    return (
      <div className="container py-16">
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-2xl border border-dashed border-border bg-surface p-10 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-secondary text-muted-foreground">
            <ShoppingBag className="h-6 w-6" />
          </span>
          <h1 className="text-xl font-semibold">{t("cart.empty")}</h1>
          <Button asChild>
            <Link href="/shop">{t("cart.emptyCta")}</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="mb-6 text-3xl font-semibold">{t("cart.title")}</h1>
      <div className="grid gap-6 lg:grid-cols-[1fr,360px]">
        <div className="space-y-3">
          {detailed.map(({ product, quantity }) => (
            <div
              key={product.id}
              className="flex gap-4 rounded-2xl border border-border bg-surface p-3"
            >
              <Link
                href={`/product/${product.slug}`}
                className="h-24 w-24 shrink-0 overflow-hidden rounded-xl"
              >
                <ProductImage
                  src={product.imageUrl}
                  alt={product.nameEn}
                  rounded="xl"
                />
              </Link>
              <div className="flex flex-1 flex-col gap-1">
                <Link
                  href={`/product/${product.slug}`}
                  className="font-semibold leading-tight hover:underline"
                >
                  {locale === "zh" ? product.nameZh : product.nameEn}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {locale === "zh" ? product.packSizeZh : product.packSizeEn}
                </p>
                <div className="mt-auto flex items-center justify-between gap-2">
                  <div className="inline-flex items-center rounded-xl border border-border bg-surface">
                    <button
                      onClick={() => setQuantity(product.id, quantity - 1)}
                      className="grid h-9 w-9 place-items-center text-muted-foreground hover:text-ink"
                      aria-label="-"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center text-sm">{quantity}</span>
                    <button
                      onClick={() => setQuantity(product.id, quantity + 1)}
                      className="grid h-9 w-9 place-items-center text-muted-foreground hover:text-ink"
                      aria-label="+"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => remove(product.id)}
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {t("cart.remove")}
                  </button>
                </div>
              </div>
              <div className="text-right text-sm font-semibold">
                {formatPrice(product.price * quantity)}
              </div>
            </div>
          ))}
        </div>
        <aside className="h-fit space-y-4 rounded-2xl border border-border bg-surface p-5">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">
              {t("cart.promo")}
            </label>
            <div className="flex gap-2">
              <Input
                placeholder="WELCOME10"
                value={promo}
                onChange={(e) => setPromo(e.target.value)}
              />
              <Button variant="outline" size="sm">
                <Tag className="h-4 w-4" />
                {t("cart.applyPromo")}
              </Button>
            </div>
          </div>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("cart.subtotal")}</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("cart.deliveryFee")}</span>
              <span>{deliveryFee === 0 ? "Free / 免费" : formatPrice(deliveryFee)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2 text-base font-semibold">
              <span>{t("cart.total")}</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
          <Button className="w-full" size="lg" onClick={() => router.push("/checkout")}>
            {t("cart.proceed")}
          </Button>
          <Button asChild variant="ghost" className="w-full">
            <Link href="/shop">{t("cart.continueShopping")}</Link>
          </Button>
        </aside>
      </div>
    </div>
  );
}
