import { type NextRequest } from "next/server";
import { getAuthUser } from "@/app/api/_lib/auth";
import { createAdminClient } from "@/app/api/_lib/supabase-admin";
import { apiError, ok } from "@/app/api/_lib/response";
import { mapOrder } from "@/app/api/_lib/mappers";
import { withRoute } from "@/app/api/_lib/route-wrapper";

type Ctx = { params: Promise<{ id: string }> };

export const GET = withRoute(
  "GET /api/v1/orders/[id]",
  async (request: NextRequest, ctx: Ctx) => {
    const { id } = await ctx.params;
    const authUser = await getAuthUser(request);
    if (!authUser) return apiError(401, "Unauthorized");

    const supabase = createAdminClient();
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .single();

    if (orderError && orderError.code !== "PGRST116") {
      console.error("[orders/[id] GET] lookup error:", orderError);
      return apiError(500, "Internal server error");
    }
    if (!order) return apiError(404, "order not found");

    const orderRecord = order as Record<string, unknown>;

    if (orderRecord.user_id !== authUser.userId && authUser.role !== "admin") {
      return apiError(404, "order not found");
    }

    const { data: items, error: itemsError } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", id);
    if (itemsError) {
      console.error("[orders/[id] GET] items lookup error:", itemsError);
    }

    return ok(
      mapOrder(orderRecord, (items ?? []) as Record<string, unknown>[]),
    );
  },
);

/**
 * PATCH /api/v1/orders/[id] — owner may cancel their order (status → CANCELLED).
 */
export const PATCH = withRoute(
  "PATCH /api/v1/orders/[id]",
  async (request: NextRequest, ctx: Ctx) => {
    const { id } = await ctx.params;
    const authUser = await getAuthUser(request);
    if (!authUser) return apiError(401, "Unauthorized");

    const body = await request.json().catch(() => null);
    if (!body?.status) return apiError(400, "status is required");

    if (body.status !== "CANCELLED") {
      return apiError(400, "Only cancellation is supported");
    }

    const supabase = createAdminClient();
    const { data: existing, error: lookupError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .single();

    if (lookupError && lookupError.code !== "PGRST116") {
      console.error("[orders/[id] PATCH] lookup error:", lookupError);
      return apiError(500, "Internal server error");
    }
    if (!existing) return apiError(404, "order not found");

    const row = existing as Record<string, unknown>;
    if (row.user_id !== authUser.userId && authUser.role !== "admin") {
      return apiError(404, "order not found");
    }

    if (row.status === "CANCELLED") {
      const { data: items } = await supabase.from("order_items").select("*").eq("order_id", id);
      return ok(mapOrder(row, (items ?? []) as Record<string, unknown>[]));
    }

    if (row.status === "COMPLETED") {
      return apiError(400, "Completed orders cannot be cancelled");
    }

    const { data: updated, error: updateError } = await supabase
      .from("orders")
      .update({ status: "CANCELLED" })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("[orders/[id] PATCH] update failed:", updateError);
      return apiError(500, "Internal server error");
    }

    const { data: items } = await supabase.from("order_items").select("*").eq("order_id", id);
    return ok(mapOrder(updated as Record<string, unknown>, (items ?? []) as Record<string, unknown>[]));
  },
);
