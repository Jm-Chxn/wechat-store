"use client";

import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types";

const STATUS_STYLES: Record<OrderStatus, string> = {
  CONFIRMED: "bg-sky-50 text-sky-700 ring-sky-200",
  PROCESSING: "bg-amber-50 text-amber-700 ring-amber-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  CANCELLED: "bg-rose-50 text-rose-700 ring-rose-200",
};

export function OrderStatusBadge({
  status,
  label,
  className,
}: {
  status: OrderStatus;
  label: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ring-1 ring-inset",
        STATUS_STYLES[status],
        className,
      )}
    >
      {label}
    </span>
  );
}
