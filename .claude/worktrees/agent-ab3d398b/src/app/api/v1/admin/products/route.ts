import { type NextRequest } from "next/server";
import { requireAdmin } from "@/app/api/_lib/auth";
import { createAdminClient } from "@/app/api/_lib/supabase-admin";
import { apiError, ok } from "@/app/api/_lib/response";
import { mapProduct } from "@/app/api/_lib/mappers";
import { withRoute } from "@/app/api/_lib/route-wrapper";

export const POST = withRoute(
  "POST /api/v1/admin/products",
  async (request: NextRequest) => {
    const authResult = await requireAdmin(request);
    if (authResult instanceof Response) return authResult;

    const body = await request.json().catch(() => null);
    if (!body) return apiError(400, "request body required");

    const supabase = createAdminClient();

    const id =
      body.id ||
      `p_${crypto.randomUUID().replace(/-/g, "").slice(0, 8)}`;

    const { data, error } = await supabase
      .from("products")
      .insert({
        id,
        slug: body.slug,
        name_en: body.nameEn,
        name_zh: body.nameZh,
        description_en: body.descriptionEn ?? null,
        description_zh: body.descriptionZh ?? null,
        price_cents: body.price,
        pack_size_en: body.packSizeEn ?? null,
        pack_size_zh: body.packSizeZh ?? null,
        stock_status: body.stockStatus ?? "IN_STOCK",
        stock_count: body.stockCount ?? 0,
        is_new: body.isNew ?? false,
        dietary_tags: Array.isArray(body.dietaryTags)
          ? body.dietaryTags.join(",")
          : (body.dietaryTags ?? ""),
        image_url: body.imageUrl ?? null,
        category_slug: body.categorySlug,
      })
      .select()
      .single();

    if (error) {
      console.error("[POST admin/products] insert failed:", error);
      return apiError(500, error.message);
    }
    return ok(mapProduct(data as Record<string, unknown>), 201);
  },
);
