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
  const guestItems: { productId: string; quantity: number }[] = body?.items ?? [];

  const supabase = createAdminClient();
  const cart = await getOrCreateCart(supabase, userId);
  if (!cart) return apiError(500, "failed to get cart");

  for (const guestItem of guestItems) {
    if (!guestItem.productId || guestItem.quantity < 1) continue;

    const { data: existing } = await supabase
      .from("cart_items")
      .select("*")
      .eq("cart_id", cart.id)
      .eq("product_id", guestItem.productId)
      .single();

    if (existing) {
      const existingRecord = existing as Record<string, unknown>;
      await supabase
        .from("cart_items")
        .update({ quantity: (existingRecord.quantity as number) + guestItem.quantity })
        .eq("id", existingRecord.id);
    } else {
      await supabase.from("cart_items").insert({
        cart_id: cart.id,
        product_id: guestItem.productId,
        quantity: guestItem.quantity,
      });
    }
  }

  return ok(await fetchCartResponse(supabase, cart.id as string));
}
