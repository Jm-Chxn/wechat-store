"use client";

import * as React from "react";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/i18n/LanguageProvider";
import { computeStats, listOrders, type AdminStats } from "@/lib/repository";
import { categoryBySlug } from "@/data/categories";
import { formatDate, formatPrice } from "@/lib/utils";
import type { DictionaryKey } from "@/i18n/strings";
import type { Order } from "@/types";

export default function AdminDashboardPage() {
  const { t, locale } = useLanguage();
  const [stats, setStats] = React.useState<AdminStats | null>(null);
  const [recent, setRecent] = React.useState<Order[]>([]);

  React.useEffect(() => {
    let cancelled = false;
    void Promise.all([computeStats(), listOrders()]).then(([s, o]) => {
      if (cancelled) return;
      setStats(s);
      setRecent(o.slice(0, 5));
    });
    return () => { cancelled = true; };
  }, []);

  if (!stats) {
    return <div className="p-6 text-muted-foreground">{t("common.loading")}</div>;
  }

  const topCat = stats.topCategorySlug
    ? categoryBySlug(stats.topCategorySlug)
    : null;

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-semibold">{t("admin.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("brand.tagline")}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={t("admin.statTotalUsers")} value={String(stats.totalUsers)} />
        <StatCard
          label={t("admin.statTodayOrders")}
          value={String(stats.ordersToday)}
        />
        <StatCard
          label={t("admin.statTodayRevenue")}
          value={formatPrice(stats.revenueTodayCents)}
          accent
        />
        <StatCard
          label={t("admin.statTopCategory")}
          value={
            topCat
              ? t(`category.${topCat.slug}` as DictionaryKey)
              : "—"
          }
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("admin.recentOrders")}</CardTitle>
            <CardDescription>Last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.ordersLast7d}>
                  <CartesianGrid stroke="#eee" strokeDasharray="3 3" />
                  <XAxis dataKey="date" stroke="#888" fontSize={12} />
                  <YAxis stroke="#888" fontSize={12} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    stroke="#D94F2B"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: "#D94F2B" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("admin.revenueByCategory")}</CardTitle>
            <CardDescription>Total ($)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats.revenueByCategory.map((r) => ({
                    name: t(`category.${r.categorySlug}` as DictionaryKey),
                    revenue: Math.round(r.revenue / 100),
                  }))}
                >
                  <CartesianGrid stroke="#eee" strokeDasharray="3 3" />
                  <XAxis dataKey="name" stroke="#888" fontSize={11} interval={0} angle={-15} dy={10} height={50} />
                  <YAxis stroke="#888" fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#E8B14B" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("admin.recentOrders")}</CardTitle>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("admin.empty")}</p>
          ) : (
            <ul className="divide-y divide-border">
              {recent.map((o) => (
                <li
                  key={o.id}
                  className="flex flex-wrap items-center gap-3 py-3 text-sm"
                >
                  <div className="font-medium">{o.id}</div>
                  <div className="text-muted-foreground">
                    {formatDate(o.createdAt, locale)}
                  </div>
                  <Badge variant="secondary" className="ml-auto">
                    {t(`order.status.${o.status}` as const)}
                  </Badge>
                  <div className="font-semibold">{formatPrice(o.total)}</div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div
        className={
          accent
            ? "mt-1 text-2xl font-semibold text-primary"
            : "mt-1 text-2xl font-semibold"
        }
      >
        {value}
      </div>
    </div>
  );
}
