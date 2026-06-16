"use client";

import Link from "next/link";
import { ChevronRight, Shield } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";

const sections = [
  { title: "privacy.introTitle", body: "privacy.introBody" },
  { title: "privacy.collectTitle", body: "privacy.collectBody" },
  { title: "privacy.useTitle", body: "privacy.useBody" },
  { title: "privacy.sharingTitle", body: "privacy.sharingBody" },
  { title: "privacy.securityTitle", body: "privacy.securityBody" },
  { title: "privacy.rightsTitle", body: "privacy.rightsBody" },
  { title: "privacy.cookiesTitle", body: "privacy.cookiesBody" },
  { title: "privacy.changesTitle", body: "privacy.changesBody" },
  { title: "privacy.contactTitle", body: "privacy.contactBody" },
] as const;

export default function PrivacyPage() {
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
          <span className="text-ink font-medium">{t("privacy.breadcrumb")}</span>
        </nav>

        {/* Page heading */}
        <div className="mb-8 flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-ink sm:text-3xl">
              {t("privacy.title")}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("privacy.lastUpdated")}
            </p>
          </div>
        </div>

        {/* Content card */}
        <div className="rounded-2xl border bg-surface p-6 shadow-soft md:p-8">
          <div className="space-y-6">
            {sections.map((section, idx) => (
              <div key={section.title}>
                {idx > 0 && <hr className="border-border mb-6" />}
                <section className="space-y-3">
                  <h2 className="text-lg font-semibold text-ink">
                    {t(section.title)}
                  </h2>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {t(section.body)}
                  </p>
                  {section.title === "privacy.contactTitle" && (
                    <p className="text-sm leading-relaxed">
                      <Link
                        href="/contact"
                        className="text-primary font-medium hover:underline"
                      >
                        {t("footer.contact")}
                      </Link>
                    </p>
                  )}
                </section>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
