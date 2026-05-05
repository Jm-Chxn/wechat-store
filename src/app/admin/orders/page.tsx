"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ProductImage } from "@/components/storefront/ProductImage";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useAuth } from "@/providers/AuthProvider";
import {
  listOrders,
  listUsers,
  logActivity,
  updateOrderStatus,
} from "@/lib/repository";
import { formatDate, formatPrice } from "@/lib/utils";
import type { Order, OrderStatus, WeChatAccount } from "@/types";
import { useToast } from "@/components/ui/toast";

const statusOptions: OrderStatus[] = ["CONFIRMED", "PROCESSING", "COMPLETED", "CANCELLED"];

export default function AdminOrdersPage() {
  const { t, locale } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [filterStatus, setFilterStatus] = React.useState<"ALL" | OrderStatus>("ALL");
  const [users, setUsers] = React.useState<WeChatAccount[]>([]);

  React.useEffect(() => {
    let cancelled = false;
    void Promise.all([listOrders(), listUsers()]).then(([o, u]) => {
      if (cancelled) return;
      setOrders(o);
      setUsers(u);
    });
    return () => { cancelled = true; };
  }, []);

  const onChange = async (orderId: string, status: OrderStatus) => {
    const next = await updateOrderStatus(orderId, status);
    if (next) {
      setOrders((cur) => cur.map((o) => (o.id === orderId ? next : o)));
      logActivity("ADMIN_ORDER_STATUS", user?.id ?? null, {
        orderId,
        status,
      });
      toast({
        title: t("admin.ordersStatus"),
        description: `${orderId} → ${t(`order.status.${status}` as const)}`,
      });
    }
  };

  const filtered =
    filterStatus === "ALL"
      ? orders
      : orders.filter((o) => o.status === filterStatus);

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{t("admin.ordersTitle")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("shop.resultsCount", { n: filtered.length })}
          </p>
        </div>
        <div className="w-44">
          <Select
            value={filterStatus}
            onValueChange={(v) => setFilterStatus(v as typeof filterStatus)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{t("admin.ordersFilterAll")}</SelectItem>
              {statusOptions.map((s) => (
                <SelectItem key={s} value={s}>
                  {t(`order.status.${s}` as const)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("order.id")}</TableHead>
              <TableHead>{t("admin.users")}</TableHead>
              <TableHead>{t("order.placedAt")}</TableHead>
              <TableHead>{t("checkout.orderSummary")}</TableHead>
              <TableHead>{t("cart.total")}</TableHead>
              <TableHead>{t("admin.ordersStatus")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  {t("admin.empty")}
                </TableCell>
              </TableRow>
            )}
            {filtered.map((o) => {
              const u = users.find((x) => x.openid === o.userOpenid);
              return (
                <TableRow key={o.id}>
                  <TableCell className="font-mono text-xs">{o.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {u ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={u.avatarUrl}
                            alt={u.nicknameEn}
                            className="h-7 w-7 rounded-full bg-secondary object-cover"
                          />
                          <span>{locale === "zh" ? u.nicknameZh : u.nicknameEn}</span>
                        </>
                      ) : (
                        <span className="text-muted-foreground">{t("common.guest")}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDate(o.createdAt, locale)}
                  </TableCell>
                  <TableCell>
                    <div className="flex -space-x-2">
                      {o.items.slice(0, 3).map((it) => (
                        <div
                          key={it.productId}
                          className="h-8 w-8 overflow-hidden rounded-full border-2 border-surface"
                        >
                          <ProductImage src={it.imageUrl} alt={it.nameEn} rounded="none" />
                        </div>
                      ))}
                      {o.items.length > 3 && (
                        <div className="grid h-8 w-8 place-items-center rounded-full border-2 border-surface bg-secondary text-xs">
                          +{o.items.length - 3}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{formatPrice(o.total)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          o.status === "COMPLETED"
                            ? "new"
                            : o.status === "CANCELLED"
                              ? "out"
                              : o.status === "PROCESSING"
                                ? "limited"
                                : "secondary"
                        }
                      >
                        {t(`order.status.${o.status}` as const)}
                      </Badge>
                      <Select
                        value={o.status}
                        onValueChange={(v) => onChange(o.id, v as OrderStatus)}
                      >
                        <SelectTrigger className="h-8 w-32 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((s) => (
                            <SelectItem key={s} value={s}>
                              {t(`order.status.${s}` as const)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
