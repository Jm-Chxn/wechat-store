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

  const skippedItems: { productId: unknown; quantity: unknown; reason: string }[] = [];

  for (const guestItem of guestItems) {
    if (!guestItem.productId || guestItem.quantity < 1) {
      skippedItems.push({
        productId: guestItem.productId,
        quantity: guestItem.quantity,
        reason: !guestItem.productId ? "missing productId" : "quantity must be >= 1",
      });
      continue;
    }
    await addOrIncrementCartItem(supabase, cart.id as string, guestItem.productId, guestItem.quantity);
  }

  const merged = await fetchCartResponse(supabase, cart.id as string);
  return ok({ ...merged, skipped: skippedItems });
});
