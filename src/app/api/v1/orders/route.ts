import { type NextRequest } from "next/server";
import { requireAuth } from "@/app/api/_lib/auth";
import { createAdminClient } from "@/app/api/_lib/supabase-admin";
import { apiError, ok } from "@/app/api/_lib/response";
import { mapOrder } from "@/app/api/_lib/mappers";

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof Response) return authResult;
  const { userId } = authResult;

  const supabase = createAdminClient();
  const { data: orders, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) return apiError(500, error.message);

  const result = await Promise.all(
    (orders ?? []).map(async (order) => {
      const { data: items } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", order.id);
      return mapOrder(order as Record<string, unknown>, (items ?? []) as Record<string, unknown>[]);
    }),
  );

  return ok(result);
}

export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof Response) return authResult;
  const { userId } = authResult;

  const body = await request.json().catch(() => null);
  if (!body?.items || !Array.isArray(body.items) || body.items.length === 0) {
    return apiError(400, "items array is required");
  }

  const supabase = createAdminClient();

  // Fetch product prices
  const productIds: string[] = body.items.map((i: { productId: string }) => i.productId);
  const { data: products, error: prodError } = await supabase
    .from("products")
    .select("id, price_cents, name_en, name_zh, image_url")
    .in("id", productIds);

  if (prodError) return apiError(500, prodError.message);

  const productMap = new Map(
    (products ?? []).map((p) => [p.id, p]),
  );

  // Compute totals
  let subtotalCents = 0;
  const orderItems: {
    productId: string;
    quantity: number;
    priceCents: number;
    nameEn: string;
    nameZh: string;
    imageUrl: string | null;
  }[] = [];

  for (const item of body.items) {
    const product = productMap.get(item.productId);
    if (!product) return apiError(400, `product not found: ${item.productId}`);
    const qty = Number(item.quantity);
    if (!qty || qty < 1) return apiError(400, "quantity must be >= 1");
    subtotalCents += product.price_cents * qty;
    orderItems.push({
      productId: item.productId,
      quantity: qty,
      priceCents: product.price_cents,
      nameEn: product.name_en,
      nameZh: product.name_zh,
      imageUrl: product.image_url ?? null,
    });
  }

  const deliveryFeeCents = subtotalCents < 5000 ? 199 : 0;
  const totalCents = subtotalCents + deliveryFeeCents;

  // Create order
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: userId,
      guest_name: body.guestName ?? null,
      subtotal_cents: subtotalCents,
      delivery_fee_cents: deliveryFeeCents,
      total_cents: totalCents,
      status: "PENDING",
      pickup_community_en: body.pickupCommunityEn ?? null,
      pickup_community_zh: body.pickupCommunityZh ?? null,
    })
    .select()
    .single();

  if (orderError) return apiError(500, orderError.message);

  // Create order items
  const { error: itemsError } = await supabase.from("order_items").insert(
    orderItems.map((i) => ({
      order_id: order.id,
      product_id: i.productId,
      quantity: i.quantity,
      unit_price_cents: i.priceCents,
      name_en: i.nameEn,
      name_zh: i.nameZh,
      image_url: i.imageUrl,
    })),
  );

  if (itemsError) return apiError(500, itemsError.message);

  // Clear the user's cart
  const { data: cart } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", userId)
    .single();
  if (cart) {
    await supabase.from("cart_items").delete().eq("cart_id", cart.id);
  }

  // Fetch created items for response
  const { data: createdItems } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", order.id);

  return ok(
    mapOrder(
      order as Record<string, unknown>,
      (createdItems ?? []) as Record<string, unknown>[],
    ),
    201,
  );
}
