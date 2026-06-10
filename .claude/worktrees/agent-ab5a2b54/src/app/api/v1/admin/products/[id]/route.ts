import { type NextRequest } from "next/server";
import { requireAdmin } from "@/app/api/_lib/auth";
import { createAdminClient } from "@/app/api/_lib/supabase-admin";
import { apiError, noContent, ok } from "@/app/api/_lib/response";
import { mapProduct } from "@/app/api/_lib/mappers";
import { withRoute } from "@/app/api/_lib/route-wrapper";

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = withRoute(
  "PATCH /api/v1/admin/products/[id]",
  async (request: NextRequest, ctx: Ctx) => {
    const { id } = await ctx.params;
    const authResult = await requireAdmin(request);
    if (authResult instanceof Response) return authResult;

    const body = await request.json().catch(() => null);
    if (!body) return apiError(400, "request body required");

    const supabase = createAdminClient();

    const { data: existing, error: lookupError } = await supabase
      .from("products")
      .select("id")
      .eq("id", id)
      .single();
    if (lookupError && lookupError.code !== "PGRST116") {
      console.error("[admin/products PATCH] lookup error:", lookupError);
      return apiError(500, lookupError.message);
    }
    if (!existing) return apiError(404, "product not found");

    const patch: Record<string, unknown> = {};
    if (body.slug !== undefined) patch.slug = body.slug;
    if (body.nameEn !== undefined) patch.name_en = body.nameEn;
    if (body.nameZh !== undefined) patch.name_zh = body.nameZh;
    if (body.descriptionEn !== undefined) patch.description_en = body.descriptionEn;
    if (body.descriptionZh !== undefined) patch.description_zh = body.descriptionZh;
    if (body.price !== undefined) patch.price_cents = body.price;
    if (body.packSizeEn !== undefined) patch.pack_size_en = body.packSizeEn;
    if (body.packSizeZh !== undefined) patch.pack_size_zh = body.packSizeZh;
    if (body.stockStatus !== undefined) patch.stock_status = body.stockStatus;
    if (body.stockCount !== undefined) patch.stock_count = body.stockCount;
    if (body.isNew !== undefined) patch.is_new = body.isNew;
    if (body.dietaryTags !== undefined) {
      patch.dietary_tags = Array.isArray(body.dietaryTags)
        ? body.dietaryTags.join(",")
        : body.dietaryTags;
    }
    if (body.imageUrl !== undefined) patch.image_url = body.imageUrl;
    if (body.categorySlug !== undefined) patch.category_slug = body.categorySlug;

    const { data, error } = await supabase
      .from("products")
      .update(patch)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[admin/products PATCH] update error:", error);
      return apiError(500, error.message);
    }
    return ok(mapProduct(data as Record<string, unknown>));
  },
);

export const DELETE = withRoute(
  "DELETE /api/v1/admin/products/[id]",
  async (request: NextRequest, ctx: Ctx) => {
    const { id } = await ctx.params;
    const authResult = await requireAdmin(request);
    if (authResult instanceof Response) return authResult;

    const supabase = createAdminClient();

    const { data: existing, error: lookupError } = await supabase
      .from("products")
      .select("id")
      .eq("id", id)
      .single();
    if (lookupError && lookupError.code !== "PGRST116") {
      console.error("[admin/products DELETE] lookup error:", lookupError);
      return apiError(500, lookupError.message);
    }
    if (!existing) return apiError(404, "product not found");

    const { error: deleteError } = await supabase.from("products").delete().eq("id", id);
    if (deleteError) {
      console.error("[admin/products DELETE] delete error:", deleteError);
      return apiError(500, deleteError.message);
    }
    return noContent();
  },
);
