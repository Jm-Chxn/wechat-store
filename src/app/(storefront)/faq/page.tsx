"use client";

import Link from "next/link";
import { ChevronRight, HelpCircle } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqSections = [
  {
    titleKey: "faq.sectionOrders" as const,
    items: [
      { value: "q1", qKey: "faq.q1" as const, aKey: "faq.a1" as const },
      { value: "q2", qKey: "faq.q2" as const, aKey: "faq.a2" as const },
      { value: "q3", qKey: "faq.q3" as const, aKey: "faq.a3" as const },
    ],
  },
  {
    titleKey: "faq.sectionProducts" as const,
    items: [
      { value: "q4", qKey: "faq.q4" as const, aKey: "faq.a4" as const },
      { value: "q5", qKey: "faq.q5" as const, aKey: "faq.a5" as const },
    ],
  },
  {
    titleKey: "faq.sectionPayment" as const,
    items: [
      { value: "q6", qKey: "faq.q6" as const, aKey: "faq.a6" as const },
      { value: "q7", qKey: "faq.q7" as const, aKey: "faq.a7" as const },
    ],
  },
  {
    titleKey: "faq.sectionAccount" as const,
    items: [
      { value: "q8", qKey: "faq.q8" as const, aKey: "faq.a8" as const },
      { value: "q9", qKey: "faq.q9" as const, aKey: "faq.a9" as const },
      { value: "q10", qKey: "faq.q10" as const, aKey: "faq.a10" as const },
    ],
  },
];

export default function FaqPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-1 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-ink transition-colors">
            {t("nav.home")}
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-ink font-medium">{t("faq.breadcrumb")}</span>
        </nav>

        {/* Page heading */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <HelpCircle className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            {t("faq.title")}
          </h1>
          <p className="mt-3 text-muted-foreground">{t("faq.subtitle")}</p>
        </div>

        {/* FAQ sections */}
        <div className="space-y-8">
          {faqSections.map((section) => (
            <section
              key={section.titleKey}
              className="rounded-2xl border bg-surface p-6 shadow-soft"
            >
              <h2 className="mb-4 text-lg font-semibold text-ink">
                {t(section.titleKey)}
              </h2>
              <Accordion type="multiple" className="space-y-2">
                {section.items.map((item) => (
                  <AccordionItem
                    key={item.value}
                    value={item.value}
                    className="rounded-xl border px-4"
                  >
                    <AccordionTrigger className="text-left font-medium">
                      {t(item.qKey)}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {t(item.aKey)}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
          ))}
        </div>

        {/* Still have questions CTA */}
        <div className="mt-12 rounded-2xl border bg-surface p-8 text-center shadow-soft">
          <h2 className="text-xl font-semibold text-ink">
            {t("faq.stillHaveQuestions")}
          </h2>
          <p className="mt-2 text-muted-foreground">{t("faq.subtitle")}</p>
          <Button asChild className="mt-6 rounded-xl">
            <Link href="/contact">{t("faq.contactUs")}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
