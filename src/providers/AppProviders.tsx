"use client";

import * as React from "react";
import { LanguageProvider } from "@/i18n/LanguageProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { CartProvider } from "@/providers/CartProvider";
import { ToastProvider } from "@/components/ui/toast";
import { RoutePreloader } from "@/components/common/RoutePreloader";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <ToastProvider>
            {children}
            <RoutePreloader />
          </ToastProvider>
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
