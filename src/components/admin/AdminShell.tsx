"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Users,
  ReceiptText,
  Activity,
  LogOut,
  ExternalLink,
  Search,
} from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { cn } from "@/lib/utils";

/**
 * The whole admin chrome. Deliberately styled to contrast with the storefront
 * (cream / warm orange) by using a slate / charcoal palette so the admin
 * surface reads as a separate "console" application instead of a different
 * shopper page.
 *
 * Layout:
 *   - sticky dark sidebar (collapsible on mobile)
 *   - top bar with breadcrumb, env badge, search, sign-out
 *   - light grey content area (vs storefront's cream)
 */
const nav: Array<{
  href: string;
  icon: typeof LayoutDashboard;
  label: string;
  exact?: boolean;
}> = [
  { href: "/admin", icon: LayoutDashboard, label: "Overview", exact: true },
  { href: "/admin/orders", icon: ReceiptText, label: "Orders" },
  { href: "/admin/users", icon: Users, label: "Customers" },
  { href: "/admin/products", icon: Package, label: "Products" },
  { href: "/admin/activity", icon: Activity, label: "Activity" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-900">
      <aside className="hidden w-60 shrink-0 flex-col bg-slate-900 text-slate-200 md:flex">
        <div className="flex h-16 items-center gap-2 border-b border-slate-800 px-5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-amber-soft text-slate-900 text-xs font-bold">
            团
          </span>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-white">Admin Console</div>
            <div className="text-[10px] uppercase tracking-widest text-slate-500">
              tuangou
            </div>
          </div>
        </div>
        <nav className="flex-1 space-y-0.5 px-2 py-4 text-sm">
          {nav.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
                  active
                    ? "bg-slate-800 text-white shadow-inner"
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-100",
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="space-y-2 border-t border-slate-800 p-3 text-xs text-slate-400">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-slate-800/60"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>Open storefront</span>
          </Link>
          <button
            type="button"
            onClick={async () => {
              await signOut();
              router.push("/");
            }}
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-slate-800/60"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/80 px-5 backdrop-blur md:px-8">
          <MobileNav pathname={pathname} />
          <Breadcrumb pathname={pathname} />
          <div className="ml-auto hidden items-center gap-3 md:flex">
            <div className="relative hidden lg:block">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                placeholder="Search orders, customers…"
                aria-label="Search"
                className="w-72 rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-sm placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:outline-none"
                onChange={(e) => {
                  const term = e.target.value.trim();
                  if (!term) return;
                  // Lightweight broadcast — pages subscribe via window event so we
                  // don't have to lift state for a single input.
                  window.dispatchEvent(new CustomEvent("admin-search", { detail: term }));
                }}
              />
            </div>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-emerald-700">
              live
            </span>
            {user && (
              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-3 text-sm">
                {user.avatarUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="h-7 w-7 rounded-full bg-slate-200 object-cover"
                  />
                ) : (
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                )}
                <div className="leading-tight">
                  <div className="text-xs font-medium text-slate-900">{user.name}</div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">
                    {user.role}
                  </div>
                </div>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 px-5 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}

function Breadcrumb({ pathname }: { pathname: string }) {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return null;
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm">
      {segments.map((seg, i) => {
        const href = "/" + segments.slice(0, i + 1).join("/");
        const isLast = i === segments.length - 1;
        return (
          <React.Fragment key={href}>
            {i > 0 && <span className="text-slate-300">/</span>}
            {isLast ? (
              <span className="font-medium capitalize text-slate-900">{seg}</span>
            ) : (
              <Link href={href} className="capitalize text-slate-500 hover:text-slate-700">
                {seg}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

function MobileNav({ pathname }: { pathname: string }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-700"
        aria-label="Open admin nav"
      >
        <LayoutDashboard className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute left-3 top-14 z-30 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
          {nav.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm",
                  active ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

/** Reusable admin "tile" — quietly distinct from the storefront card style. */
export function AdminStatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: "primary" | "success" | "neutral";
}) {
  const accentClass =
    accent === "primary"
      ? "border-l-4 border-l-primary"
      : accent === "success"
        ? "border-l-4 border-l-emerald-500"
        : "border-l-4 border-l-slate-300";
  return (
    <div
      className={cn(
        "rounded-xl bg-white px-5 py-4 shadow-sm ring-1 ring-slate-200",
        accentClass,
      )}
    >
      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">
        {value}
      </div>
      {sub && <div className="mt-0.5 text-xs text-slate-500">{sub}</div>}
    </div>
  );
}

/** Status pill with semantic color per order state. */
export function StatusPill({ status }: { status: "CONFIRMED" | "PROCESSING" | "COMPLETED" | "CANCELLED" }) {
  const styles: Record<typeof status, string> = {
    CONFIRMED: "bg-sky-50 text-sky-700 ring-sky-200",
    PROCESSING: "bg-amber-50 text-amber-700 ring-amber-200",
    COMPLETED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    CANCELLED: "bg-rose-50 text-rose-700 ring-rose-200",
  };
  const label: Record<typeof status, string> = {
    CONFIRMED: "Confirmed",
    PROCESSING: "Processing",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset",
        styles[status],
      )}
    >
      {label[status]}
    </span>
  );
}
