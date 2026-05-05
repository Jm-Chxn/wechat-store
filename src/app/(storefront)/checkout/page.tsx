"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Lock, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductImage } from "@/components/storefront/ProductImage";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useAuth } from "@/providers/AuthProvider";
import { useCart } from "@/providers/CartProvider";
import { listProducts, placeOrder, logActivity } from "@/lib/repository";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types";

export default function CheckoutPage() {
  const { t, locale } = useLanguage();
  const { user, isReady } = useAuth();
  const { lines, clear } = useCart();
  const router = useRouter();

  const [products, setProducts] = React.useState<Product[]>([]);
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [community, setCommunity] = React.useState<"maple" | "cedar" | "river">(
    "maple",
  );
  const [card, setCard] = React.useState({ number: "", expiry: "", cvc: "", name: "" });
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    setProducts(listProducts());
  }, []);
  React.useEffect(() => {
    if (user) {
      setName((n) => n || user.name);
    }
  }, [user]);

  const detailed = lines
    .map((l) => {
      const p = products.find((x) => x.id === l.productId);
      return p ? { ...l, product: p } : null;
    })
    .filter((l): l is NonNullable<typeof l> => l !== null);

  const subtotal = detailed.reduce((s, l) => s + l.product.price * l.quantity, 0);
  const deliveryFee = subtotal >= 5000 || subtotal === 0 ? 0 : 199;
  const total = subtotal + deliveryFee;

  const communityMap = {
    maple: { en: t("checkout.communityMaple"), zh: "枫树街" },
    cedar: { en: t("checkout.communityCedar"), zh: "雪松巷" },
    river: { en: t("checkout.communityRiver"), zh: "河滨苑" },
  } as const;

  const goLogin = () => {
    router.push(`/account/login?next=${encodeURIComponent("/checkout")}`);
  };

  const onPlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      goLogin();
      return;
    }
    if (detailed.length === 0) return;
    setSubmitting(true);
    const order = placeOrder({
      userOpenid: user.id,
      items: detailed.map((d) => ({ productId: d.productId, quantity: d.quantity })),
      pickupCommunityEn: communityMap[community].en,
      pickupCommunityZh: communityMap[community].zh,
    });
    logActivity("PLACE_ORDER", user.id, {
      orderId: order.id,
      total: order.total,
      items: order.items.length,
    });
    clear();
    router.replace(`/order/confirmed/${order.id}`);
  };

  if (!isReady) {
    return (
      <div className="container py-16 text-center text-muted-foreground">
        {t("common.loading")}
      </div>
    );
  }

  if (detailed.length === 0) {
    return (
      <div className="container py-16">
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-2xl border border-dashed border-border bg-surface p-10 text-center">
          <h1 className="text-xl font-semibold">{t("cart.empty")}</h1>
          <Button onClick={() => router.push("/shop")}>{t("cart.emptyCta")}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="mb-6 text-3xl font-semibold">{t("checkout.title")}</h1>

      <form onSubmit={onPlaceOrder} className="grid gap-8 lg:grid-cols-[1fr,380px]">
        <div className="space-y-6">
          {!user && (
            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-amber-soft/50 bg-amber-soft/10 p-4">
              <span className="text-sm text-[#7a5410]">
                {t("checkout.signInRequired")}
              </span>
              <Button
                type="button"
                size="sm"
                onClick={goLogin}
                className="ml-auto"
              >
                <LogIn className="h-4 w-4" />
                {t("nav.signIn")}
              </Button>
            </div>
          )}

          <section className="space-y-4 rounded-2xl border border-border bg-surface p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide">
              {t("checkout.contact")}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="ck-name">{t("checkout.contactName")}</Label>
                <Input
                  id="ck-name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ck-phone">{t("checkout.contactPhone")}</Label>
                <Input
                  id="ck-phone"
                  required
                  inputMode="tel"
                  placeholder="(416) 555-0144"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>{t("checkout.pickupCommunity")}</Label>
                <Select
                  value={community}
                  onValueChange={(v) => setCommunity(v as typeof community)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="maple">{communityMap.maple.en} / {communityMap.maple.zh}</SelectItem>
                    <SelectItem value="cedar">{communityMap.cedar.en} / {communityMap.cedar.zh}</SelectItem>
                    <SelectItem value="river">{communityMap.river.en} / {communityMap.river.zh}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          <section className="space-y-4 rounded-2xl border border-border bg-surface p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide">
                {t("checkout.payment")}
              </h2>
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Lock className="h-3.5 w-3.5" />
                {t("checkout.cardHint")}
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label>{t("checkout.cardNumber")}</Label>
                <div className="relative">
                  <Input
                    placeholder="4242 4242 4242 4242"
                    value={card.number}
                    onChange={(e) => setCard({ ...card, number: e.target.value })}
                  />
                  <CreditCard className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>{t("checkout.cardExpiry")}</Label>
                <Input
                  placeholder="12/29"
                  value={card.expiry}
                  onChange={(e) => setCard({ ...card, expiry: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t("checkout.cardCvc")}</Label>
                <Input
                  placeholder="123"
                  value={card.cvc}
                  onChange={(e) => setCard({ ...card, cvc: e.target.value })}
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>{t("checkout.cardName")}</Label>
                <Input
                  value={card.name}
                  onChange={(e) => setCard({ ...card, name: e.target.value })}
                />
              </div>
            </div>
          </section>
        </div>

        <aside className="h-fit space-y-4 rounded-2xl border border-border bg-surface p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide">
            {t("checkout.orderSummary")}
          </h2>
          <ul className="space-y-3">
            {detailed.map(({ product, quantity }) => (
              <li key={product.id} className="flex items-center gap-3">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl">
                  <ProductImage src={product.imageUrl} alt={product.nameEn} rounded="xl" />
                </div>
                <div className="flex-1 text-sm">
                  <div className="line-clamp-1 font-medium">
                    {locale === "zh" ? product.nameZh : product.nameEn}
                  </div>
                  <div className="text-xs text-muted-foreground">× {quantity}</div>
                </div>
                <div className="text-sm font-semibold">
                  {formatPrice(product.price * quantity)}
                </div>
              </li>
            ))}
          </ul>
          <div className="space-y-1.5 border-t border-border pt-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("cart.subtotal")}</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("cart.deliveryFee")}</span>
              <span>{deliveryFee === 0 ? "Free / 免费" : formatPrice(deliveryFee)}</span>
            </div>
            <div className="flex justify-between text-base font-semibold">
              <span>{t("cart.total")}</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={submitting}>
            {t("checkout.placeOrder")}
          </Button>
        </aside>
      </form>
    </div>
  );
}
