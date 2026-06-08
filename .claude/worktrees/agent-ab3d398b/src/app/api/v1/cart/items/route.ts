import { type NextRequest } from "next/server";
import { requireAuth } from "@/app/api/_lib/auth";
import { createAdminClient } from "@/app/api/_lib/supabase-admin";
import { apiError, ok } from "@/app/api/_lib/response";
import {
  addOrIncrementCartItem,
  getOrCreateCart,
  fetchCartResponse,
} from "@/app/api/_lib/cart-helpers";
import { withRoute } from "@/app/api/_lib/route-wrapper";

export const POST = withRoute("POST /api/v1/cart/items", async (request: NextRequest) => {
  const authResult = await requireAuth(request);
  if (authResult instanceof Response) return authResult;
  const { userId } = authResult;

  const body = await request.json().catch(() => null);
  const qty = Number(body?.quantity);
  if (!body?.productId || !Number.isFinite(qty) || qty < 1) {
    return apiError(400, "productId and quantity >= 1 required");
  }

  const supabase = createAdminClient();

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id")
    .eq("id", body.productId)
    .single();
  if (productError && productError.code !== "PGRST116") {
    console.error("[POST /api/v1/cart/items] product lookup failed:", productError);
    return apiError(500, productError.message);
  }
  if (!product) return apiError(404, "product not found");

  const cart = await getOrCreateCart(supabase, userId);
  if (!cart) return apiError(500, "failed to get cart");

  await addOrIncrementCartItem(supabase, cart.id as string, body.productId, qty);

  return ok(await fetchCartResponse(supabase, cart.id as string));
});
