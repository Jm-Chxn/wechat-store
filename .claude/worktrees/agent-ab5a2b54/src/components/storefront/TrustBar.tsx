"use client";

import { Leaf, Users, MapPin } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";

export function TrustBar() {
  const { t } = useLanguage();
  const items = [
    { icon: Leaf, title: t("home.trustFresh"), body: t("home.trustFreshBlurb") },
    { icon: Users, title: t("home.trustGroup"), body: t("home.trustGroupBlurb") },
    { icon: MapPin, title: t("home.trustPickup"), body: t("home.trustPickupBlurb") },
  ];
  return (
    <section id="how-it-works" className="border-y border-border bg-surface">
      <div className="container grid gap-6 py-10 md:grid-cols-3">
        {items.map((it) => (
          <div key={it.title} className="flex items-start gap-4">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-soft/20 text-[#7a5410]">
              <it.icon className="h-5 w-5" />
            </span>
            <div>
              <div className="font-semibold">{it.title}</div>
              <div className="text-sm text-muted-foreground">{it.body}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
