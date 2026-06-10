"use client";

import * as React from "react";
import { Search, Filter, X, Phone, Mail, Calendar, Package, MessageCircle, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/admin/AdminShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { adminApi, type AdminOrder } from "@/lib/api/admin";
import { formatDate, formatPrice } from "@/lib/utils";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useToast } from "@/components/ui/toast";
import type { DictionaryKey } from "@/i18n/strings";

const STATUSES: AdminOrder["status"][] = ["CONFIRMED", "PROCESSING", "COMPLETED", "CANCELLED"];

const STATUS_LABEL_KEY: Record<AdminOrder["status"], DictionaryKey> = {
  CONFIRMED: "admin.statusConfirmed",
  PROCESSING: "admin.statusProcessing",
  COMPLETED: "admin.statusCompleted",
  CANCELLED: "admin.statusCancelled",
};

export default function AdminOrdersPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [orders, setOrders] = React.useState<AdminOrder[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<"ALL" | AdminOrder["status"]>("ALL");
  const [selected, setSelected] = React.useState<AdminOrder | null>(null);
  const [confirm, setConfirm] = React.useState<AdminOrder | null>(null);

  const load = React.useCallback(async () => {
    try {
      setError(null);
      const list = await adminApi.listOrders();
      setOrders(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  React.useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail;
      if (typeof detail === "string") setSearch(detail);
    };
    window.addEventListener("admin-search", handler);
    return () => window.removeEventListener("admin-search", handler);
  }, []);

  const filtered = React.useMemo(() => {
    const term = search.trim().toLowerCase();
    return orders.filter((o) => {
      if (statusFilter !== "ALL" && o.status !== statusFilter) return false;
      if (!term) return true;
      const haystack = [
        o.id,
        o.customerName ?? "",
        o.customerWechatId ?? "",
        o.customerEmail ?? "",
        o.customerPhone ?? "",
        o.guestName ?? "",
        ...o.items.map((i) => i.nameEn),
        ...o.items.map((i) => i.nameZh),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [orders, search, statusFilter]);

  const onDelete = async (order: AdminOrder) => {
    try {
      await adminApi.deleteOrder(order.id);
      setOrders((cur) => cur.filter((o) => o.id !== order.id));
      if (selected?.id === order.id) setSelected(null);
      setConfirm(null);
      toast({ title: t("admin.orderDeleted"), description: order.id });
    } catch (err) {
      toast({
        title: t("admin.ordersLoadError"),
        description: err instanceof Error ? err.message : String(err),
      });
    }
  };

  const onChangeStatus = async (id: string, status: AdminOrder["status"]) => {
    try {
      const updated = await adminApi.updateOrderStatus(id, status);
      setOrders((cur) => cur.map((o) => (o.id === id ? { ...o, ...updated } : o)));
      setSelected((cur) => (cur && cur.id === id ? { ...cur, ...updated } : cur));
    } catch (err) {
      toast({
        title: "Failed to update order status",
        description: err instanceof Error ? err.message : String(err),
      });
    }
  };

  return (
    <div className="space-y-5">
      <AdminPageHeader
        section={t("admin.orders")}
        title={t("admin.ordersPageTitle")}
        subtitle={loading ? t("common.loading") : t("admin.ordersCount", { n: filtered.length, total: orders.length })}
      >
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("admin.ordersSearchPlaceholder")}
            className="w-48 rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-sm placeholder:text-slate-400 focus:border-slate-400 focus:outline-none sm:w-72"
          />
        </div>
        <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm">
          <Filter className="h-3.5 w-3.5 text-slate-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="bg-transparent text-slate-700 focus:outline-none"
            aria-label="Filter by status"
          >
            <option value="ALL">{t("admin.ordersFilterAllStatuses")}</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{t(STATUS_LABEL_KEY[s])}</option>
            ))}
          </select>
        </div>
      </AdminPageHeader>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
          <div className="font-semibold">{t("admin.ordersLoadError")}</div>
          <div className="mt-1 font-mono text-xs">{error}</div>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse text-sm">
          <thead className="bg-slate-50 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-2.5">{t("admin.orderColOrder")}</th>
              <th className="px-4 py-2.5">{t("admin.orderColCustomer")}</th>
              <th className="hidden px-4 py-2.5 sm:table-cell">{t("admin.orderColPhone")}</th>
              <th className="hidden px-4 py-2.5 md:table-cell">{t("admin.orderColItems")}</th>
              <th className="px-4 py-2.5 text-right">{t("admin.orderColTotal")}</th>
              <th className="px-4 py-2.5">{t("admin.ordersStatus")}</th>
              <th className="hidden px-4 py-2.5 lg:table-cell">{t("admin.orderColPlaced")}</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-sm text-slate-500">
                  {t("common.loading")}
                </td>
              </tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-sm text-slate-500">
                  {t("admin.ordersNoMatch")}
                </td>
              </tr>
            )}
            {filtered.map((o) => {
              const customer = o.customerName ?? o.guestName ?? t("common.guest");
              return (
                <tr
                  key={o.id}
                  onClick={() => setSelected(o)}
                  className="cursor-pointer hover:bg-slate-50"
                >
                  <td className="px-4 py-3 align-top">
                    <code className="font-mono text-[11px] text-slate-700">{o.id}</code>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="font-medium text-slate-900">{customer}</div>
                    {o.customerEmail && (
                      <div className="text-xs text-slate-500">{o.customerEmail}</div>
                    )}
                    {o.customerWechatId && (
                      <div className="text-xs text-slate-500">{t("admin.wechatId", { id: o.customerWechatId })}</div>
                    )}
                  </td>
                  <td className="hidden px-4 py-3 align-top sm:table-cell">
                    {o.customerPhone ? (
                      <span className="font-mono text-xs text-slate-700">{o.customerPhone}</span>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                  <td className="hidden px-4 py-3 align-top md:table-cell">
                    <div className="max-w-[200px] truncate text-slate-700">
                      {o.items.slice(0, 2).map((i, idx) => (
                        <span key={i.productId + idx}>
                          {idx > 0 && ", "}
                          {i.nameEn} × {i.quantity}
                        </span>
                      ))}
                      {o.items.length > 2 && (
                        <span className="text-slate-400"> {t("admin.itemsMore", { n: o.items.length - 2 })}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right align-top font-semibold tabular-nums text-slate-900">
                    {formatPrice(o.totalCents)}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <StatusPill status={o.status} />
                  </td>
                  <td className="hidden px-4 py-3 align-top text-xs text-slate-500 lg:table-cell">
                    {o.createdAt ? formatDate(o.createdAt) : "—"}
                  </td>
                  <td className="px-2 py-3 align-top">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setConfirm(o); }}
                      className="grid h-7 w-7 place-items-center rounded-md text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                      aria-label={t("admin.delete")}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </div>

      {selected && (
        <OrderDrawer
          order={selected}
          onClose={() => setSelected(null)}
          onChangeStatus={(status) => onChangeStatus(selected.id, status)}
        />
      )}

      <Dialog open={!!confirm} onOpenChange={(v) => !v && setConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("admin.confirmDeleteOrder")}</DialogTitle>
            <DialogDescription>
              <code className="font-mono text-xs">{confirm?.id}</code>
              {" — "}
              {t("admin.confirmDeleteOrderBody")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirm(null)}>
              {t("admin.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={() => confirm && onDelete(confirm)}
            >
              <Trash2 className="h-4 w-4" />
              {t("admin.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function OrderDrawer({
  order,
  onClose,
  onChangeStatus,
}: {
  order: AdminOrder;
  onClose: () => void;
  onChangeStatus: (status: AdminOrder["status"]) => void;
}) {
  const { t, locale } = useLanguage();

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <aside
        className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col overflow-y-auto bg-white shadow-2xl"
        role="dialog"
        aria-label={t("admin.orderDetail")}
      >
        <header className="flex items-start justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
              {t("admin.orderDetail")}
            </div>
            <code className="mt-1 block font-mono text-xs text-slate-700">{order.id}</code>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-md text-slate-500 hover:bg-slate-100"
            aria-label={t("common.back")}
          >
            <X className="h-4 w-4" />
          </button>
        </header>
        <div className="space-y-5 px-5 py-5 text-sm">
          <section className="rounded-xl bg-slate-50 p-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {t("admin.customerSection")}
            </div>
            <div className="mt-1 text-base font-semibold text-slate-900">
              {order.customerName ?? order.guestName ?? t("common.guest")}
            </div>
            <ul className="mt-2 space-y-1 text-xs text-slate-600">
              {order.customerEmail && (
                <li className="flex items-center gap-1.5">
                  <Mail className="h-3 w-3" />
                  <a href={`mailto:${order.customerEmail}`} className="hover:underline">
                    {order.customerEmail}
                  </a>
                </li>
              )}
              {order.customerPhone && (
                <li className="flex items-center gap-1.5">
                  <Phone className="h-3 w-3" />
                  <a href={`tel:${order.customerPhone}`} className="hover:underline">
                    {order.customerPhone}
                  </a>
                </li>
              )}
              {order.customerWechatId && (
                <li className="flex items-center gap-1.5">
                  <MessageCircle className="h-3 w-3" />
                  <span>{t("admin.wechatId", { id: order.customerWechatId })}</span>
                </li>
              )}
              {order.createdAt && (
                <li className="flex items-center gap-1.5">
                  <Calendar className="h-3 w-3" />
                  {formatDate(order.createdAt)}
                </li>
              )}
            </ul>
          </section>

          <section>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              {t("admin.orderStatusSection")}
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onChangeStatus(s)}
                  className={
                    order.status === s
                      ? "rounded-lg border border-slate-900 bg-slate-900 px-3 py-1.5 text-xs font-medium text-white"
                      : "rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
                  }
                >
                  {t(STATUS_LABEL_KEY[s])}
                </button>
              ))}
            </div>
          </section>

          <section>
            <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <Package className="h-3 w-3" />
              {t("admin.orderItemsSection", { n: order.items.length })}
            </div>
            <ul className="space-y-2">
              {order.items.map((it, idx) => (
                <li
                  key={it.productId + idx}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3"
                >
                  {it.imageUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={it.imageUrl}
                      alt={it.nameEn}
                      className="h-10 w-10 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-lg bg-slate-100" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-slate-900">
                      {locale === "zh" ? it.nameZh : it.nameEn}
                    </div>
                    <div className="text-xs text-slate-500">
                      {locale === "zh" ? it.nameEn : it.nameZh}
                    </div>
                  </div>
                  <div className="text-right text-xs text-slate-600">
                    <div className="tabular-nums">{formatPrice(it.unitPriceCents)}</div>
                    <div>× {it.quantity}</div>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {(order.deliveryAddress?.line1 ? (
            <section className="rounded-xl bg-slate-50 p-4 text-sm">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {t("admin.deliveryAddress")}
              </div>
              <p className="mt-1 text-slate-900">
                {order.deliveryAddress.line1}
                {order.deliveryAddress.line2 ? `, ${order.deliveryAddress.line2}` : ""}
                <br />
                {order.deliveryAddress.city}, {order.deliveryAddress.postalCode}
              </p>
            </section>
          ) : (
            order.pickupCommunityEn && (
              <section className="rounded-xl bg-slate-50 p-4 text-sm">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {t("admin.pickup")}
                </div>
                <p className="mt-1 text-slate-900">
                  {locale === "zh" && order.pickupCommunityZh
                    ? order.pickupCommunityZh
                    : order.pickupCommunityEn}
                </p>
              </section>
            )
          ))}

          <section className="space-y-1 rounded-xl bg-slate-50 p-4 text-sm">
            <Row label={t("admin.subtotal")} value={formatPrice(order.subtotalCents)} />
            <Row label={t("admin.deliveryFee")} value={formatPrice(order.deliveryFeeCents)} />
            <div className="my-1 border-t border-slate-200" />
            <Row label={t("admin.totalLabel")} value={formatPrice(order.totalCents)} emphasis />
          </section>
        </div>
      </aside>
    </>
  );
}

function Row({ label, value, emphasis }: { label: string; value: string; emphasis?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={emphasis ? "font-semibold text-slate-900" : "text-slate-600"}>
        {label}
      </span>
      <span
        className={
          emphasis
            ? "tabular-nums font-semibold text-slate-900"
            : "tabular-nums text-slate-900"
        }
      >
        {value}
      </span>
    </div>
  );
}
