"use client";

import * as React from "react";
import { useAdminGuard } from "@/providers/AuthProvider";
import { useLanguage } from "@/i18n/LanguageProvider";

export function AdminGate({ children }: { children: React.ReactNode }) {
  const { ready, user, isAdmin } = useAdminGuard();
  const { t } = useLanguage();

  if (!ready || !user || !isAdmin) {
    return (
      <div className="container py-16 text-center text-muted-foreground">
        {t("admin.gateLoading")}
      </div>
    );
  }
  return <>{children}</>;
}
