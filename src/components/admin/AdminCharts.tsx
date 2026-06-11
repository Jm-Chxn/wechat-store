"use client";

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
import { categoryBySlug } from "@/data/categories";
import { useLanguage } from "@/i18n/LanguageProvider";

interface OrderDay {
  date: string;
  orders: number;
  revenue: number;
}

interface CategoryRevenue {
  categorySlug: string;
  revenue: number;
}

interface AdminChartsProps {
  ordersLast7d: OrderDay[];
  revenueByCategory: CategoryRevenue[];
}

export default function AdminCharts({ ordersLast7d, revenueByCategory }: AdminChartsProps) {
  const { t } = useLanguage();

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel title={t("admin.ordersLast7d")} subtitle={t("admin.dailyCount")}>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={ordersLast7d}>
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
              data={revenueByCategory.map((r) => {
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
  );
}

function Panel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
      </header>
      {children}
    </section>
  );
}
