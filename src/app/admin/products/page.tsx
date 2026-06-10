"use client";

import * as React from "react";
import { Plus, Trash2, Pencil, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProductImage } from "@/components/storefront/ProductImage";
import { ProductFormDialog } from "@/components/admin/ProductFormDialog";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useAuth } from "@/providers/AuthProvider";
import {
  deleteProduct,
  listProducts,
  logActivity,
  upsertProduct,
} from "@/lib/repository";
import { useToast } from "@/components/ui/toast";
import { formatPrice } from "@/lib/utils";
import { categories } from "@/data/categories";
import type { Product } from "@/types";
import type { CategorySlug } from "@/types";
import type { DictionaryKey } from "@/i18n/strings";

export default function AdminProductsPage() {
  const { t, locale } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = React.useState<Product[]>([]);
  const [editing, setEditing] = React.useState<Product | undefined>(undefined);
  const [open, setOpen] = React.useState(false);
  const [confirm, setConfirm] = React.useState<Product | null>(null);
  const [search, setSearch] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState<CategorySlug | "ALL">("ALL");

  React.useEffect(() => {
    let cancelled = false;
    void listProducts().then((p) => { if (!cancelled) setProducts(p); });
    return () => { cancelled = true; };
  }, []);

  const filtered = React.useMemo(() => {
    const term = search.trim().toLowerCase();
    return products.filter((p) => {
      if (categoryFilter !== "ALL" && p.categorySlug !== categoryFilter) return false;
      if (!term) return true;
      return [p.nameEn, p.nameZh, p.slug].join(" ").toLowerCase().includes(term);
    });
  }, [products, search, categoryFilter]);

  const onSave = async (p: Product) => {
    const isCreate = !products.find((x) => x.id === p.id);
    const next = await upsertProduct(p, isCreate);
    setProducts(next);
    logActivity(
      isCreate ? "ADMIN_PRODUCT_CREATE" : "ADMIN_PRODUCT_UPDATE",
      user?.id ?? null,
      { productId: p.id, nameEn: p.nameEn },
    );
    toast({
      title: isCreate ? t("admin.uploadNew") : t("admin.edit"),
      description: locale === "zh" ? p.nameZh : p.nameEn,
    });
  };

  const onDelete = async (p: Product) => {
    const next = await deleteProduct(p.id);
    setProducts(next);
    logActivity("ADMIN_PRODUCT_DELETE", user?.id ?? null, {
      productId: p.id,
      nameEn: p.nameEn,
    });
    toast({
      title: t("admin.delete"),
      description: locale === "zh" ? p.nameZh : p.nameEn,
    });
    setConfirm(null);
  };

  return (
    <div className="space-y-5">
      <AdminPageHeader
        section={t("admin.products")}
        title={t("admin.productsPageTitle")}
        subtitle={t("admin.productsCount", { n: filtered.length, total: products.length })}
      >
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("admin.productsSearchPlaceholder")}
            className="w-56 rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-sm placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm">
          <Filter className="h-3.5 w-3.5 text-slate-500" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as typeof categoryFilter)}
            className="bg-transparent text-slate-700 focus:outline-none"
            aria-label="Filter by category"
          >
            <option value="ALL">{t("admin.productsFilterAll")}</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {t(`category.${c.slug}` as DictionaryKey)}
              </option>
            ))}
          </select>
        </div>
        <Button
          onClick={() => {
            setEditing(undefined);
            setOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          {t("admin.uploadNew")}
        </Button>
      </AdminPageHeader>

      <div className="max-h-[calc(100vh-260px)] overflow-y-auto rounded-2xl border border-border bg-surface">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm">
            <TableRow>
              <TableHead className="w-16"></TableHead>
              <TableHead>{t("admin.productNameEn")}</TableHead>
              <TableHead>{t("admin.productCategory")}</TableHead>
              <TableHead>{t("admin.productPrice")}</TableHead>
              <TableHead>{t("admin.productStockStatus")}</TableHead>
              <TableHead className="text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-sm text-slate-500">
                  {t("admin.noProductsMatch")}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="relative h-10 w-10 overflow-hidden rounded-xl">
                      <ProductImage src={p.imageUrl} alt={p.nameEn} rounded="xl" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {locale === "zh" ? p.nameZh : p.nameEn}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {locale === "zh" ? p.nameEn : p.nameZh}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {t(`category.${p.categorySlug}` as DictionaryKey)}
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatPrice(p.price)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        p.stockStatus === "IN_STOCK"
                          ? "secondary"
                          : p.stockStatus === "LIMITED"
                            ? "limited"
                            : "out"
                      }
                    >
                      {p.stockStatus === "IN_STOCK"
                        ? t("product.inStock")
                        : p.stockStatus === "LIMITED"
                          ? t("product.limitedStock")
                          : t("product.outOfStock")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditing(p);
                          setOpen(true);
                        }}
                        aria-label={t("admin.edit")}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setConfirm(p)}
                        aria-label={t("admin.delete")}
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ProductFormDialog
        open={open}
        onOpenChange={setOpen}
        initial={editing}
        onSave={onSave}
      />

      <Dialog open={!!confirm} onOpenChange={(v) => !v && setConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("admin.confirmDelete")}</DialogTitle>
            <DialogDescription>
              {confirm
                ? locale === "zh"
                  ? confirm.nameZh
                  : confirm.nameEn
                : ""}{" "}
              — {t("admin.confirmDeleteBody")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirm(null)}>
              {t("admin.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={() => confirm && onDelete(confirm)}
            >
              <Trash2 className="h-4 w-4" />
              {t("admin.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
