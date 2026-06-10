"use client";

import * as React from "react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { cn } from "@/lib/utils";

export function LanguageToggle({ className }: { className?: string }) {
  const { locale, setLocale } = useLanguage();
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border border-border bg-surface p-0.5 text-xs font-medium",
        className,
      )}
      role="group"
      aria-label="Language toggle"
    >
      <button
        type="button"
        onClick={() => setLocale("en")}
        className={cn(
          "rounded-full px-3 py-1 transition-colors",
          locale === "en"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-ink",
        )}
        aria-pressed={locale === "en"}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLocale("zh")}
        className={cn(
          "rounded-full px-3 py-1 transition-colors",
          locale === "zh"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-ink",
        )}
        aria-pressed={locale === "zh"}
      >
        中文
      </button>
    </div>
  );
}
