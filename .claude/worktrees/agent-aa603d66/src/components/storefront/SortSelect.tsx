"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/i18n/LanguageProvider";

export type SortKey = "newest" | "priceAsc" | "priceDesc";

export function SortSelect({
  value,
  onChange,
}: {
  value: SortKey;
  onChange: (v: SortKey) => void;
}) {
  const { t } = useLanguage();
  return (
    <Select value={value} onValueChange={(v) => onChange(v as SortKey)}>
      <SelectTrigger className="w-44">
        <SelectValue placeholder={t("shop.sort")} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="newest">{t("shop.sortNewest")}</SelectItem>
        <SelectItem value="priceAsc">{t("shop.sortPriceAsc")}</SelectItem>
        <SelectItem value="priceDesc">{t("shop.sortPriceDesc")}</SelectItem>
      </SelectContent>
    </Select>
  );
}
