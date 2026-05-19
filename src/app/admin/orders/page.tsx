"use client";

import * as React from "react";
import { Search, Filter, X, Phone, Mail, Calendar, Package } from "lucide-react";
import { StatusPill } from "@/components/admin/AdminShell";
import { adminApi, type AdminOrder } from "@/lib/api/admin";
import { formatDate, formatPrice } from "@/lib/utils";

const STATUSES: AdminOrder["status"][] = ["CONFIRMED", "PROCESSING", "COMPLETED", "CANCELLED"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = React.useState<AdminOrder[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<"ALL" | AdminOrder["status"]>("ALL");
  const [selected, setSelected] = React.useState<AdminOrder | null>(null);

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

  const onChangeStatus = async (id: string, status: AdminOrder["status"]) => {
    try {
      const updated = await adminApi.updateOrderStatus(id, status);
      setOrders((cur) => cur.map((o) => (o.id === id ? { ...o, ...updated } : o)));
      setSelected((cur) => (cur && cur.id === id ? { ...cur, ...updated } : cur));
    } catch (err) {
      alert(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
            Orders
          </div>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">
            All orders
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {loading
              ? "Loading…"
              : `${filtered.length} of ${orders.length} order${orders.length === 1 ? "" : "s"}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ID, name, phone…"
              className="w-72 rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-sm placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
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
              <option value="ALL">All statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0) + s.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
          <div className="font-semibold">Failed to load orders</div>
          <div className="mt-1 font-mono text-xs">{error}</div>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <table className="w-full table-fixed border-collapse text-sm">
          <colgroup>
            <col className="w-44" />
            <col className="w-48" />
            <col className="w-40" />
            <col />
            <col className="w-28" />
            <col className="w-32" />
            <col className="w-36" />
          </colgroup>
          <thead className="bg-slate-50 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-2.5">Order</th>
              <th className="px-4 py-2.5">Customer</th>
              <th className="px-4 py-2.5">Phone</th>
              <th className="px-4 py-2.5">Items</th>
              <th className="px-4 py-2.5 text-right">Total</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5">Placed</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-sm text-slate-500">
                  Loading orders…
                </td>
              </tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-sm text-slate-500">
                  No orders match.
                </td>
              </tr>
            )}
            {filtered.map((o) => {
              const customer = o.customerName ?? o.guestName ?? "Guest";
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
                  </td>
                  <td className="px-4 py-3 align-top">
                    {o.customerPhone ? (
                      <span className="font-mono text-xs text-slate-700">{o.customerPhone}</span>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="truncate text-slate-700">
                      {o.items.slice(0, 2).map((i, idx) => (
                        <span key={i.productId + idx}>
                          {idx > 0 && ", "}
                          {i.nameEn} × {i.quantity}
                        </span>
                      ))}
                      {o.items.length > 2 && (
                        <span className="text-slate-400"> +{o.items.length - 2} more</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right align-top font-semibold tabular-nums text-slate-900">
                    {formatPrice(o.totalCents)}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <StatusPill status={o.status} />
                  </td>
                  <td className="px-4 py-3 align-top text-xs text-slate-500">
                    {o.createdAt ? formatDate(o.createdAt) : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selected && (
        <OrderDrawer
          order={selected}
          onClose={() => setSelected(null)}
          onChangeStatus={(status) => onChangeStatus(selected.id, status)}
        />
      )}
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
        aria-label="Order details"
      >
        <header className="flex items-start justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
              Order detail
            </div>
            <code className="mt-1 block font-mono text-xs text-slate-700">{order.id}</code>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-md text-slate-500 hover:bg-slate-100"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </header>
        <div className="space-y-5 px-5 py-5 text-sm">
          <section className="rounded-xl bg-slate-50 p-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Customer
            </div>
            <div className="mt-1 text-base font-semibold text-slate-900">
              {order.customerName ?? order.guestName ?? "Guest"}
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
              Status
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
                  {s.charAt(0) + s.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </section>

          <section>
            <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <Package className="h-3 w-3" />
              Items ({order.items.length})
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
                      {it.nameEn}
                    </div>
                    <div className="text-xs text-slate-500">{it.nameZh}</div>
                  </div>
                  <div className="text-right text-xs text-slate-600">
                    <div className="tabular-nums">{formatPrice(it.unitPriceCents)}</div>
                    <div>× {it.quantity}</div>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-1 rounded-xl bg-slate-50 p-4 text-sm">
            <Row label="Subtotal" value={formatPrice(order.subtotalCents)} />
            <Row label="Delivery" value={formatPrice(order.deliveryFeeCents)} />
            <div className="my-1 border-t border-slate-200" />
            <Row label="Total" value={formatPrice(order.totalCents)} emphasis />
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
