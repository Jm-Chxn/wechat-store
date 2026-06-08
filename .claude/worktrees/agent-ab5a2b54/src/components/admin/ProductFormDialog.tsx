"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { categories } from "@/data/categories";
import { useLanguage } from "@/i18n/LanguageProvider";
import { uid } from "@/lib/utils";
import type { CategorySlug, DietaryTag, Product, StockStatus } from "@/types";
import type { DictionaryKey } from "@/i18n/strings";

const blankProduct = (): Product => ({
  id: uid("p"),
  slug: "",
  nameEn: "",
  nameZh: "",
  descriptionEn: "",
  descriptionZh: "",
  price: 999,
  packSizeEn: "",
  packSizeZh: "",
  stockStatus: "IN_STOCK",
  stockCount: 10,
  isNew: true,
  dietaryTags: [],
  imageUrl:
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=600&fit=crop&auto=format&q=70",
  categorySlug: "pantry-sauces",
});

const tags: DietaryTag[] = ["VEGAN", "VEGETARIAN", "GLUTEN_FREE", "HALAL", "ORGANIC", "SPICY"];

export function ProductFormDialog({
  open,
  onOpenChange,
  initial,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: Product;
  onSave: (p: Product) => void | Promise<void>;
}) {
  const { t } = useLanguage();
  const [draft, setDraft] = React.useState<Product>(blankProduct());

  React.useEffect(() => {
    if (open) {
      setDraft(initial ? { ...initial } : blankProduct());
    }
  }, [open, initial]);

  const set = <K extends keyof Product>(k: K, v: Product[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const slug =
      draft.slug ||
      draft.nameEn
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .slice(0, 60);
    onSave({ ...draft, slug, price: Math.round(draft.price) });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{initial ? t("admin.edit") : t("admin.uploadNew")}</DialogTitle>
          <DialogDescription>{t("brand.tagline")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="grid gap-4">
          <div className="space-y-1.5">
            <Label>{t("admin.productImageUrl")}</Label>
            <Input
              value={draft.imageUrl}
              onChange={(e) => set("imageUrl", e.target.value)}
              placeholder="https://images.unsplash.com/…"
            />
            {draft.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={draft.imageUrl}
                alt="preview"
                className="mt-2 h-24 w-24 rounded-xl object-cover img-fallback"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.opacity = "0.4";
                }}
              />
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>{t("admin.productNameEn")}</Label>
              <Input
                required
                value={draft.nameEn}
                onChange={(e) => set("nameEn", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t("admin.productNameZh")}</Label>
              <Input
                required
                value={draft.nameZh}
                onChange={(e) => set("nameZh", e.target.value)}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>{t("admin.productDescEn")}</Label>
              <Textarea
                value={draft.descriptionEn}
                onChange={(e) => set("descriptionEn", e.target.value)}
                rows={2}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>{t("admin.productDescZh")}</Label>
              <Textarea
                value={draft.descriptionZh}
                onChange={(e) => set("descriptionZh", e.target.value)}
                rows={2}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t("admin.productPrice")}</Label>
              <Input
                required
                type="number"
                step="0.01"
                value={(draft.price / 100).toFixed(2)}
                onChange={(e) =>
                  set(
                    "price",
                    Math.round(Number(e.target.value || 0) * 100),
                  )
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t("admin.productCategory")}</Label>
              <Select
                value={draft.categorySlug}
                onValueChange={(v) => set("categorySlug", v as CategorySlug)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.slug} value={c.slug}>
                      {t(`category.${c.slug}` as DictionaryKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>{t("admin.productPackEn")}</Label>
              <Input
                value={draft.packSizeEn}
                onChange={(e) => set("packSizeEn", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t("admin.productPackZh")}</Label>
              <Input
                value={draft.packSizeZh}
                onChange={(e) => set("packSizeZh", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t("admin.productStockStatus")}</Label>
              <Select
                value={draft.stockStatus}
                onValueChange={(v) => set("stockStatus", v as StockStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IN_STOCK">{t("product.inStock")}</SelectItem>
                  <SelectItem value="LIMITED">{t("product.limitedStock")}</SelectItem>
                  <SelectItem value="OUT_OF_STOCK">{t("product.outOfStock")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>{t("admin.productStockCount")}</Label>
              <Input
                type="number"
                value={draft.stockCount}
                onChange={(e) => set("stockCount", Number(e.target.value || 0))}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>{t("admin.productDietary")}</Label>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => {
                  const on = draft.dietaryTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() =>
                        set(
                          "dietaryTags",
                          on
                            ? draft.dietaryTags.filter((x) => x !== tag)
                            : [...draft.dietaryTags, tag],
                        )
                      }
                      className={
                        on
                          ? "rounded-full border border-primary bg-primary/10 px-3 py-1 text-xs text-primary"
                          : "rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:text-ink"
                      }
                    >
                      {t(`tag.${tag}` as DictionaryKey)}
                    </button>
                  );
                })}
              </div>
            </div>
            <label className="flex items-center gap-2 sm:col-span-2">
              <input
                type="checkbox"
                checked={draft.isNew}
                onChange={(e) => set("isNew", e.target.checked)}
              />
              <span className="text-sm">{t("admin.productIsNew")}</span>
            </label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("admin.cancel")}
            </Button>
            <Button type="submit">{t("admin.save")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
