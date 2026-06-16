"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";

export function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="mt-16 border-t border-border bg-surface">
      <div className="container grid gap-8 py-10 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 font-semibold">
            <span className="grid h-8 w-8 place-items-center rounded-2xl bg-primary text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </span>
            {t("brand.name")}
          </div>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            {t("brand.tagline")}
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold">{t("footer.about")}</h4>
          <p className="mt-2 text-sm text-muted-foreground">{t("footer.aboutBody")}</p>
        </div>
        <div>
          <h4 className="text-sm font-semibold">{t("footer.help")}</h4>
          <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/contact" className="hover:text-ink">{t("footer.contact")}</Link>
            </li>
            <li>
              <Link href="/faq" className="hover:text-ink">{t("footer.faq")}</Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold">{t("footer.terms")}</h4>
          <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/privacy" className="hover:text-ink">{t("footer.privacy")}</Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-ink">{t("footer.terms")}</Link>
            </li>
          </ul>
        </div>
        <div className="sm:col-span-2 md:col-span-4 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          {t("footer.copyright")}
        </div>
      </div>
    </footer>
  );
}
