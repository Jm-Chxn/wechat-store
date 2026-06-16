"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  ShoppingCart,
  Sparkles,
  User as UserIcon,
  X,
  ShieldCheck,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LanguageToggle } from "@/components/common/LanguageToggle";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useAuth } from "@/providers/AuthProvider";
import { useCart } from "@/providers/CartProvider";
import { cn, getDisplayName } from "@/lib/utils";

const navItems: { href: string; key: "nav.home" | "nav.shop" | "nav.categories" | "nav.account" | "footer.contact" }[] = [
  { href: "/", key: "nav.home" },
  { href: "/shop", key: "nav.shop" },
  { href: "/account/orders", key: "nav.account" },
  { href: "/contact", key: "footer.contact" },
];

export function Navbar() {
  const { t } = useLanguage();
  const { user, isAdmin, signOut, isTransitioning } = useAuth();
  const { count } = useCart();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const userMenuRef = React.useRef<HTMLDivElement>(null);

  // Freeze the displayed user during auth transitions so the navbar pill and
  // the page content update together once navigation settles.
  const frozenUserRef = React.useRef(user);
  if (!isTransitioning) {
    frozenUserRef.current = user;
  }
  const displayedUser = isTransitioning ? frozenUserRef.current : user;
  const displayedIsAdmin = displayedUser?.role === "admin";

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  React.useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-bg/85 backdrop-blur-md">
      <div className="container flex h-16 items-center gap-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="grid h-9 w-9 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="hidden text-base sm:inline">{t("brand.name")}</span>
        </Link>

        <nav className="hidden flex-1 items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-xl px-3 py-2 text-sm transition-colors",
                pathname === item.href
                  ? "bg-secondary text-ink"
                  : "text-muted-foreground hover:text-ink",
              )}
            >
              {t(item.key)}
            </Link>
          ))}
          {displayedIsAdmin && (
            <Link
              href="/admin"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "ml-1 inline-flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-medium",
                pathname.startsWith("/admin")
                  ? "bg-primary/10 text-primary"
                  : "text-primary hover:bg-primary/5",
              )}
            >
              <ShieldCheck className="h-4 w-4" />
              {t("nav.admin")}
            </Link>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <LanguageToggle className="hidden sm:inline-flex" />
          <Link
            href="/cart"
            className="relative grid h-10 w-10 place-items-center rounded-full border border-border bg-surface text-ink hover:bg-secondary"
            aria-label={t("nav.cart")}
          >
            <ShoppingCart className="h-4 w-4" />
            {count > 0 && (
              <Badge
                variant="default"
                className="absolute -right-1.5 -top-1.5 min-w-[1.25rem] justify-center bg-primary text-primary-foreground"
              >
                {count}
              </Badge>
            )}
          </Link>

          {displayedUser ? (
            <div ref={userMenuRef} className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => setUserMenuOpen((v) => !v)}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-surface py-1 pl-1 pr-3 text-sm hover:bg-secondary"
              >
                {displayedUser.avatarUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={displayedUser.avatarUrl}
                    alt={getDisplayName(displayedUser)}
                    className="h-7 w-7 rounded-full bg-secondary object-cover"
                  />
                ) : (
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-secondary text-xs font-medium">
                    {getDisplayName(displayedUser).charAt(0).toUpperCase()}
                  </span>
                )}
                <span>{getDisplayName(displayedUser)}</span>
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-44 rounded-xl border border-border bg-surface py-1 shadow-lg">
                  <Link
                    href="/account"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-secondary"
                  >
                    <UserIcon className="h-4 w-4 text-muted-foreground" />
                    {t("nav.myAccount")}
                  </Link>
                  <div className="my-1 border-t border-border" />
                  <button
                    type="button"
                    onClick={async () => {
                      setUserMenuOpen(false);
                      await signOut();
                      router.push("/");
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-secondary"
                  >
                    <LogOut className="h-4 w-4" />
                    {t("nav.signOut")}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Button asChild size="sm" className="hidden sm:inline-flex">
              <Link href="/account/login">
                <UserIcon className="h-4 w-4" />
                {t("nav.signIn")}
              </Link>
            </Button>
          )}

          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-full border border-border bg-surface md:hidden"
            aria-label={mobileOpen ? t("nav.closeMenu") : t("nav.openMenu")}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-border bg-surface md:hidden">
          <div className="container flex flex-col gap-1 py-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-xl px-3 py-2 text-sm hover:bg-secondary"
              >
                {t(item.key)}
              </Link>
            ))}
            {displayedIsAdmin && (
              <Link
                href="/admin"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl px-3 py-2 text-sm text-primary hover:bg-primary/10"
              >
                {t("nav.admin")}
              </Link>
            )}
            <div className="flex items-center gap-2 px-1 pt-2">
              <LanguageToggle />
              {displayedUser ? (
                <Link
                  href="/account"
                  className="ml-auto inline-flex items-center gap-2 rounded-full border border-border bg-surface py-1 pl-1 pr-3 text-sm"
                >
                  {displayedUser.avatarUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={displayedUser.avatarUrl}
                      alt={getDisplayName(displayedUser)}
                      className="h-7 w-7 rounded-full bg-secondary object-cover"
                    />
                  ) : (
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-secondary text-xs font-medium">
                      {getDisplayName(displayedUser).charAt(0).toUpperCase()}
                    </span>
                  )}
                  <span>{getDisplayName(displayedUser)}</span>
                </Link>
              ) : (
                <Button asChild size="sm" className="ml-auto">
                  <Link href="/account/login">{t("nav.signIn")}</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
