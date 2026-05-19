import { createAdminClient } from "./supabase-admin";
import { mapCart } from "./mappers";

type SupabaseClient = ReturnType<typeof createAdminClient>;

export async function getOrCreateCart(supabase: SupabaseClient, userId: string) {
  let { data: cart } = await supabase
    .from("carts")
    .select("*")
    .eq("user_id", userId)
    .single();
  if (!cart) {
    const { data } = await supabase
      .from("carts")
      .insert({ user_id: userId })
      .select()
      .single();
    cart = data;
  }
  return cart as Record<string, unknown> | null;
}

export async function fetchCartResponse(supabase: SupabaseClient, cartId: string) {
  const { data: cart } = await supabase
    .from("carts")
    .select("*")
    .eq("id", cartId)
    .single();
  const { data: items } = await supabase
    .from("cart_items")
    .select("*, products(name_en, name_zh, price_cents, image_url)")
    .eq("cart_id", cartId);

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
