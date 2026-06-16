"use client";

import * as React from "react";
import Link from "next/link";
import {
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageCircle,
  Send,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useToast } from "@/components/ui/toast";

const contactSchema = z.object({
  name: z.string().min(1),
  email: z.string().min(1).email(),
  subject: z.string().min(1),
  message: z.string().min(1),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const { t } = useLanguage();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
  });

  async function onSubmit(data: ContactFormValues) {
    try {
      const res = await fetch("/api/v1/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Request failed");
      toast({
        title: t("contact.successTitle"),
        description: t("contact.successBody"),
      });
      reset();
    } catch {
      toast({
        title: t("contact.errorTitle"),
        description: t("contact.errorBody"),
      });
    }
  }

  const infoItems = [
    { icon: Mail, label: t("contact.emailInfo") },
    { icon: Phone, label: t("contact.phoneInfo") },
    { icon: MessageCircle, label: t("contact.wechatInfo") },
    { icon: MapPin, label: t("contact.locationInfo") },
  ];

  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-1 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-ink transition-colors">
            {t("shop.breadcrumbHome")}
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-ink font-medium">
            {t("contact.breadcrumb")}
          </span>
        </nav>

        {/* Heading */}
        <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          {t("contact.title")}
        </h1>
        <p className="mt-2 text-muted-foreground">{t("contact.subtitle")}</p>

        {/* Two-column grid */}
        <div className="mt-8 grid gap-8 md:grid-cols-2">
          {/* Contact form */}
          <div className="rounded-2xl border bg-surface p-6 shadow-soft">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5"
              noValidate
            >
              {/* Name */}
              <div className="space-y-1.5">
                <Label htmlFor="name">{t("contact.nameLabel")} *</Label>
                <Input
                  id="name"
                  placeholder={t("contact.namePlaceholder")}
                  aria-invalid={!!errors.name}
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">
                    {t("contact.required")}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email">{t("contact.emailLabel")} *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t("contact.emailPlaceholder")}
                  aria-invalid={!!errors.email}
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">
                    {errors.email.type === "email"
                      ? t("common.invalidEmail")
                      : t("contact.required")}
                  </p>
                )}
              </div>

              {/* Subject */}
              <div className="space-y-1.5">
                <Label htmlFor="subject">{t("contact.subjectLabel")} *</Label>
                <Input
                  id="subject"
                  placeholder={t("contact.subjectPlaceholder")}
                  aria-invalid={!!errors.subject}
                  {...register("subject")}
                />
                {errors.subject && (
                  <p className="text-sm text-destructive">
                    {t("contact.required")}
                  </p>
                )}
              </div>

              {/* Message */}
              <div className="space-y-1.5">
                <Label htmlFor="message">{t("contact.messageLabel")} *</Label>
                <Textarea
                  id="message"
                  rows={5}
                  placeholder={t("contact.messagePlaceholder")}
                  aria-invalid={!!errors.message}
                  {...register("message")}
                />
                {errors.message && (
                  <p className="text-sm text-destructive">
                    {t("contact.required")}
                  </p>
                )}
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  t("contact.sending")
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    {t("contact.submit")}
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Contact info */}
          <div className="rounded-2xl border bg-surface p-6 shadow-soft">
            <h2 className="text-xl font-semibold text-ink">
              {t("contact.infoTitle")}
            </h2>

            <div className="mt-6 space-y-5">
              {infoItems.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="pt-2 text-sm text-ink">{label}</span>
                </div>
              ))}
            </div>

            {/* Operating hours */}
            <div className="mt-8 border-t pt-6">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-ink">
                    {t("contact.hoursTitle")}
                  </h3>
                  <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">
                    {t("contact.hoursBody")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
