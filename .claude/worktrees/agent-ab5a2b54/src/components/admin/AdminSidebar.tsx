"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Users,
  ReceiptText,
  Activity,
  ArrowLeft,
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { LanguageToggle } from "@/components/common/LanguageToggle";
import { cn } from "@/lib/utils";

const items = [
  { href: "/admin", icon: LayoutDashboard, key: "admin.title" as const },
  { href: "/admin/products", icon: Package, key: "admin.products" as const },
  { href: "/admin/users", icon: Users, key: "admin.users" as const },
  { href: "/admin/orders", icon: ReceiptText, key: "admin.orders" as const },
  { href: "/admin/activity", icon: Activity, key: "admin.activity" as const },
];

export function AdminSidebar() {
  const { t } = useLanguage();
  const pathname = usePathname();
  return (
    <aside className="border-r border-border bg-surface md:sticky md:top-0 md:h-screen md:w-64 md:shrink-0">
      <div className="flex items-center justify-between p-4">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-ink">
          <ArrowLeft className="h-4 w-4" />
          {t("brand.name")}
        </Link>
        <LanguageToggle />
      </div>
      <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:overflow-visible md:px-3 md:pb-3">
        {items.map((it) => {
          const active =
            it.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(it.href);
          return (
            <Link
              key={it.href}
              href={it.href}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary",
              )}
            >
              <it.icon className="h-4 w-4" />
              {t(it.key)}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
