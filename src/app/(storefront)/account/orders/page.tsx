"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/storefront/ProductImage";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useAuth } from "@/providers/AuthProvider";
import { listOrders } from "@/lib/repository";
import { formatDate, formatPrice } from "@/lib/utils";
import type { Order } from "@/types";

export default function MyOrdersPage() {
  const { t, locale } = useLanguage();
  const { user, isReady } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = React.useState<Order[]>([]);

  React.useEffect(() => {
    if (!isReady) return;
    if (!user) {
      router.replace(
        `/auth/wechat/consent?returnTo=${encodeURIComponent("/account/orders")}`,
      );
      return;
    }
    setOrders(listOrders(user.openid));
  }, [isReady, user, router]);

  if (!isReady || !user) {
    return (
      <div className="container py-16 text-center text-muted-foreground">
        {t("common.loading")}
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="mb-6 text-3xl font-semibold">{t("account.myOrders")}</h1>
      {orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface p-10 text-center">
          <p className="text-muted-foreground">{t("account.noOrders")}</p>
          <Button asChild className="mt-4">
            <Link href="/shop">{t("account.startShopping")}</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div
              key={o.id}
              className="rounded-2xl border border-border bg-surface p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-semibold">{o.id}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatDate(o.createdAt, locale)}
                  </div>
                </div>
                <Badge variant="secondary">{t(`order.status.${o.status}` as const)}</Badge>
                <div className="font-semibold">{formatPrice(o.total)}</div>
              </div>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {o.items.map((it) => (
                  <li key={it.productId} className="flex items-center gap-3">
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl">
                      <ProductImage src={it.imageUrl} alt={it.nameEn} rounded="xl" />
                    </div>
                    <div className="flex-1 text-sm">
                      <div className="line-clamp-1 font-medium">
                        {locale === "zh" ? it.nameZh : it.nameEn}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        × {it.quantity} · {formatPrice(it.unitPrice)}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-3 text-xs text-muted-foreground">
                {t("order.pickupAt")}:{" "}
                {locale === "zh" ? o.pickupCommunityZh : o.pickupCommunityEn}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
