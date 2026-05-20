"use client";

import * as React from "react";
import { Search, Mail, Phone, ShoppingBag, X, Calendar } from "lucide-react";
import { adminApi, type AdminUser, type AdminOrder } from "@/lib/api/admin";
import { formatDate, formatPrice } from "@/lib/utils";

/**
 * /admin/users — one row per registered customer.
 *
 * The previous version queried wx_openid against mock data and rendered nothing
 * when the backend returned auth.users-shaped rows. This version is the
 * single source of truth: it pulls real users from /api/v1/admin/users (which
 * joins `profiles` to `auth.users` for email + phone), shows order count and
 * total spent, and lets you click a row to see that customer's orders in a
 * side drawer.
 */
export default function AdminUsersPage() {
  const [users, setUsers] = React.useState<AdminUser[]>([]);
  const [orders, setOrders] = React.useState<AdminOrder[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState<"ALL" | "user" | "admin">("ALL");
  const [selected, setSelected] = React.useState<AdminUser | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [u, o] = await Promise.all([adminApi.listUsers(), adminApi.listOrders()]);
        if (cancelled) return;
        setUsers(u);
        setOrders(o);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = React.useMemo(() => {
    const term = search.trim().toLowerCase();
    return users.filter((u) => {
      if (roleFilter !== "ALL" && u.role !== roleFilter) return false;
      if (!term) return true;
      return [
        u.fullName ?? "",
        u.nickname ?? "",
        u.wechatId ?? "",
        u.email ?? "",
        u.phone ?? "",
        u.userId,
      ]
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [users, roleFilter, search]);

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
            Customers
          </div>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">Registered users</h1>
          <p className="mt-1 text-sm text-slate-600">
            {loading
              ? "Loading…"
              : `${filtered.length} of ${users.length} customer${users.length === 1 ? "" : "s"}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, phone…"
              className="w-72 rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-sm placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-700 focus:outline-none"
            aria-label="Filter by role"
          >
            <option value="ALL">All roles</option>
            <option value="user">Customers</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </header>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
          <div className="font-semibold">Failed to load users</div>
          <div className="mt-1 font-mono text-xs">{error}</div>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <table className="w-full table-fixed border-collapse text-sm">
          <colgroup>
            <col className="w-56" />
            <col className="w-36" />
            <col className="w-36" />
            <col className="w-44" />
            <col className="w-44" />
            <col className="w-24" />
            <col className="w-28" />
            <col className="w-32" />
            <col className="w-32" />
          </colgroup>
          <thead className="bg-slate-50 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-2.5">Customer</th>
              <th className="px-4 py-2.5">WeChat</th>
              <th className="px-4 py-2.5">Email</th>
              <th className="px-4 py-2.5">Phone</th>
              <th className="px-4 py-2.5">Role</th>
              <th className="px-4 py-2.5 text-right">Orders</th>
              <th className="px-4 py-2.5 text-right">Total spent</th>
              <th className="px-4 py-2.5">Last seen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-sm text-slate-500">
                  Loading…
                </td>
              </tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-sm text-slate-500">
                  No customers match.
                </td>
              </tr>
            )}
            {filtered.map((u) => (
              <tr
                key={u.userId}
                onClick={() => setSelected(u)}
                className="cursor-pointer hover:bg-slate-50"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    {u.avatarUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={u.avatarUrl}
                        alt={u.nickname ?? "user"}
                        className="h-8 w-8 rounded-full bg-slate-100 object-cover"
                      />
                    ) : (
                      <span className="grid h-8 w-8 place-items-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">
                        {(u.fullName ?? u.nickname ?? u.email ?? "?").charAt(0).toUpperCase()}
                      </span>
                    )}
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-slate-900">
                        {u.fullName ?? u.nickname ?? u.email ?? "(no name)"}
                      </div>
                      <code className="block truncate font-mono text-[10px] text-slate-500">
                        {u.userId.slice(0, 8)}…
                      </code>
                    </div>
                  </div>
                </td>
                <td className="truncate px-4 py-3 text-xs text-slate-700">
                  {u.wechatId ?? <span className="text-slate-400">—</span>}
                </td>
                <td className="truncate px-4 py-3 text-xs text-slate-700">
                  {u.email ?? <span className="text-slate-400">—</span>}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-slate-700">
                  {u.phone ?? <span className="text-slate-400">—</span>}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={
                      u.role === "admin"
                        ? "rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white"
                        : "rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-slate-700"
                    }
                  >
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-slate-900">
                  {u.orderCount}
                </td>
                <td className="px-4 py-3 text-right tabular-nums font-medium text-slate-900">
                  {formatPrice(u.totalSpentCents)}
                </td>
                <td className="px-4 py-3 text-xs text-slate-500">
                  {u.lastSeenAt ? formatDate(u.lastSeenAt) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <UserDrawer
          user={selected}
          orders={orders.filter((o) => o.userId === selected.userId)}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}

function UserDrawer({
  user,
  orders,
  onClose,
}: {
  user: AdminUser;
  orders: AdminOrder[];
  onClose: () => void;
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
        aria-label="User details"
      >
        <header className="flex items-start justify-between border-b border-slate-200 px-5 py-4">
          <div className="flex items-center gap-3">
            {user.avatarUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={user.avatarUrl}
                alt={user.nickname ?? "user"}
                className="h-10 w-10 rounded-full bg-slate-100 object-cover"
              />
            ) : (
              <span className="grid h-10 w-10 place-items-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700">
                {(user.fullName ?? user.nickname ?? user.email ?? "?").charAt(0).toUpperCase()}
              </span>
            )}
            <div>
              <div className="text-base font-semibold text-slate-900">
                {user.fullName ?? user.nickname ?? user.email ?? "(no name)"}
              </div>
              <code className="font-mono text-xs text-slate-500">{user.userId}</code>
            </div>
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
              Contact
            </div>
            <ul className="mt-2 space-y-1.5 text-xs text-slate-700">
              {user.fullName && (
                <li>
                  <span className="text-slate-500">Full name: </span>
                  {user.fullName}
                </li>
              )}
              {user.wechatId && (
                <li>
                  <span className="text-slate-500">WeChat: </span>
                  {user.wechatId}
                </li>
              )}
              <li className="flex items-center gap-1.5">
                <Mail className="h-3 w-3 text-slate-400" />
                {user.email ? (
                  <a href={`mailto:${user.email}`} className="hover:underline">
                    {user.email}
                  </a>
                ) : (
                  <span className="text-slate-400">no email on file</span>
                )}
              </li>
              <li className="flex items-center gap-1.5">
                <Phone className="h-3 w-3 text-slate-400" />
                {user.phone ? (
                  <a href={`tel:${user.phone}`} className="hover:underline">
                    {user.phone}
                  </a>
                ) : (
                  <span className="text-slate-400">no phone on file</span>
                )}
              </li>
              {user.createdAt && (
                <li className="flex items-center gap-1.5">
                  <Calendar className="h-3 w-3 text-slate-400" />
                  Joined {formatDate(user.createdAt)}
                </li>
              )}
            </ul>
          </section>

          <section className="grid grid-cols-2 gap-3">
            <Stat label="Orders" value={String(user.orderCount)} />
            <Stat label="Total spent" value={formatPrice(user.totalSpentCents)} emphasis />
          </section>

          <section>
            <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <ShoppingBag className="h-3 w-3" />
              Order history ({orders.length})
            </div>
            {orders.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-200 px-4 py-6 text-center text-xs text-slate-500">
                No orders yet.
              </div>
            ) : (
              <ul className="space-y-2">
                {orders.map((o) => (
                  <li
                    key={o.id}
                    className="rounded-lg border border-slate-200 bg-white p-3 text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <code className="font-mono text-[11px] text-slate-700">{o.id}</code>
                      <span className="tabular-nums font-semibold text-slate-900">
                        {formatPrice(o.totalCents)}
                      </span>
                    </div>
                    <div className="mt-1 text-[11px] text-slate-500">
                      {o.createdAt ? formatDate(o.createdAt) : "—"} · {o.status.toLowerCase()} ·{" "}
                      {o.items.length} item{o.items.length === 1 ? "" : "s"}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </aside>
    </>
  );
}

function Stat({ label, value, emphasis }: { label: string; value: string; emphasis?: boolean }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </div>
      <div
        className={
          emphasis
            ? "mt-0.5 text-lg font-semibold tabular-nums text-slate-900"
            : "mt-0.5 text-lg font-semibold tabular-nums text-slate-900"
        }
      >
        {value}
      </div>
    </div>
  );
}
