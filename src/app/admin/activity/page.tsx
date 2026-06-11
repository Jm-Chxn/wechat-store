"use client";

import * as React from "react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { listActivities, listUsers } from "@/lib/repository";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Activity, ActivityType, WeChatAccount } from "@/types";
import type { DictionaryKey } from "@/i18n/strings";

const filters: { key: ActivityType | "ALL"; labelKey: DictionaryKey }[] = [
  { key: "ALL", labelKey: "admin.activityFilterAll" },
  { key: "SIGN_IN", labelKey: "activity.SIGN_IN" },
  { key: "ADD_TO_CART", labelKey: "activity.ADD_TO_CART" },
  { key: "PLACE_ORDER", labelKey: "activity.PLACE_ORDER" },
  { key: "ADMIN_PRODUCT_CREATE", labelKey: "activity.ADMIN_PRODUCT_CREATE" },
  { key: "ADMIN_PRODUCT_DELETE", labelKey: "activity.ADMIN_PRODUCT_DELETE" },
];

export default function AdminActivityPage() {
  const { t, locale } = useLanguage();
  const [activities, setActivities] = React.useState<Activity[]>([]);
  const [active, setActive] = React.useState<ActivityType | "ALL">("ALL");
  const [users, setUsers] = React.useState<WeChatAccount[]>([]);

  React.useEffect(() => {
    let cancelled = false;
    void Promise.all([listActivities(), listUsers()]).then(([a, u]) => {
      if (cancelled) return;
      setActivities(a);
      setUsers(u);
    });
    return () => { cancelled = true; };
  }, []);

  const filtered =
    active === "ALL"
      ? activities
      : activities.filter((a) => a.type === active);

  return (
    <div className="space-y-5">
      <AdminPageHeader
        section={t("admin.activity")}
        title={t("admin.activityFeed")}
        subtitle={t("admin.activityCount", { n: filtered.length })}
      />
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setActive(f.key)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs transition-colors",
              active === f.key
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:text-ink",
            )}
          >
            {t(f.labelKey)}
          </button>
        ))}
      </div>

      <ol className="space-y-3 rounded-2xl border border-border bg-surface p-4">
        {filtered.length === 0 && (
          <li className="py-6 text-center text-sm text-muted-foreground">
            {t("admin.empty")}
          </li>
        )}
        {filtered.map((a) => {
          const u = users.find((x) => x.openid === a.userOpenid);
          return (
            <li
              key={a.id}
              className="flex items-start gap-3 border-b border-border pb-3 last:border-0 last:pb-0"
            >
              {u?.avatarUrl?.startsWith("https://") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={u.avatarUrl}
                  alt={u.nicknameEn}
                  className="h-9 w-9 shrink-0 rounded-full bg-secondary object-cover"
                />
              ) : (
                <div className="h-9 w-9 shrink-0 rounded-full bg-secondary" />
              )}
              <div className="flex-1 text-sm">
                <div>
                  <span className="font-medium">
                    {u
                      ? locale === "zh"
                        ? u.nicknameZh
                        : u.nicknameEn
                      : t("common.guest")}
                  </span>{" "}
                  <span className="text-muted-foreground">
                    {t(`activity.${a.type}` as DictionaryKey)}
                  </span>
                  {typeof a.meta?.productId === "string" && (
                    <span className="text-muted-foreground"> · {a.meta.productId}</span>
                  )}
                  {typeof a.meta?.orderId === "string" && (
                    <span className="text-muted-foreground"> · {a.meta.orderId}</span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatDate(a.createdAt, locale)}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
