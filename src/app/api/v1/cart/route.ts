import { type NextRequest } from "next/server";
import { requireAuth } from "@/app/api/_lib/auth";
import { createAdminClient } from "@/app/api/_lib/supabase-admin";
import { apiError, ok } from "@/app/api/_lib/response";
import { getOrCreateCart, fetchCartResponse } from "@/app/api/_lib/cart-helpers";

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof Response) return authResult;
  const { userId } = authResult;

  const supabase = createAdminClient();
  const cart = await getOrCreateCart(supabase, userId);
  if (!cart) return apiError(500, "failed to get or create cart");

  return ok(await fetchCartResponse(supabase, cart.id as string));
}
