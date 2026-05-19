import { type NextRequest } from "next/server";
import { requireAuth } from "@/app/api/_lib/auth";
import { createAdminClient } from "@/app/api/_lib/supabase-admin";
import { apiError, noContent, ok } from "@/app/api/_lib/response";
import { fetchCartResponse } from "@/app/api/_lib/cart-helpers";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const authResult = await requireAuth(request);
  if (authResult instanceof Response) return authResult;
  const { userId } = authResult;

  const body = await request.json().catch(() => null);
  if (body?.quantity === undefined || body.quantity < 0) {
    return apiError(400, "quantity >= 0 required");
  }

  const supabase = createAdminClient();
  const { data: item } = await supabase
    .from("cart_items")
    .select("*, carts!inner(user_id)")
    .eq("id", id)
    .single();

  const cartRecord = item as (Record<string, unknown> & { carts: { user_id: string } }) | null;
  if (!cartRecord || cartRecord.carts.user_id !== userId) {
    return apiError(404, "cart item not found");
  }

  if (body.quantity === 0) {
    await supabase.from("cart_items").delete().eq("id", id);
  } else {
    await supabase.from("cart_items").update({ quantity: body.quantity }).eq("id", id);
  }

  return ok(await fetchCartResponse(supabase, cartRecord.cart_id as string));
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const authResult = await requireAuth(request);
  if (authResult instanceof Response) return authResult;
  const { userId } = authResult;

  const supabase = createAdminClient();
  const { data: item } = await supabase
    .from("cart_items")
    .select("*, carts!inner(user_id)")
    .eq("id", id)
    .single();

  const cartRecord = item as (Record<string, unknown> & { carts: { user_id: string } }) | null;
  if (!cartRecord || cartRecord.carts.user_id !== userId) {
    return apiError(404, "cart item not found");
  }

  await supabase.from("cart_items").delete().eq("id", id);
  return ok(await fetchCartResponse(supabase, cartRecord.cart_id as string));
}

export { noContent };
