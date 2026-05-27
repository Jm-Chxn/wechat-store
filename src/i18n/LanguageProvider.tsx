"use client";

import * as React from "react";
import {
  dictionary,
  type DictionaryKey,
  interpolate,
  lookup,
} from "@/i18n/strings";
import { readJSON, StorageKeys, writeJSON } from "@/lib/storage";
import type { Locale } from "@/types";

interface LanguageContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  toggle: () => void;
  t: (key: DictionaryKey, vars?: Record<string, string | number>) => string;
  isReady: boolean;
}

const LanguageContext = React.createContext<LanguageContextValue | undefined>(
  undefined,
);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = React.useState<Locale>("en");
  const [isReady, setReady] = React.useState(false);

  React.useEffect(() => {
    const stored = readJSON<Locale | null>(StorageKeys.lang, null);
    const initialLocale: Locale = (stored === "en" || stored === "zh") ? stored : "en";
    setLocaleState(initialLocale);
    if (typeof document !== "undefined") {
      document.documentElement.lang = initialLocale === "zh" ? "zh-CN" : "en";
    }
    setReady(true);
  }, []);

  const setLocale = React.useCallback((l: Locale) => {
    setLocaleState(l);
    writeJSON(StorageKeys.lang, l);
    if (typeof document !== "undefined") {
      document.documentElement.lang = l === "zh" ? "zh-CN" : "en";
    }
  }, []);

  const toggle = React.useCallback(() => {
    setLocale(locale === "en" ? "zh" : "en");
  }, [locale, setLocale]);

  const t = React.useCallback(
    (key: DictionaryKey, vars?: Record<string, string | number>) => {
      const base = lookup(key, locale);
      return interpolate(base, vars);
    },
    [locale],
  );

  const value = React.useMemo(
    () => ({ locale, setLocale, toggle, t, isReady }),
    [locale, setLocale, toggle, t, isReady],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = React.useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
}

/** Convenience hook that returns just `t`. */
export function useT() {
  return useLanguage().t;
}

/** Compile-time helper; surfaces missing keys without runtime cost. */
export const _allKeys = Object.keys(dictionary) as DictionaryKey[];
