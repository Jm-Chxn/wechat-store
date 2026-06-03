import { createAdminClient } from "./supabase-admin";
import { mapCart } from "./mappers";

type SupabaseClient = ReturnType<typeof createAdminClient>;

/**
 * Look up a user's cart row, creating one if it doesn't exist.
 * Uses a single atomic upsert to avoid double-roundtrip SELECT+INSERT races.
 */
export async function getOrCreateCart(supabase: SupabaseClient, userId: string) {
  const { data: cart, error } = await supabase
    .from("carts")
    .upsert(
      { user_id: userId },
      { onConflict: "user_id", ignoreDuplicates: false }
    )
    .select()
    .single();

  if (error) throw error;
  return cart as Record<string, unknown>;
}

export async function fetchCartResponse(supabase: SupabaseClient, cartId: string) {
  const { data: cart, error: cartError } = await supabase
    .from("carts")
    .select("*")
    .eq("id", cartId)
    .single();
  if (cartError) throw new Error(`cart fetch failed: ${cartError.message}`);

  const { data: items, error: itemsError } = await supabase
    .from("cart_items")
    .select("*, products(name_en, name_zh, price_cents, image_url)")
    .eq("cart_id", cartId);
  if (itemsError) throw new Error(`cart items fetch failed: ${itemsError.message}`);

  const enriched = (items ?? []).map(
    (i: Record<string, unknown> & { products?: Record<string, unknown> | null }) => ({
      id: i.id,
      product_id: i.product_id,
      quantity: i.quantity,
      name_en: i.products?.name_en ?? null,
      name_zh: i.products?.name_zh ?? null,
      unit_price_cents: i.products?.price_cents ?? 0,
      image_url: i.products?.image_url ?? null,
    }),
  );

  return mapCart(cart as Record<string, unknown>, enriched);
}

/**
 * Race-safe `cart_items` upsert. If two concurrent ADD calls both INSERT for
 * the same (cart_id, product_id), the second hits the UNIQUE constraint —
 * we fall back to an UPDATE that adds the quantity instead of failing.
 */
export async function addOrIncrementCartItem(
  supabase: SupabaseClient,
  cartId: string,
  productId: string,
  quantity: number,
) {
  const { data: existing } = await supabase
    .from("cart_items")
    .select("id, quantity")
    .eq("cart_id", cartId)
    .eq("product_id", productId)
    .single();

  if (existing) {
    const e = existing as { id: string; quantity: number };
    const { error } = await supabase
      .from("cart_items")
      .update({ quantity: e.quantity + quantity })
      .eq("id", e.id);
    if (error) throw new Error(`cart item update failed: ${error.message}`);
    return;
  }

  const insert = await supabase
    .from("cart_items")
    .insert({ cart_id: cartId, product_id: productId, quantity });
  if (!insert.error) return;

  // 23505 = PostgreSQL unique_violation — a concurrent insert beat us to the
  // (cart_id, product_id) unique constraint. This is safe to retry: re-fetch
  // the existing row and increment its quantity. Any other error code indicates
  // a real failure and should be re-thrown.
  if (insert.error.code === "23505") {
    const { data: again, error: againErr } = await supabase
      .from("cart_items")
      .select("id, quantity")
      .eq("cart_id", cartId)
      .eq("product_id", productId)
      .single();
    if (againErr) throw new Error(`cart item re-select failed: ${againErr.message}`);
    const e = again as { id: string; quantity: number };
    const { error } = await supabase
      .from("cart_items")
      .update({ quantity: e.quantity + quantity })
      .eq("id", e.id);
    if (error) throw new Error(`cart item update-after-race failed: ${error.message}`);
    return;
  }
  throw new Error(`cart item insert failed: ${insert.error.message}`);
}
