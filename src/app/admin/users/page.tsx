"use client";

import * as React from "react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/i18n/LanguageProvider";
import {
  listActivities,
  listOrders,
  listUserSummaries,
} from "@/lib/repository";
import { formatDate, formatPrice, maskOpenid } from "@/lib/utils";
import type { Activity, Order, WeChatAccount } from "@/types";
import type { DictionaryKey } from "@/i18n/strings";

export default function AdminUsersPage() {
  const { t, locale } = useLanguage();
  const [summaries, setSummaries] = React.useState<
    Awaited<ReturnType<typeof listUserSummaries>>
  >([]);
  const [drawerUser, setDrawerUser] = React.useState<WeChatAccount | null>(null);
  const [drawerOrders, setDrawerOrders] = React.useState<Order[]>([]);
  const [drawerActs, setDrawerActs] = React.useState<Activity[]>([]);

  React.useEffect(() => {
    let cancelled = false;
    void listUserSummaries().then((s) => { if (!cancelled) setSummaries(s); });
    return () => { cancelled = true; };
  }, []);

  const open = async (acc: WeChatAccount) => {
    setDrawerUser(acc);
    const [o, a] = await Promise.all([listOrders(acc.openid), listActivities(acc.openid)]);
    setDrawerOrders(o);
    setDrawerActs(a);
  };

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-semibold">{t("admin.usersTitle")}</h1>
        <p className="text-sm text-muted-foreground">{t("admin.usersBlurb")}</p>
      </div>
      <div className="rounded-2xl border border-border bg-surface">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead></TableHead>
              <TableHead>{t("admin.usersTitle")}</TableHead>
              <TableHead>openid</TableHead>
              <TableHead>{t("account.role")}</TableHead>
              <TableHead>{t("admin.usersTotalOrders")}</TableHead>
              <TableHead>{t("admin.usersTotalSpent")}</TableHead>
              <TableHead>{t("admin.usersLastActivity")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {summaries.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                  {t("admin.empty")}
                </TableCell>
              </TableRow>
            )}
            {summaries.map((s) => (
              <TableRow
                key={s.account.openid}
                onClick={() => open(s.account)}
                className="cursor-pointer"
              >
                <TableCell>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={s.account.avatarUrl}
                    alt={s.account.nicknameEn}
                    className="h-9 w-9 rounded-full bg-secondary object-cover"
                  />
                </TableCell>
                <TableCell>
                  <div className="font-medium">
                    {locale === "zh"
                      ? s.account.nicknameZh
                      : s.account.nicknameEn}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {locale === "zh"
                      ? s.account.nicknameEn
                      : s.account.nicknameZh}
                  </div>
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {maskOpenid(s.account.openid)}
                </TableCell>
                <TableCell>
                  <Badge variant={s.account.role === "admin" ? "admin" : "secondary"}>
                    {t(s.account.role === "admin" ? "account.role.admin" : "account.role.user")}
                  </Badge>
                </TableCell>
                <TableCell>{s.orderCount}</TableCell>
                <TableCell>{formatPrice(s.totalSpent)}</TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {s.lastActivityAt ? formatDate(s.lastActivityAt, locale) : "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Drawer open={!!drawerUser} onOpenChange={(v) => !v && setDrawerUser(null)}>
        <DrawerContent>
          {drawerUser && (
            <>
              <DrawerHeader>
                <DrawerTitle className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={drawerUser.avatarUrl}
                    alt={drawerUser.nicknameEn}
                    className="h-10 w-10 rounded-full bg-secondary object-cover"
                  />
                  <span>
                    {locale === "zh" ? drawerUser.nicknameZh : drawerUser.nicknameEn}
                  </span>
                  {drawerUser.role === "admin" && (
                    <Badge variant="admin">{t("account.role.admin")}</Badge>
                  )}
                </DrawerTitle>
                <DrawerDescription>
                  {drawerUser.openid} · {t("account.joined")} {formatDate(drawerUser.joinedAt, locale)}
                </DrawerDescription>
              </DrawerHeader>
              <div className="grid gap-5 overflow-y-auto p-5">
                <section>
                  <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide">
                    {t("admin.userDrawerOrders")} ({drawerOrders.length})
                  </h3>
                  {drawerOrders.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      {t("admin.empty")}
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {drawerOrders.map((o) => (
                        <li
                          key={o.id}
                          className="rounded-xl border border-border p-3 text-sm"
                        >
                          <div className="flex justify-between">
                            <span className="font-medium">{o.id}</span>
                            <span>{formatPrice(o.total)}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatDate(o.createdAt, locale)} · {t(`order.status.${o.status}` as const)}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
                <section>
                  <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide">
                    {t("admin.userDrawerActivity")} ({drawerActs.length})
                  </h3>
                  {drawerActs.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      {t("admin.empty")}
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {drawerActs.map((a) => (
                        <li key={a.id} className="text-sm">
                          <span className="text-muted-foreground">
                            {formatDate(a.createdAt, locale)} ·{" "}
                          </span>
                          <span>{t(`activity.${a.type}` as DictionaryKey)}</span>
                          {a.meta?.productId ? (
                            <span className="text-muted-foreground"> · {String(a.meta.productId)}</span>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              </div>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
}
