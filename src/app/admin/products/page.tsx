"use client";

import * as React from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
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
import type { Product } from "@/types";
import type { DictionaryKey } from "@/i18n/strings";

export default function AdminProductsPage() {
  const { t, locale } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = React.useState<Product[]>([]);
  const [editing, setEditing] = React.useState<Product | undefined>(undefined);
  const [open, setOpen] = React.useState(false);
  const [confirm, setConfirm] = React.useState<Product | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    void listProducts().then((p) => { if (!cancelled) setProducts(p); });
    return () => { cancelled = true; };
  }, []);

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
    <div className="space-y-4 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{t("admin.products")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("shop.resultsCount", { n: products.length })}
          </p>
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
      </div>

      <div className="rounded-2xl border border-border bg-surface">
        <Table>
          <TableHeader>
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
            {products.map((p) => (
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
            ))}
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
