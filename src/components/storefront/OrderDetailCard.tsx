"use client";

import * as React from "react";
import { OrderStatusBadge } from "@/components/storefront/OrderStatusBadge";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/storefront/ProductImage";
import { cancelOrder } from "@/lib/repository";
import { formatDate, formatPrice } from "@/lib/utils";
import type { DictionaryKey } from "@/i18n/strings";
import type { Order } from "@/types";

const CITY_LABELS: Record<string, { en: string; zh: string }> = {
  vancouver: { en: "Vancouver", zh: "温哥华" },
  burnaby: { en: "Burnaby", zh: "本拿比" },
  richmond: { en: "Richmond", zh: "列治文" },
  surrey: { en: "Surrey", zh: "素里" },
  coquitlam: { en: "Coquitlam", zh: "高贵林" },
  "port-coquitlam": { en: "Port Coquitlam", zh: "高贵林港" },
  "port-moody": { en: "Port Moody", zh: "穆迪港" },
  "new-westminster": { en: "New Westminster", zh: "新西敏" },
  "north-vancouver": { en: "North Vancouver", zh: "北温哥华" },
  "west-vancouver": { en: "West Vancouver", zh: "西温哥华" },
  delta: { en: "Delta", zh: "三角洲" },
  langley: { en: "Langley", zh: "兰里" },
  "maple-ridge": { en: "Maple Ridge", zh: "枫树岭" },
  "pitt-meadows": { en: "Pitt Meadows", zh: "匹特草原" },
  "white-rock": { en: "White Rock", zh: "白石" },
};

function isHomeDelivery(o: Order) {
  return Boolean(o.deliveryAddress?.line1);
}

function formatCity(city: string, locale: "en" | "zh") {
  const entry = CITY_LABELS[city];
  if (entry) return locale === "zh" ? entry.zh : entry.en;
  return city;
}

export function OrderDetailCard({
  order: initialOrder,
  locale,
  t,
  showCancel = true,
  onOrderUpdated,
}: {
  order: Order;
  locale: "en" | "zh";
  t: (key: DictionaryKey, vars?: Record<string, string | number>) => string;
  showCancel?: boolean;
  onOrderUpdated?: (order: Order) => void;
}) {
  const [order, setOrder] = React.useState(initialOrder);
  const [cancelStep, setCancelStep] = React.useState<"idle" | "confirm">("idle");
  const [cancelling, setCancelling] = React.useState(false);

  React.useEffect(() => {
    setOrder(initialOrder);
    setCancelStep("idle");
  }, [initialOrder]);

  const homeDelivery = isHomeDelivery(order);
  const canCancel =
    showCancel && order.status !== "CANCELLED" && order.status !== "COMPLETED";

  const handleCancelClick = async () => {
    if (cancelStep === "idle") {
      setCancelStep("confirm");
      return;
    }
    setCancelling(true);
    try {
      const updated = await cancelOrder(order.id);
      if (updated) {
        setOrder(updated);
        onOrderUpdated?.(updated);
      }
    } finally {
      setCancelling(false);
      setCancelStep("idle");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="font-semibold">
            {t("order.id")} {order.id}
          </div>
          <div className="text-xs text-muted-foreground">
            {formatDate(order.createdAt, locale)}
          </div>
        </div>
        <OrderStatusBadge
          status={order.status}
          label={t(`order.status.${order.status}` as DictionaryKey)}
        />
        <div className="font-semibold">{formatPrice(order.total)}</div>
      </div>

      <ul className="grid gap-2 sm:grid-cols-2">
        {order.items.map((it, index) => (
          <li key={`${order.id}-${it.productId}-${index}`} className="flex items-center gap-3">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl">
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

      <div className="grid gap-2 text-sm sm:grid-cols-2">
        {homeDelivery && order.deliveryAddress ? (
          <div className="sm:col-span-2">
            <div className="text-xs text-muted-foreground">{t("order.deliveryAddress")}</div>
            <div>
              {order.deliveryAddress.line1}
              {order.deliveryAddress.line2 ? `, ${order.deliveryAddress.line2}` : ""}
              <br />
              {formatCity(order.deliveryAddress.city, locale)}, {order.deliveryAddress.postalCode}
            </div>
          </div>
        ) : (
          <div>
            <div className="text-xs text-muted-foreground">{t("order.pickupAt")}</div>
            <div>
              {locale === "zh" ? order.pickupCommunityZh : order.pickupCommunityEn}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-1.5 border-t border-border pt-3 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t("cart.subtotal")}</span>
          <span>{formatPrice(order.subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t("cart.deliveryFee")}</span>
          <span>{order.deliveryFee === 0 ? "Free / 免费" : formatPrice(order.deliveryFee)}</span>
        </div>
        <div className="flex justify-between font-semibold">
          <span>{t("cart.total")}</span>
          <span>{formatPrice(order.total)}</span>
        </div>
      </div>

      {canCancel && (
        <div className="flex flex-wrap gap-2 border-t border-border pt-3">
          {cancelStep === "confirm" && (
            <Button type="button" variant="outline" size="sm" onClick={() => setCancelStep("idle")}>
              {t("order.cancelActionBack")}
            </Button>
          )}
          <Button
            type="button"
            variant="destructive"
            size="sm"
            disabled={cancelling}
            onClick={() => void handleCancelClick()}
          >
            {cancelStep === "idle" ? t("order.cancelOrder") : t("order.confirmCancel")}
          </Button>
        </div>
      )}
    </div>
  );
}
