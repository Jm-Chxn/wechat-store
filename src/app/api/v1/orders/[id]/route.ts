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
      return apiError(500, orderError.message);
    }
    if (!order) return apiError(404, "order not found");

    const orderRecord = order as Record<string, unknown>;

    // Return 404 (not 403) for non-owner non-admin to avoid leaking existence.
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
