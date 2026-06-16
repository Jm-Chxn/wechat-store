"use client";

import { useLanguage } from "@/i18n/LanguageProvider";
import Link from "next/link";
import { ChevronRight, FileText } from "lucide-react";

const sections = [
  { title: "terms.acceptanceTitle", body: "terms.acceptanceBody" },
  { title: "terms.serviceTitle", body: "terms.serviceBody" },
  { title: "terms.accountTitle", body: "terms.accountBody" },
  { title: "terms.ordersTitle", body: "terms.ordersBody" },
  { title: "terms.pickupTitle", body: "terms.pickupBody" },
  { title: "terms.returnsTitle", body: "terms.returnsBody" },
  { title: "terms.conductTitle", body: "terms.conductBody" },
  { title: "terms.liabilityTitle", body: "terms.liabilityBody" },
  { title: "terms.changesTitle", body: "terms.changesBody" },
  { title: "terms.contactTitle", body: "terms.contactBody" },
] as const;

export default function TermsPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-1 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary transition-colors">
            {t("nav.home")}
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-ink">{t("terms.breadcrumb")}</span>
        </nav>

        {/* Page heading */}
        <div className="mb-8 flex items-center gap-3">
          <FileText className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-ink sm:text-3xl">
              {t("terms.title")}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("terms.lastUpdated")}
            </p>
          </div>
        </div>

        {/* Content card */}
        <div className="rounded-2xl border bg-surface p-6 shadow-soft md:p-8">
          <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
            {t("terms.subtitle")}
          </p>

          <div className="space-y-6">
            {sections.map((section, i) => (
              <div key={section.title}>
                {i > 0 && <hr className="mb-6 border-border" />}
                <section className="space-y-3">
                  <h2 className="text-lg font-semibold text-ink">
                    {t(section.title)}
                  </h2>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {t(section.body)}
                  </p>
                </section>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
