"use client";

export const dynamic = "force-dynamic";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { OrderDetailCard } from "@/components/storefront/OrderDetailCard";
import { OrdersPageSkeleton } from "@/components/storefront/OrdersPageSkeleton";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useAuth } from "@/providers/AuthProvider";
import { listOrders } from "@/lib/repository";
import type { Order } from "@/types";

export default function MyOrdersPage() {
  const { t, locale } = useLanguage();
  const { user, isReady } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = React.useState<Order[] | null>(null);
  const [fetchError, setFetchError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!isReady) return;
    if (!user) {
      router.replace(
        `/account/login?next=${encodeURIComponent("/account/orders")}`,
      );
      return;
    }
    let cancelled = false;
    listOrders(user.id)
      .then((o) => {
        if (!cancelled) setOrders(o);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setFetchError(
            err instanceof Error ? err.message : t("account.ordersError"),
          );
          setOrders([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [isReady, user, router]);

  const onOrderUpdated = React.useCallback((updated: Order) => {
    setOrders((cur) => (cur ? cur.map((o) => (o.id === updated.id ? updated : o)) : cur));
  }, []);

  if (!isReady || !user) {
    return <OrdersPageSkeleton />;
  }

  if (orders === null) {
    return <OrdersPageSkeleton />;
  }

  if (fetchError) {
    return (
      <div className="container py-8">
        <h1 className="mb-6 text-3xl font-semibold">{t("account.myOrders")}</h1>
        <div className="rounded-2xl border border-dashed border-border bg-surface p-10 text-center">
          <p className="text-muted-foreground">{t("account.ordersError")}</p>
        </div>
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
              <OrderDetailCard
                order={o}
                locale={locale}
                t={t}
                onOrderUpdated={onOrderUpdated}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
