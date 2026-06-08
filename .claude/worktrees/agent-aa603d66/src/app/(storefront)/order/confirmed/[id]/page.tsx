"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrderConfirmedSkeleton } from "@/components/storefront/OrderConfirmedSkeleton";
import { OrderDetailCard } from "@/components/storefront/OrderDetailCard";
import { useLanguage } from "@/i18n/LanguageProvider";
import { getOrder } from "@/lib/repository";
import type { Order } from "@/types";

export default function OrderConfirmedPage() {
  const params = useParams<{ id: string }>();
  const { t, locale } = useLanguage();
  const [order, setOrder] = React.useState<Order | null | undefined>(undefined);

  React.useEffect(() => {
    let cancelled = false;
    void getOrder(params.id).then((o) => {
      if (!cancelled) setOrder(o ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  if (order === undefined) {
    return <OrderConfirmedSkeleton />;
  }
  if (order === null) notFound();

  return (
    <div className="container max-w-3xl py-12">
      <div className="rounded-2xl border border-border bg-surface p-8 text-center shadow-soft">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-green-soft/30 text-[#3f7137]">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h1 className="mt-4 text-2xl font-semibold">{t("order.confirmed")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("order.thankYou")}</p>
        <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs">
          {t("order.id")} {order.id}
        </div>
      </div>

      <section className="mt-6 rounded-2xl border border-border bg-surface p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide">
          {t("order.summary")}
        </h2>
        <OrderDetailCard order={order} locale={locale} t={t} showCancel={false} />
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
