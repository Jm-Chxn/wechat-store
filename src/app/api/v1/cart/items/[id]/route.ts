import { type NextRequest } from "next/server";
import { requireAuth } from "@/app/api/_lib/auth";
import { createAdminClient } from "@/app/api/_lib/supabase-admin";
import { apiError, ok } from "@/app/api/_lib/response";
import { fetchCartResponse } from "@/app/api/_lib/cart-helpers";
import { withRoute } from "@/app/api/_lib/route-wrapper";

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = withRoute(
  "PATCH /api/v1/cart/items/[id]",
  async (request: NextRequest, ctx: Ctx) => {
    const { id } = await ctx.params;
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;
    const { userId } = authResult;

    const body = await request.json().catch(() => null);
    if (body?.quantity === undefined || body.quantity < 0) {
      return apiError(400, "quantity >= 0 required");
    }

    const supabase = createAdminClient();
    const { data: item, error: lookupError } = await supabase
      .from("cart_items")
      .select("*, carts!inner(user_id)")
      .eq("id", id)
      .single();
    if (lookupError && lookupError.code !== "PGRST116") {
      console.error("[cart/items/[id] PATCH] lookup error:", lookupError);
      return apiError(500, "Internal server error");
    }

    const cartRecord = item as
      | (Record<string, unknown> & { carts: { user_id: string }; cart_id: string })
      | null;
    if (!cartRecord || cartRecord.carts.user_id !== userId) {
      return apiError(404, "cart item not found");
    }

    if (body.quantity === 0) {
      const { error: deleteError } = await supabase
        .from("cart_items")
        .delete()
        .eq("id", id);
      if (deleteError) {
        console.error("[cart/items/[id] PATCH] delete error:", deleteError);
        return apiError(500, "Internal server error");
      }
    } else {
      const { error: updateError } = await supabase
        .from("cart_items")
        .update({ quantity: body.quantity })
        .eq("id", id);
      if (updateError) {
        console.error("[cart/items/[id] PATCH] update error:", updateError);
        return apiError(500, "Internal server error");
      }
    }

    return ok(await fetchCartResponse(supabase, cartRecord.cart_id));
  },
);

export const DELETE = withRoute(
  "DELETE /api/v1/cart/items/[id]",
  async (request: NextRequest, ctx: Ctx) => {
    const { id } = await ctx.params;
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;
    const { userId } = authResult;

    const supabase = createAdminClient();
    const { data: item, error: lookupError } = await supabase
      .from("cart_items")
      .select("*, carts!inner(user_id)")
      .eq("id", id)
      .single();
    if (lookupError && lookupError.code !== "PGRST116") {
      console.error("[cart/items/[id] DELETE] lookup error:", lookupError);
      return apiError(500, "Internal server error");
    }

    const cartRecord = item as
      | (Record<string, unknown> & { carts: { user_id: string }; cart_id: string })
      | null;
    if (!cartRecord || cartRecord.carts.user_id !== userId) {
      return apiError(404, "cart item not found");
    }

    const { error: deleteError } = await supabase
      .from("cart_items")
      .delete()
      .eq("id", id);
    if (deleteError) {
      console.error("[cart/items/[id] DELETE] delete error:", deleteError);
      return apiError(500, "Internal server error");
    }

    return ok(await fetchCartResponse(supabase, cartRecord.cart_id));
  },
);
