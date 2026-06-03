"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, LogIn } from "lucide-react";
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
import { CheckoutSkeleton } from "@/components/storefront/CheckoutSkeleton";
import { OrderConfirmedSkeleton } from "@/components/storefront/OrderConfirmedSkeleton";
import { Loader2 } from "lucide-react";
import { ProductImage } from "@/components/storefront/ProductImage";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useAuth } from "@/providers/AuthProvider";
import { useCart } from "@/providers/CartProvider";
import { getProduct, placeOrder, logActivity } from "@/lib/repository";
import { cn, formatPrice } from "@/lib/utils";
import type { Product } from "@/types";

const DELIVERY_THRESHOLD_CENTS = 15000;
const ORDER_SUMMARY_MAX_VISIBLE = 10;

const LOWER_MAINLAND_CITIES = [
  { value: "vancouver", en: "Vancouver", zh: "温哥华" },
  { value: "burnaby", en: "Burnaby", zh: "本拿比" },
  { value: "richmond", en: "Richmond", zh: "列治文" },
  { value: "surrey", en: "Surrey", zh: "素里" },
  { value: "coquitlam", en: "Coquitlam", zh: "高贵林" },
  { value: "port-coquitlam", en: "Port Coquitlam", zh: "高贵林港" },
  { value: "port-moody", en: "Port Moody", zh: "穆迪港" },
  { value: "new-westminster", en: "New Westminster", zh: "新西敏" },
  { value: "north-vancouver", en: "North Vancouver", zh: "北温哥华" },
  { value: "west-vancouver", en: "West Vancouver", zh: "西温哥华" },
  { value: "delta", en: "Delta", zh: "三角洲" },
  { value: "langley", en: "Langley", zh: "兰里" },
  { value: "maple-ridge", en: "Maple Ridge", zh: "枫树岭" },
  { value: "pitt-meadows", en: "Pitt Meadows", zh: "匹特草原" },
  { value: "white-rock", en: "White Rock", zh: "白石" },
] as const;

function RequiredMark() {
  return <span className="text-primary"> *</span>;
}

