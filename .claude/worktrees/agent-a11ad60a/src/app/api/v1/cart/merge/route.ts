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

export const POST = withRoute("POST /api/v1/cart/merge", async (request: NextRequest) => {
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
    await addOrIncrementCartItem(supabase, cart.id as string, guestItem.productId, guestItem.quantity);
  }

  return ok(await fetchCartResponse(supabase, cart.id as string));
});
