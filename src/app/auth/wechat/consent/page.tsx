"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, MessageCircle, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useAuth } from "@/providers/AuthProvider";
import { wechatAccounts } from "@/data/wechatAccounts";
import { LanguageToggle } from "@/components/common/LanguageToggle";
import { cn } from "@/lib/utils";

export default function WeChatConsentPage() {
  const { t, locale } = useLanguage();
  const { signIn } = useAuth();
  const router = useRouter();
  const sp = useSearchParams();
  const returnTo = sp.get("returnTo") || "/";
  const [pickedOpenid, setPickedOpenid] = React.useState<string>(
    wechatAccounts[1].openid,
  );
  const [submitting, setSubmitting] = React.useState(false);

  const onAuthorize = () => {
    setSubmitting(true);
    const acc = signIn(pickedOpenid);
    if (!acc) {
      setSubmitting(false);
      return;
    }
    const target =
      acc.role === "admin" && returnTo === "/" ? "/admin" : returnTo;
    setTimeout(() => router.replace(target), 350);
  };

  return (
    <div className="min-h-screen bg-[#ededed] py-6">
      <div className="mx-auto max-w-md overflow-hidden rounded-3xl bg-surface shadow-lift">
        <div className="wechat-bar relative px-5 py-4 text-white">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => router.back()}
              className="grid h-8 w-8 place-items-center rounded-full bg-white/15 text-white hover:bg-white/25"
              aria-label={t("wechat.cancel")}
            >
              <X className="h-4 w-4" />
            </button>
            <div className="text-center text-sm font-medium">
              {t("wechat.consentTitle")}
            </div>
            <LanguageToggle className="bg-white/15 text-white" />
          </div>
        </div>

        <div className="space-y-5 p-6">
          <div className="flex items-start gap-3 rounded-2xl bg-secondary/60 p-4">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-primary-foreground">
              <ShieldCheck className="h-6 w-6" />
            </span>
            <div className="text-sm">
              <div className="font-semibold">{t("wechat.appName")}</div>
              <div className="text-muted-foreground">{t("wechat.appAsks")}</div>
            </div>
          </div>

          <div className="space-y-2 rounded-2xl border border-border bg-bg/40 p-4">
            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t("wechat.permissions").split("\n")[0]?.replace(/^•\s*/, "") ? "Permissions" : ""}
            </div>
            {t("wechat.permissions")
              .split("\n")
              .map((line, i) => (
                <div key={i} className="text-sm text-ink/85">
                  {line}
                </div>
              ))}
          </div>

          <div className="rounded-2xl border border-dashed border-border bg-bg/30 p-4 text-center">
            <div className="mx-auto grid h-32 w-32 place-items-center rounded-2xl bg-[radial-gradient(#0001_1px,transparent_1px)] [background-size:8px_8px]">
              <MessageCircle className="h-10 w-10 text-[#07c160]" />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {t("wechat.scanHint")}
            </p>
            <p className="mt-1 text-xs italic text-muted-foreground">
              {t("wechat.devHint")}
            </p>
          </div>

          <div className="space-y-2">
            {wechatAccounts.map((acc) => {
              const active = pickedOpenid === acc.openid;
              return (
                <button
                  key={acc.openid}
                  type="button"
                  onClick={() => setPickedOpenid(acc.openid)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-colors",
                    active
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/40 hover:bg-secondary/50",
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={acc.avatarUrl}
                    alt={acc.nicknameEn}
                    className="h-12 w-12 rounded-full bg-secondary object-cover"
                  />
                  <div className="flex-1">
                    <div className="font-medium leading-tight">
                      {locale === "zh" ? acc.nicknameZh : acc.nicknameEn}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {locale === "zh" ? acc.nicknameEn : acc.nicknameZh} · {acc.openid}
                    </div>
                  </div>
                  {acc.role === "admin" && (
                    <Badge variant="admin">{t("wechat.adminBadge")}</Badge>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Button
              variant="wechat"
              className="w-full"
              size="lg"
              onClick={onAuthorize}
              disabled={submitting}
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MessageCircle className="h-4 w-4" />
              )}
              {t("wechat.authorize")}
            </Button>
            <Button asChild variant="ghost" className="w-full">
              <Link href={returnTo}>{t("wechat.cancel")}</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