export default function CheckoutPage() {
  const { t, locale } = useLanguage();
  const { user, isReady, updateProfile } = useAuth();
  const { lines, clear, isReady: cartReady } = useCart();
  const router = useRouter();

  const [products, setProducts] = React.useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = React.useState(false);
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [wechatId, setWechatId] = React.useState("");
  const [community, setCommunity] = React.useState<
    "maple" | "cedar" | "river" | "none"
  >("maple");
  const [address, setAddress] = React.useState({
    line1: "",
    line2: "",
    city: "",
    postalCode: "",
  });
  const [submitting, setSubmitting] = React.useState(false);
  const [orderError, setOrderError] = React.useState<string | null>(null);

  const productIdsKey = React.useMemo(
    () => [...new Set(lines.map((l) => l.productId))].sort().join(","),
    [lines],
  );

  React.useEffect(() => {
    if (!productIdsKey) {
      setProducts([]);
      setProductsLoading(false);
      return;
    }
    let cancelled = false;
    const ids = productIdsKey.split(",");
    setProductsLoading(true);
    void Promise.all(ids.map((id) => getProduct(id)))
      .then((rows) => {
        if (cancelled) return;
        setProducts(rows.filter((p): p is Product => p !== undefined));
      })
      .finally(() => {
        if (!cancelled) setProductsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [productIdsKey]);

  React.useEffect(() => {
    if (!user) return;
    setName((n) => n || user.fullName || user.name);
    setPhone((p) => p || user.phone || "");
    setWechatId((w) => w || user.wechatId || "");
  }, [user]);

  const detailed = lines
    .map((l) => {
      const p = products.find((x) => x.id === l.productId);
      return p ? { ...l, product: p } : null;
    })
    .filter((l): l is NonNullable<typeof l> => l !== null);

  const subtotal = detailed.reduce((s, l) => s + l.product.price * l.quantity, 0);
  const deliveryFee = subtotal >= DELIVERY_THRESHOLD_CENTS || subtotal === 0 ? 0 : 199;
  const total = subtotal + deliveryFee;
  const qualifiesForDelivery = subtotal >= DELIVERY_THRESHOLD_CENTS;

  const communityMap = {
    maple: { en: t("checkout.communityMaple"), zh: "枫树街" },
    cedar: { en: t("checkout.communityCedar"), zh: "雪松巷" },
    river: { en: t("checkout.communityRiver"), zh: "河滨苑" },
  } as const;

  React.useEffect(() => {
    if (qualifiesForDelivery) {
      setCommunity("none");
    } else {
      setCommunity((c) => (c === "none" ? "maple" : c));
    }
  }, [qualifiesForDelivery]);

  const isPageLoading =
    !isReady ||
    !cartReady ||
    (lines.length > 0 && (productsLoading || detailed.length < lines.length));

  const contactRow = user ? 2 : 3;
  const deliveryRow = user ? 3 : 4;

  const goLogin = () => {
    router.push(`/account/login?next=${encodeURIComponent("/checkout")}`);
  };

  const onPlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      goLogin();
      return;
    }
    if (detailed.length === 0) return;
    if (qualifiesForDelivery) {
      if (!address.line1.trim() || !address.city.trim() || !address.postalCode.trim()) {
        return;
      }
    }
    if (!name.trim() || !phone.trim() || !wechatId.trim()) {
      return;
    }
    setSubmitting(true);
    setOrderError(null);
    try {
      const profileResult = await updateProfile({
        fullName: name.trim(),
        wechatId: wechatId.trim(),
        phone: phone.trim(),
      });
      if (profileResult.error) {
        setOrderError(profileResult.error);
        setSubmitting(false);
        return;
      }
      const pickup =
        qualifiesForDelivery
          ? { en: "None", zh: "无" }
          : community === "none"
            ? communityMap.maple
            : communityMap[community];
      const order = await placeOrder({
        userOpenid: user.id,
        guestName: name.trim() || undefined,
        items: detailed.map((d) => ({ productId: d.productId, quantity: d.quantity })),
        pickupCommunityEn: pickup.en,
        pickupCommunityZh: pickup.zh,
        ...(qualifiesForDelivery
          ? {
              deliveryAddress: {
                line1: address.line1.trim(),
                line2: address.line2.trim() || undefined,
                city: address.city,
                postalCode: address.postalCode.trim(),
              },
            }
          : {}),
      });
      logActivity("PLACE_ORDER", user.id, {
        orderId: order.id,
        total: order.total,
        items: order.items.length,
        contactName: name,
        contactPhone: phone,
        wechatId,
      });
      clear();
      router.replace(`/order/confirmed/${order.id}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Order failed. Please try again.";
      setOrderError(msg);
      setSubmitting(false);
    }
  };

  if (submitting) {
    return (
      <div className="relative">
        <OrderConfirmedSkeleton />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background/60">
          <div className="flex items-center gap-2 rounded-full bg-surface px-4 py-2 text-sm font-medium shadow-soft">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            {t("order.placingOrder")}
          </div>
        </div>
      </div>
    );
  }

  if (isPageLoading) {
    return <CheckoutSkeleton />;
  }

  if (lines.length === 0) {
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
      <form
        onSubmit={onPlaceOrder}
        className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-6 lg:grid-cols-[auto_1fr_380px]"
      >
        <h1 className="col-start-2 row-start-1 text-3xl font-semibold">
          {t("checkout.title")}
        </h1>

        {!user && (
          <div className="col-start-2 row-start-2 flex flex-wrap items-center gap-3 rounded-2xl border border-amber-soft/50 bg-amber-soft/10 p-4">
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

        <Button
          type="button"
          variant="default"
          size="sm"
          className="col-start-1 shrink-0 self-start"
          style={{ gridRowStart: contactRow }}
          onClick={() => router.push("/cart")}
        >
          <ArrowLeft className="h-4 w-4" />
          {t("checkout.backToCart")}
        </Button>

        <section
          className="col-start-2 space-y-4 rounded-2xl border border-border bg-surface p-5"
          style={{ gridRowStart: contactRow }}
        >
              <div className="space-y-1">
                <h2 className="text-sm font-semibold uppercase tracking-wide">
                  {t("checkout.contact")}
                </h2>
                <p className="text-xs text-muted-foreground">{t("checkout.requiredNote")}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="ck-name">
                  {t("checkout.contactName")}
                  <RequiredMark />
                </Label>
                <Input
                  id="ck-name"
                  required
                  autoComplete="name"
                  placeholder="Jane Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ck-phone">
                  {t("checkout.contactPhone")}
                  <RequiredMark />
                </Label>
                <Input
                  id="ck-phone"
                  required
                  inputMode="tel"
                  placeholder="(416) 555-0144"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ck-wechat">
                  {t("checkout.contactWechat")}
                  <RequiredMark />
                </Label>
                <Input
                  id="ck-wechat"
                  required
                  placeholder="wxid_example"
                  value={wechatId}
                  onChange={(e) => setWechatId(e.target.value)}
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>
                  {t("checkout.pickupCommunity")}
                  {!qualifiesForDelivery && <RequiredMark />}
                </Label>
                <Select
                  value={community}
                  disabled={qualifiesForDelivery}
                  onValueChange={(v) => setCommunity(v as typeof community)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {qualifiesForDelivery ? (
                      <SelectItem value="none">None / 无</SelectItem>
                    ) : (
                      <>
                        <SelectItem value="maple">
                          {communityMap.maple.en} / {communityMap.maple.zh}
                        </SelectItem>
                        <SelectItem value="cedar">
                          {communityMap.cedar.en} / {communityMap.cedar.zh}
                        </SelectItem>
                        <SelectItem value="river">
                          {communityMap.river.en} / {communityMap.river.zh}
                        </SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
                <p className="pt-5 text-xs text-muted-foreground">{t("checkout.deliveryNote")}</p>
                <p
                  className="rounded-lg px-3 py-2 text-xs"
                  style={{ background: "#EEF4FF", color: "#2C4A8C" }}
                >
                  {qualifiesForDelivery
                    ? t("checkout.deliveryQualified")
                    : t("checkout.deliveryNotQualified")}
                </p>
              </div>
              </div>
        </section>

        {qualifiesForDelivery ? (
          <section
            className="col-start-2 space-y-4 rounded-2xl border border-border bg-surface p-5"
            style={{ gridRowStart: deliveryRow }}
          >
              <div className="space-y-1">
                <h2 className="text-sm font-semibold uppercase tracking-wide">
                  {t("checkout.deliveryAddress")}
                </h2>
                <p className="text-xs text-muted-foreground">{t("checkout.requiredNote")}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="ck-address">
                    {t("checkout.addressLine1")}
                    <RequiredMark />
                  </Label>
                  <Input
                    id="ck-address"
                    required
                    value={address.line1}
                    onChange={(e) => setAddress({ ...address, line1: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="ck-address2">{t("checkout.addressLine2")}</Label>
                  <Input
                    id="ck-address2"
                    value={address.line2}
                    onChange={(e) => setAddress({ ...address, line2: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>
                    {t("checkout.city")}
                    <RequiredMark />
                  </Label>
                  <Select
                    value={address.city}
                    onValueChange={(v) => setAddress({ ...address, city: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("checkout.selectCity")} />
                    </SelectTrigger>
                    <SelectContent>
                      {LOWER_MAINLAND_CITIES.map((city) => (
                        <SelectItem key={city.value} value={city.value}>
                          {locale === "zh" ? city.zh : city.en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ck-postal">
                    {t("checkout.postalCode")}
                    <RequiredMark />
                  </Label>
                  <Input
                    id="ck-postal"
                    required
                    placeholder="V6B 1A1"
                    value={address.postalCode}
                    onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                  />
                </div>
              </div>
          </section>
        ) : null}

        {/* Payment form hidden for now — demo card fields preserved for later use.
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
                  <Input placeholder="4242 4242 4242 4242" />
                  <CreditCard className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>{t("checkout.cardExpiry")}</Label>
                <Input placeholder="12/29" />
              </div>
              <div className="space-y-1.5">
                <Label>{t("checkout.cardCvc")}</Label>
                <Input placeholder="123" />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>{t("checkout.cardName")}</Label>
                <Input />
              </div>
            </div>
          </section>
        */}

        <aside
          className={cn(
            "col-span-2 h-fit space-y-4 rounded-2xl border border-border bg-surface p-5 lg:col-span-1 lg:col-start-3 lg:row-start-1 lg:row-span-4",
            qualifiesForDelivery
              ? user
                ? "row-start-4"
                : "row-start-5"
              : user
                ? "row-start-3"
                : "row-start-4",
          )}
        >
          <h2 className="text-sm font-semibold uppercase tracking-wide">
            {t("checkout.orderSummary")}
          </h2>
          <ul
            className={cn(
              "space-y-3",
              detailed.length > ORDER_SUMMARY_MAX_VISIBLE &&
                "max-h-[calc(3rem*10+0.75rem*9)] overflow-y-auto pr-1",
            )}
          >
            {detailed.map(({ product, quantity }) => (
              <li key={product.id} className="flex items-center gap-3">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl">
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
              <span>{deliveryFee === 0 ? t("checkout.deliveryFree") : formatPrice(deliveryFee)}</span>
            </div>
            <div className="flex justify-between text-base font-semibold">
              <span>{t("cart.total")}</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
          {orderError && (
            <p className="rounded-xl bg-destructive/10 px-4 py-2.5 text-sm font-medium text-destructive">
              {orderError}
            </p>
          )}
          <Button type="submit" className="w-full" size="lg" disabled={submitting}>
            {t("checkout.placeOrder")}
          </Button>
        </aside>
      </form>
    </div>
  );
}

