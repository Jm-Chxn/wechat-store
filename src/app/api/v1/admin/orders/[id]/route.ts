import { type NextRequest } from "next/server";
import { requireAdmin } from "@/app/api/_lib/auth";
import { createAdminClient } from "@/app/api/_lib/supabase-admin";
import { apiError, noContent, ok } from "@/app/api/_lib/response";
import { mapOrder } from "@/app/api/_lib/mappers";
import { withRoute } from "@/app/api/_lib/route-wrapper";

const VALID_STATUSES = ["CONFIRMED", "PROCESSING", "COMPLETED", "CANCELLED"] as const;
type Ctx = { params: Promise<{ id: string }> };

export const PATCH = withRoute(
  "PATCH /api/v1/admin/orders/[id]",
  async (request: NextRequest, ctx: Ctx) => {
    const { id } = await ctx.params;
    const authResult = await requireAdmin(request);
    if (authResult instanceof Response) return authResult;

    const body = await request.json().catch(() => null);
    if (!body?.status) return apiError(400, "status is required");
    if (!VALID_STATUSES.includes(body.status)) {
      return apiError(400, `status must be one of: ${VALID_STATUSES.join(", ")}`);
    }

    const supabase = createAdminClient();

    const { data: existing, error: lookupError } = await supabase
      .from("orders")
      .select("id")
      .eq("id", id)
      .single();
    if (lookupError && lookupError.code !== "PGRST116") {
      console.error("[admin/orders PATCH] lookup error:", lookupError);
      return apiError(500, "Internal server error");
    }
    if (!existing) return apiError(404, "order not found");

    const { data: order, error } = await supabase
      .from("orders")
      .update({ status: body.status })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[admin/orders PATCH] update error:", error);
      return apiError(500, "Internal server error");
    }

    const { data: items, error: itemsError } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", id);
    if (itemsError) {
      console.error("[admin/orders PATCH] items lookup error:", itemsError);
    }

    return ok(
      mapOrder(order as Record<string, unknown>, (items ?? []) as Record<string, unknown>[]),
    );
  },
);

export const DELETE = withRoute(
  "DELETE /api/v1/admin/orders/[id]",
  async (request: NextRequest, ctx: Ctx) => {
    const { id } = await ctx.params;
    const authResult = await requireAdmin(request);
    if (authResult instanceof Response) return authResult;

    const supabase = createAdminClient();

    const { error: itemsError } = await supabase
      .from("order_items")
      .delete()
      .eq("order_id", id);
    if (itemsError) {
      console.error("[admin/orders DELETE] items delete error:", itemsError);
      return apiError(500, "Internal server error");
    }

    const { error } = await supabase.from("orders").delete().eq("id", id);
    if (error) {
      console.error("[admin/orders DELETE] order delete error:", error);
      return apiError(500, "Internal server error");
    }

    return noContent();
  },
);
