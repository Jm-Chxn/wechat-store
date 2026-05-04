"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/i18n/LanguageProvider";

export default function LoginPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") ?? "/account";

  const goWeChat = () => {
    router.push(
      `/auth/wechat/consent?returnTo=${encodeURIComponent(next)}`,
    );
  };

  return (
    <div className="container max-w-md py-12">
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-soft">
        <h1 className="mb-1 text-2xl font-semibold">{t("login.title")}</h1>
        <p className="mb-6 text-sm text-muted-foreground">{t("login.dividerHint")}</p>

        <Tabs defaultValue="signin">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">{t("login.signInTab")}</TabsTrigger>
            <TabsTrigger value="create">{t("login.createTab")}</TabsTrigger>
          </TabsList>
          <TabsContent value="signin" className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="li-email">{t("login.email")}</Label>
              <Input id="li-email" type="email" placeholder="you@example.com" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="li-password">{t("login.password")}</Label>
              <Input id="li-password" type="password" placeholder="••••••••" />
            </div>
            <Button type="button" variant="secondary" className="w-full" disabled>
              {t("login.signInTab")}
            </Button>
          </TabsContent>
          <TabsContent value="create" className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="ca-email">{t("login.email")}</Label>
              <Input id="ca-email" type="email" placeholder="you@example.com" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ca-password">{t("login.password")}</Label>
              <Input id="ca-password" type="password" placeholder="••••••••" />
            </div>
            <Button type="button" variant="secondary" className="w-full" disabled>
              {t("login.createAccount")}
            </Button>
          </TabsContent>
        </Tabs>

        <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          {t("login.or")}
          <span className="h-px flex-1 bg-border" />
        </div>

        <div className="space-y-2">
          <Button variant="outline" className="w-full" disabled>
            {t("login.continueWithGoogle")}
          </Button>
          <Button variant="wechat" className="w-full" onClick={goWeChat}>
            <MessageCircle className="h-4 w-4" />
            {t("login.signInWithWeChat")}
          </Button>
          <Button asChild variant="ghost" className="w-full">
            <Link href="/">{t("login.continueAsGuest")}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
