"use client";

import Link from "next/link";
import { categories } from "@/data/categories";
import { CategoryIcon } from "@/components/common/CategoryIcon";
import { useLanguage } from "@/i18n/LanguageProvider";
import type { DictionaryKey } from "@/i18n/strings";

export function CategoryTiles() {
  const { t, locale } = useLanguage();
  return (
    <section className="container py-12">
      <div className="mb-6 flex items-end justify-between">
        <h2 className="text-2xl font-semibold">{t("home.browseByCategory")}</h2>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={`/category/${c.slug}`}
            className="group flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5 card-lift"
          >
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-soft/15 text-[#7a5410]">
              <CategoryIcon name={c.iconName} className="h-5 w-5" />
            </span>
            <div>
              <div className="font-semibold leading-tight">
                {t(`category.${c.slug}` as DictionaryKey)}
              </div>
              <div className="text-xs text-muted-foreground">
                {locale === "zh" ? c.blurbZh : c.blurbEn}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
