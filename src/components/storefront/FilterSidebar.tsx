"use client";

import * as React from "react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { categories } from "@/data/categories";
import { useLanguage } from "@/i18n/LanguageProvider";
import type { DictionaryKey } from "@/i18n/strings";
import type { CategorySlug, DietaryTag } from "@/types";
import { cn } from "@/lib/utils";

const tags: DietaryTag[] = ["VEGAN", "VEGETARIAN", "GLUTEN_FREE", "HALAL", "ORGANIC", "SPICY"];

export interface Filters {
  categorySlug: CategorySlug | "all";
  priceMaxCents: number;
  dietary: DietaryTag[];
}

export function FilterSidebar({
  filters,
  onChange,
  hideCategory,
  className,
}: {
  filters: Filters;
  onChange: (next: Filters) => void;
  hideCategory?: boolean;
  className?: string;
}) {
  const { t } = useLanguage();

  const toggleTag = (tag: DietaryTag) => {
    const next = filters.dietary.includes(tag)
      ? filters.dietary.filter((t) => t !== tag)
      : [...filters.dietary, tag];
    onChange({ ...filters, dietary: next });
  };

  return (
    <aside className={cn("space-y-6 rounded-2xl border border-border bg-surface p-5", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide">
          {t("shop.filter")}
        </h3>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() =>
            onChange({ categorySlug: "all", priceMaxCents: 5000, dietary: [] })
          }
        >
          {t("shop.clearFilters")}
        </Button>
      </div>

      {!hideCategory && (
        <div className="space-y-2">
          <Label>{t("shop.allCategories")}</Label>
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => onChange({ ...filters, categorySlug: "all" })}
              aria-pressed={filters.categorySlug === "all"}
              className={cn(
                "w-full rounded-lg px-3 py-2 text-left text-sm",
                filters.categorySlug === "all"
                  ? "bg-secondary font-medium"
                  : "text-muted-foreground hover:bg-secondary/60",
              )}
            >
              {t("shop.allCategories")}
            </button>
            {categories.map((c) => (
              <button
                key={c.slug}
                type="button"
                onClick={() => onChange({ ...filters, categorySlug: c.slug })}
                aria-pressed={filters.categorySlug === c.slug}
                className={cn(
                  "w-full rounded-lg px-3 py-2 text-left text-sm",
                  filters.categorySlug === c.slug
                    ? "bg-secondary font-medium"
                    : "text-muted-foreground hover:bg-secondary/60",
                )}
              >
                {t(`category.${c.slug}` as DictionaryKey)}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <Label>{t("shop.priceRange")}</Label>
        <Slider
          value={[filters.priceMaxCents]}
          onValueChange={(v) => onChange({ ...filters, priceMaxCents: v[0] })}
          min={300}
          max={5000}
          step={100}
        />
        <div className="text-xs text-muted-foreground">
          ≤ ${(filters.priceMaxCents / 100).toFixed(2)}
        </div>
      </div>

      <div className="space-y-2">
        <Label>{t("shop.dietary")}</Label>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => {
            const on = filters.dietary.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                aria-pressed={on}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs transition-colors",
                  on
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/40 hover:text-ink",
                )}
              >
                {t(`tag.${tag}` as DictionaryKey)}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
