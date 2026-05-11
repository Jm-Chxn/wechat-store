"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useAuth } from "@/providers/AuthProvider";

function buildSchema(t: (k: "common.invalidEmail" | "login.passwordTooShort") => string) {
  return z.object({
    email: z.string().email(t("common.invalidEmail")),
    password: z.string().min(6, t("login.passwordTooShort")),
  });
}

type FormValues = { email: string; password: string };

export default function LoginPage() {
  return (
    <React.Suspense fallback={<div className="container py-12 text-center text-muted-foreground">Loading…</div>}>
      <LoginPageInner />
    </React.Suspense>
  );
}

function LoginPageInner() {
  const { t } = useLanguage();
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") ?? "/account";
  const { signInWithPassword, signUpWithPassword, signInWithGoogle, user, isReady } = useAuth();

  const [signInError, setSignInError] = React.useState<string | null>(null);
  const [signUpError, setSignUpError] = React.useState<string | null>(null);
  const [signUpInfo, setSignUpInfo] = React.useState<string | null>(null);

  const schema = React.useMemo(() => buildSchema(t), [t]);

  const signInForm = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });
  const signUpForm = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  React.useEffect(() => {
    if (isReady && user) router.replace(next);
  }, [isReady, user, next, router]);

  const onSignIn = signInForm.handleSubmit(async (values) => {
    setSignInError(null);
    const { error } = await signInWithPassword(values.email, values.password);
    if (error) setSignInError(error || t("login.signInError"));
  });

  const onSignUp = signUpForm.handleSubmit(async (values) => {
    setSignUpError(null);
    setSignUpInfo(null);
    const { error } = await signUpWithPassword(values.email, values.password);
    if (error) setSignUpError(error || t("login.signUpError"));
    else setSignUpInfo(t("login.checkEmail"));
  });

  const onGoogle = async () => {
    setSignInError(null);
    const { error } = await signInWithGoogle(next);
    if (error) setSignInError(error || t("login.signInError"));
  };

  return (
    <div className="container max-w-md py-12">
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-soft">
        <h1 className="mb-1 text-2xl font-semibold">{t("login.title")}</h1>
        <p className="mb-6 text-sm text-muted-foreground">{t("login.dividerHint")}</p>

        <Tabs defaultValue="signin">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">{t("login.signInTab")}</TabsTrigger>
            <TabsTrigger value="create">{t("login.createTab")}</TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="space-y-3">
            <form noValidate onSubmit={onSignIn} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="li-email">{t("login.email")}</Label>
                <Input
                  id="li-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  aria-invalid={!!signInForm.formState.errors.email}
                  {...signInForm.register("email")}
                />
                {signInForm.formState.errors.email && (
                  <p className="text-xs text-destructive" role="alert">
                    {signInForm.formState.errors.email.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="li-password">{t("login.password")}</Label>
                <Input
                  id="li-password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  aria-invalid={!!signInForm.formState.errors.password}
                  {...signInForm.register("password")}
                />
                {signInForm.formState.errors.password && (
                  <p className="text-xs text-destructive" role="alert">
                    {signInForm.formState.errors.password.message}
                  </p>
                )}
              </div>
              {signInError && (
                <p className="text-xs text-destructive" role="alert">{signInError}</p>
              )}
              <Button type="submit" className="w-full" disabled={signInForm.formState.isSubmitting}>
                {signInForm.formState.isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                {t("login.signInTab")}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="create" className="space-y-3">
            <form noValidate onSubmit={onSignUp} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="ca-email">{t("login.email")}</Label>
                <Input
                  id="ca-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  aria-invalid={!!signUpForm.formState.errors.email}
                  {...signUpForm.register("email")}
                />
                {signUpForm.formState.errors.email && (
                  <p className="text-xs text-destructive" role="alert">
                    {signUpForm.formState.errors.email.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ca-password">{t("login.password")}</Label>
                <Input
                  id="ca-password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  aria-invalid={!!signUpForm.formState.errors.password}
                  {...signUpForm.register("password")}
                />
                {signUpForm.formState.errors.password && (
                  <p className="text-xs text-destructive" role="alert">
                    {signUpForm.formState.errors.password.message}
                  </p>
                )}
              </div>
              {signUpError && (
                <p className="text-xs text-destructive" role="alert">{signUpError}</p>
              )}
              {signUpInfo && (
                <p className="text-xs text-emerald-700" role="status">{signUpInfo}</p>
              )}
              <Button type="submit" className="w-full" disabled={signUpForm.formState.isSubmitting}>
                {signUpForm.formState.isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                {t("login.createAccount")}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          {t("login.or")}
          <span className="h-px flex-1 bg-border" />
        </div>

        <div className="space-y-2">
          <Button variant="outline" className="w-full" onClick={onGoogle}>
            {t("login.continueWithGoogle")}
          </Button>
          <Button asChild variant="ghost" className="w-full">
            <Link href="/">{t("login.continueAsGuest")}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
