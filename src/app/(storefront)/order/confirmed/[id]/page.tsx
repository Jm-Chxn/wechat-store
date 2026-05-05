"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/storefront/ProductImage";
import { useLanguage } from "@/i18n/LanguageProvider";
import { getOrder } from "@/lib/repository";
import { formatDate, formatPrice } from "@/lib/utils";
import type { Order } from "@/types";

export default function OrderConfirmedPage() {
  const params = useParams<{ id: string }>();
  const { t, locale } = useLanguage();
  const [order, setOrder] = React.useState<Order | null | undefined>(undefined);

  React.useEffect(() => {
    let cancelled = false;
    void getOrder(params.id).then((o) => { if (!cancelled) setOrder(o ?? null); });
    return () => { cancelled = true; };
  }, [params.id]);

  if (order === undefined) {
    return (
      <div className="container py-16 text-center text-muted-foreground">
        {t("common.loading")}
      </div>
    );
  }
  if (order === null) notFound();

  const o = order;

  return (
    <div className="container max-w-3xl py-12">
      <div className="rounded-2xl border border-border bg-surface p-8 text-center shadow-soft">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-green-soft/30 text-[#3f7137]">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h1 className="mt-4 text-2xl font-semibold">{t("order.confirmed")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("order.thankYou")}</p>
        <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs">
          {t("order.id")} {o.id}
        </div>
      </div>

      <section className="mt-6 space-y-4 rounded-2xl border border-border bg-surface p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide">{t("order.summary")}</h2>
        <div className="grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <div className="text-xs text-muted-foreground">{t("order.placedAt")}</div>
            <div>{formatDate(o.createdAt, locale)}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">{t("order.pickupAt")}</div>
            <div>
              {locale === "zh" ? o.pickupCommunityZh : o.pickupCommunityEn}
            </div>
          </div>
        </div>
        <ul className="space-y-3">
          {o.items.map((it) => (
            <li key={it.productId} className="flex items-center gap-3">
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl">
                <ProductImage src={it.imageUrl} alt={it.nameEn} rounded="xl" />
              </div>
              <div className="flex-1 text-sm">
                <div className="line-clamp-1 font-medium">
                  {locale === "zh" ? it.nameZh : it.nameEn}
                </div>
                <div className="text-xs text-muted-foreground">× {it.quantity}</div>
              </div>
              <div className="text-sm font-semibold">
                {formatPrice(it.unitPrice * it.quantity)}
              </div>
            </li>
          ))}
        </ul>
        <div className="space-y-1.5 border-t border-border pt-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t("cart.subtotal")}</span>
            <span>{formatPrice(o.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t("cart.deliveryFee")}</span>
            <span>{o.deliveryFee === 0 ? "Free / 免费" : formatPrice(o.deliveryFee)}</span>
          </div>
          <div className="flex justify-between text-base font-semibold">
            <span>{t("cart.total")}</span>
            <span>{formatPrice(o.total)}</span>
          </div>
        </div>
      </section>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/account/orders">{t("order.viewOrder")}</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/shop">{t("order.continueShopping")}</Link>
        </Button>
      </div>
    </div>
  );
}
