"use client";

import * as React from "react";
import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AdminStatCard, StatusPill } from "@/components/admin/AdminShell";
import { adminApi, type AdminOrder, type AdminStatsPayload } from "@/lib/api/admin";
import { categoryBySlug } from "@/data/categories";
import { formatPrice } from "@/lib/utils";
import { useLanguage } from "@/i18n/LanguageProvider";

export default function AdminDashboardPage() {
  const { t } = useLanguage();
  const [stats, setStats] = React.useState<AdminStatsPayload | null>(null);
  const [recent, setRecent] = React.useState<AdminOrder[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  const loadData = React.useCallback(async () => {
    setError(null);
    setStats(null);
    try {
      const [s, o] = await Promise.all([adminApi.stats(), adminApi.listOrders()]);
      setStats(s);
      setRecent(o.slice(0, 8));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, []);

  React.useEffect(() => {
    void loadData();
  }, [loadData]);

  if (!stats) {
    return (
      <div className="space-y-3">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {t("admin.statsError")}
            <div>
              <button onClick={loadData} className="mt-2 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-red-700 border border-red-200 hover:bg-red-50">
                Retry
              </button>
            </div>
          </div>
        )}
        <div className="h-24 animate-pulse rounded-xl bg-gray-200" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-200" />
          ))}
        </div>
      </div>
    );
  }

  const topCat = stats.topCategorySlug ? categoryBySlug(stats.topCategorySlug) : null;

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
            {t("admin.overview")}
          </div>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">
            {t("admin.welcomeBack")}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {t("admin.dashboardSubtitle")}
          </p>
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard
          label={t("admin.statTotalCustomers")}
          value={String(stats.totalUsers)}
          sub={t("admin.statProfilesSub")}
          accent="neutral"
        />
        <AdminStatCard
          label={t("admin.statOrdersToday")}
          value={String(stats.ordersToday)}
          accent="primary"
        />
        <AdminStatCard
          label={t("admin.statRevenueToday")}
          value={formatPrice(stats.revenueTodayCents)}
          accent="success"
        />
        <AdminStatCard
          label={t("admin.statTopCategory")}
          value={topCat ? topCat.nameEn : "—"}
          sub={topCat ? topCat.nameZh : undefined}
          accent="neutral"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title={t("admin.ordersLast7d")} subtitle={t("admin.dailyCount")}>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.ordersLast7d}>
                <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    border: "1px solid #E2E8F0",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="orders"
                  stroke="#0F172A"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#0F172A" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title={t("admin.revenueByCategory")} subtitle={t("admin.usd")}>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.revenueByCategory.map((r) => {
                  const cat = categoryBySlug(r.categorySlug);
                  return {
                    name: cat?.nameEn ?? r.categorySlug,
                    revenue: Math.round(r.revenue / 100),
                  };
                })}
              >
                <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  stroke="#64748B"
                  fontSize={10}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  height={60}
                />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    border: "1px solid #E2E8F0",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="revenue" fill="#475569" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <Panel
        title={t("admin.latestOrders")}
        subtitle={`${recent.length} most recent`}
        action={
          <Link
            href="/admin/orders"
            className="text-xs font-medium text-slate-600 hover:text-slate-900"
          >
            View all →
          </Link>
        }
      >
        {recent.length === 0 ? (
          <div className="py-6 text-center text-sm text-slate-500">{t("admin.noOrders")}</div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {recent.map((o) => (
              <li
                key={o.id}
                className="flex flex-wrap items-center gap-3 py-3 text-sm"
              >
                <code className="font-mono text-[11px] text-slate-500">{o.id}</code>
                <span className="font-medium text-slate-900">
                  {o.customerName ?? o.guestName ?? "Guest"}
                </span>
                <span className="text-slate-500">·</span>
                <span className="text-slate-500">
                  {o.items.length} item{o.items.length === 1 ? "" : "s"}
                </span>
                <span className="ml-auto font-semibold tabular-nums text-slate-900">
                  {formatPrice(o.totalCents)}
                </span>
                <StatusPill status={o.status} />
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}

function Panel({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}
