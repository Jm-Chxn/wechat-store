import { createAdminClient } from "./supabase-admin";
import { mapCart } from "./mappers";

type SupabaseClient = ReturnType<typeof createAdminClient>;

/**
 * Look up a user's cart row, creating one if it doesn't exist. Race-safe:
 * if two concurrent requests both miss the SELECT and try to INSERT, the
 * `carts.user_id UNIQUE` constraint will reject the loser with PostgREST
 * error code `23505` — we catch that case and re-SELECT.
 */
export async function getOrCreateCart(supabase: SupabaseClient, userId: string) {
  const { data: existing, error: selectError } = await supabase
    .from("carts")
    .select("*")
    .eq("user_id", userId)
    .single();
  if (selectError && selectError.code !== "PGRST116") {
    throw new Error(`cart lookup failed: ${selectError.message}`);
  }
  if (existing) return existing as Record<string, unknown>;

  const insert = await supabase
    .from("carts")
    .insert({ user_id: userId })
    .select()
    .single();
  if (!insert.error) return insert.data as Record<string, unknown>;

  // Concurrent insert won the race; re-fetch.
  if (insert.error.code === "23505") {
    const refetch = await supabase
      .from("carts")
      .select("*")
      .eq("user_id", userId)
      .single();
    if (refetch.error) throw new Error(`cart re-fetch failed: ${refetch.error.message}`);
    return refetch.data as Record<string, unknown>;
  }
  throw new Error(`cart insert failed: ${insert.error.message}`);
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

  // UNIQUE conflict — another concurrent insert beat us. Re-fetch and update.
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
