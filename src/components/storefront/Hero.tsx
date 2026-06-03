"use client";

import Link from "next/link";
import Image from "next/image";
import { Sparkles, ArrowRight, Soup } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageProvider";

export function Hero() {
  const { t } = useLanguage();
  return (
    <section className="hero-frame relative overflow-hidden">
      <div className="container relative grid gap-10 py-16 md:grid-cols-2 md:py-24">
        <div className="flex flex-col justify-center gap-6">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-soft/40 bg-surface/70 px-3 py-1 text-xs font-medium text-[#7a5410] shadow-sm">
            <Sparkles className="h-3.5 w-3.5" />
            {t("home.communityNoticeTitle")}
          </span>
          <h1 className="text-4xl font-bold leading-tight md:text-5xl">
            {t("home.heroTitle")}
          </h1>
          <p className="max-w-md text-lg text-ink/80">
            {t("home.heroSubtitle")}
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/shop">
                {t("home.browseProducts")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="#how-it-works">
                <Soup className="h-4 w-4" />
                {t("home.howItWorks")}
              </Link>
            </Button>
          </div>
        </div>
        <div className="relative">
          <div className="relative ml-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-[2.5rem] border-4 border-surface shadow-lift">
            <Image
              src="https://images.unsplash.com/photo-1604908554049-0192fd92e4b5?w=900&h=1100&fit=crop&auto=format&q=70"
              alt="Community shared meals"
              fill
              className="object-cover img-fallback"
            />
            <div className="absolute inset-x-0 bottom-0 flex items-center gap-3 bg-gradient-to-t from-black/60 to-transparent p-5 text-white">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-amber-soft/90 text-[#5a3a08]">
                <Sparkles className="h-5 w-5" />
              </span>
              <div className="text-sm">
                <div className="font-semibold">{t("home.popularThisWeek")}</div>
                <div className="opacity-80">36+ {t("shop.title")}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
