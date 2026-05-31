"use client";

import { Megaphone } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";

export function CommunityNotice() {
  const { t } = useLanguage();
  return (
    <section className="container py-6">
      <div className="flex items-start gap-4 rounded-2xl border border-green-soft/40 bg-green-soft/10 p-5">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-green-soft/40 text-[#3f7137]">
          <Megaphone className="h-5 w-5" />
        </span>
        <div>
          <div className="font-semibold">{t("home.communityNoticeTitle")}</div>
          <p className="text-sm text-ink/80">{t("home.communityNoticeBody")}</p>
        </div>
      </div>
    </section>
  );
}
