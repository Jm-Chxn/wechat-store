import { type NextRequest } from "next/server";
import { requireAuth } from "@/app/api/_lib/auth";
import { createAdminClient } from "@/app/api/_lib/supabase-admin";
import { apiError, ok } from "@/app/api/_lib/response";
import { getOrCreateCart, fetchCartResponse } from "@/app/api/_lib/cart-helpers";

export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof Response) return authResult;
  const { userId } = authResult;

  const body = await request.json().catch(() => null);
  if (!body?.productId || !body?.quantity || body.quantity < 1) {
    return apiError(400, "productId and quantity >= 1 required");
  }

  const supabase = createAdminClient();

  const { data: product } = await supabase
    .from("products")
    .select("id")
    .eq("id", body.productId)
    .single();
  if (!product) return apiError(404, "product not found");

  const cart = await getOrCreateCart(supabase, userId);
  if (!cart) return apiError(500, "failed to get cart");

  const { data: existing } = await supabase
    .from("cart_items")
    .select("*")
    .eq("cart_id", cart.id)
    .eq("product_id", body.productId)
    .single();

  if (existing) {
    await supabase
      .from("cart_items")
      .update({ quantity: (existing as Record<string, unknown>).quantity as number + body.quantity })
      .eq("id", (existing as Record<string, unknown>).id);
  } else {
    await supabase.from("cart_items").insert({
      cart_id: cart.id,
      product_id: body.productId,
      quantity: body.quantity,
    });
  }

  return ok(await fetchCartResponse(supabase, cart.id as string));
}
