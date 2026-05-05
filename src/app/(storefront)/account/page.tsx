"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, LogOut, ReceiptText, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useAuth } from "@/providers/AuthProvider";
import { listOrders } from "@/lib/repository";
import { formatDate, formatPrice } from "@/lib/utils";
import type { Order } from "@/types";

export default function AccountPage() {
  const { t, locale } = useLanguage();
  const { user, isReady, signOut } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = React.useState<Order[]>([]);

  React.useEffect(() => {
    if (!isReady) return;
    if (!user) {
      router.replace("/account/login");
      return;
    }
    let cancelled = false;
    void listOrders(user.id).then((o) => { if (!cancelled) setOrders(o); });
    return () => { cancelled = true; };
  }, [isReady, user, router]);

  if (!isReady || !user) {
    return (
      <div className="container py-16 text-center text-muted-foreground">
        {t("common.loading")}
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="mb-6 text-3xl font-semibold">{t("account.title")}</h1>
      <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
        <aside className="space-y-4 rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-center gap-3">
            {user.avatarUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="h-14 w-14 rounded-full bg-secondary object-cover"
              />
            ) : (
              <div className="grid h-14 w-14 place-items-center rounded-full bg-secondary text-xl font-semibold">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <div className="font-semibold leading-tight">{user.name}</div>
              <div className="text-xs text-muted-foreground">{user.email}</div>
            </div>
          </div>
          <div className="space-y-1.5 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>{t("account.openid")}</span>
              <span className="font-mono">{user.id.slice(0, 8)}…</span>
            </div>
            <div className="flex items-center justify-between">
              <span>{t("account.role")}</span>
              <Badge variant={user.role === "admin" ? "admin" : "secondary"}>
                {t(user.role === "admin" ? "account.role.admin" : "account.role.user")}
              </Badge>
            </div>
          </div>
          <div className="flex flex-col gap-2 pt-2">
            <Button asChild variant="outline" className="justify-start">
              <Link href="/account/orders">
                <ReceiptText className="h-4 w-4" />
                {t("account.myOrders")}
              </Link>
            </Button>
            <Button variant="ghost" className="justify-start" disabled>
              <Heart className="h-4 w-4" />
              {t("account.savedItems")}
            </Button>
            {user.role === "admin" && (
              <Button asChild variant="default" className="justify-start">
                <Link href="/admin">
                  <ShieldCheck className="h-4 w-4" />
                  {t("account.adminPanel")}
                </Link>
              </Button>
            )}
            <Button
              variant="ghost"
              className="justify-start text-destructive hover:bg-destructive/10"
              onClick={() => {
                void signOut().then(() => router.push("/"));
              }}
            >
              <LogOut className="h-4 w-4" />
              {t("account.signOut")}
            </Button>
          </div>
        </aside>

        <section className="space-y-4 rounded-2xl border border-border bg-surface p-5">
          <h2 className="text-lg font-semibold">
            {t("account.welcome", { name: user.name })}
          </h2>
          <p className="text-sm text-muted-foreground">{t("brand.tagline")}</p>
          {orders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              {t("account.noOrders")}{" "}
              <Link href="/shop" className="text-primary hover:underline">
                {t("account.startShopping")}
              </Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {orders.slice(0, 3).map((o) => (
                <li
                  key={o.id}
                  className="flex flex-wrap items-center gap-3 rounded-xl border border-border p-3"
                >
                  <div className="flex-1">
                    <div className="text-sm font-medium">{o.id}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(o.createdAt, locale)} · {o.items.length} items
                    </div>
                  </div>
                  <Badge variant="secondary">
                    {t(`order.status.${o.status}` as const)}
                  </Badge>
                  <div className="font-semibold">{formatPrice(o.total)}</div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
