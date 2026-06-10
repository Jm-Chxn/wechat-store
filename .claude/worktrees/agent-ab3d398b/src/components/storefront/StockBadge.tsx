"use client";

import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/i18n/LanguageProvider";
import type { StockStatus } from "@/types";

export function StockBadge({ status }: { status: StockStatus }) {
  const { t } = useLanguage();
  if (status === "OUT_OF_STOCK") {
    return <Badge variant="out">{t("product.outOfStock")}</Badge>;
  }
  if (status === "LIMITED") {
    return <Badge variant="limited">{t("product.limitedStock")}</Badge>;
  }
  return null;
}

export function NewBadge() {
  const { t } = useLanguage();
  return <Badge variant="new">{t("product.new")}</Badge>;
}
