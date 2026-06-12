import { type NextRequest } from "next/server";
import { createHash } from "node:crypto";
import { z } from "zod";
import { requireAuth } from "@/app/api/_lib/auth";
import { createAdminClient } from "@/app/api/_lib/supabase-admin";
import { apiError, ok } from "@/app/api/_lib/response";
import { mapOrder } from "@/app/api/_lib/mappers";
import { withRoute } from "@/app/api/_lib/route-wrapper";

const AddressSchema = z.object({
  line1: z.string().min(1).max(255),
  line2: z.string().max(255).optional().nullable(),
  city: z.string().min(1).max(100),
  postalCode: z.string().min(1).max(20),
});

/**
 * GET /api/v1/orders — list the caller's own orders, newest first.
 */
export const GET = withRoute("GET /api/v1/orders", async (request: NextRequest) => {
  const authResult = await requireAuth(request);
  if (authResult instanceof Response) return authResult;
  const { userId } = authResult;

  const supabase = createAdminClient();
  const { data: orders, error } = await supabase
    .from("orders")
    .select(`
      *,
      order_items (*)
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[GET /api/v1/orders] orders select failed:", error);
    return apiError(500, "Internal server error");
  }

  const result = (orders ?? []).map((order) => {
    const { order_items: items, ...orderData } = order as Record<string, unknown> & { order_items?: Record<string, unknown>[] };
    return mapOrder(orderData, (items ?? []) as Record<string, unknown>[]);
  });

  return ok(result);
});

/**
 * POST /api/v1/orders — place a new order from the caller's cart.
 *
 * Idempotency: pass header `Idempotency-Key: <client-uuid>` and a re-submit
 * with the same key returns the original order instead of creating a second
 * one. The key is hashed together with the user id so the same key from a
 * different user cannot collide.
 */
export const POST = withRoute("POST /api/v1/orders", async (request: NextRequest) => {
  const authResult = await requireAuth(request);
  if (authResult instanceof Response) return authResult;
  const { userId } = authResult;

  const body = await request.json().catch((err) => {
    console.error("[POST /api/v1/orders] invalid JSON body:", err);
    return null;
  });
  if (!body?.items || !Array.isArray(body.items) || body.items.length === 0) {
    return apiError(400, "items array is required");
  }

  const supabase = createAdminClient();

  const productIds: string[] = body.items
    .map((i: { productId?: string }) => i.productId)
    .filter((v: unknown): v is string => typeof v === "string" && v.length > 0);
  if (productIds.length !== body.items.length) {
    return apiError(400, "every item must have a productId");
  }

  const { data: products, error: prodError } = await supabase
    .from("products")
    .select("id, price_cents, name_en, name_zh, image_url")
    .in("id", productIds);

  if (prodError) {
    console.error("[POST /api/v1/orders] products select failed:", prodError);
    return apiError(500, "Internal server error");
  }

  const productMap = new Map((products ?? []).map((p) => [p.id, p]));

  // Detect any cart lines that point at products which no longer exist (or
  // never existed — e.g. mock IDs surviving from before the catalog was
  // seeded). Rather than failing on the first one with a cryptic message, we
  // report all of them at once AND drop them from the user's cart so the
  // next checkout attempt isn't stuck in the same state.
  const missingIds = Array.from(
    new Set(
      (body.items as Array<{ productId: string }>)
        .map((i) => i.productId)
        .filter((id) => !productMap.has(id)),
    ),
  );
  if (missingIds.length > 0) {
    // Best-effort cart cleanup. We don't fail the request if this fails — the
    // user will still get a useful 400 with the IDs they need to remove
    // client-side.
    try {
      const { data: cart } = await supabase
        .from("carts")
        .select("id")
        .eq("user_id", userId)
        .single();
      if (cart) {
        const { error: clearError } = await supabase
          .from("cart_items")
          .delete()
          .eq("cart_id", cart.id)
          .in("product_id", missingIds);
        if (clearError) {
          console.warn(
            `[POST /api/v1/orders] failed to clear stale cart_items for cart ${cart.id}:`,
            clearError,
          );
        }
      }
    } catch (err) {
      console.warn("[POST /api/v1/orders] stale cart cleanup threw:", err);
    }
    return apiError(
      409,
      `Some items in your cart are no longer available: ${missingIds.join(", ")}. ` +
        `We've removed them — please refresh the cart and try again.`,
      { missingProductIds: missingIds.join(",") },
    );
  }

  let subtotalCents = 0;
  const orderItems: {
    productId: string;
    quantity: number;
    priceCents: number;
    nameEn: string;
    nameZh: string;
    imageUrl: string | null;
  }[] = [];

  for (const item of body.items as Array<{ productId: string; quantity: unknown }>) {
    const product = productMap.get(item.productId);
    if (!product) return apiError(409, "One or more products are no longer available");
    if (!Number.isInteger(product.price_cents) || product.price_cents <= 0) {
      return apiError(400, "Invalid product price data");
    }
    const qty = Number(item.quantity);
    if (!Number.isFinite(qty) || qty < 1) {
      return apiError(400, "quantity must be >= 1");
    }
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

  const idempotencyKey = request.headers.get("idempotency-key");
  const orderId = idempotencyKey
    ? `ord_idem_${shortHash(`${userId}:${idempotencyKey}`)}`
    : `ord_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

  // If the deterministic idempotency-based ID already exists, return the
  // existing order verbatim — re-submits are no-ops.
  if (idempotencyKey) {
    const { data: existing } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();
    if (existing) {
      const { data: existingItems } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", orderId);
      return ok(
        mapOrder(
          existing as Record<string, unknown>,
          (existingItems ?? []) as Record<string, unknown>[],
        ),
        200,
      );
    }
  }

  let deliveryAddress: z.infer<typeof AddressSchema> | null = null;
  if (body.deliveryAddress && typeof body.deliveryAddress === "object") {
    const parsed = AddressSchema.safeParse(body.deliveryAddress);
    if (!parsed.success) {
      return apiError(400, `Invalid delivery address: ${parsed.error.issues.map((i) => i.message).join(", ")}`);
    }
    deliveryAddress = parsed.data;
  }

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      id: orderId,
      user_id: userId,
      guest_name: body.guestName ?? null,
      subtotal_cents: subtotalCents,
      delivery_fee_cents: deliveryFeeCents,
      total_cents: totalCents,
      status: "CONFIRMED",
      pickup_community_en: body.pickupCommunityEn ?? null,
      pickup_community_zh: body.pickupCommunityZh ?? null,
      delivery_address: deliveryAddress,
    })
    .select()
    .single();

  if (orderError) {
    // PK conflict from a concurrent retry with the same idempotency key —
    // recover by returning the existing row.
    if (orderError.code === "23505" && idempotencyKey) {
      const { data: existing } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single();
      const { data: existingItems } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", orderId);
      return ok(
        mapOrder(
          existing as Record<string, unknown>,
          (existingItems ?? []) as Record<string, unknown>[],
        ),
        200,
      );
    }
    console.error("[POST /api/v1/orders] order insert failed:", orderError);
    return apiError(500, "Internal server error");
  }

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

  if (itemsError) {
    console.error("[POST /api/v1/orders] order_items insert failed:", itemsError);
    // Roll back the orphan order so a retry can succeed and the admin table
    // doesn't fill with empty rows.
    await supabase.from("orders").delete().eq("id", order.id);
    return apiError(500, "Internal server error");
  }

  // Clear the user's cart (best-effort — we still return 201 even if this
  // step fails, since the order itself succeeded).
  try {
    const { data: cart, error: cartLookupError } = await supabase
      .from("carts")
      .select("id")
      .eq("user_id", userId)
      .single();
    if (cartLookupError) {
      console.error(
        `[POST /api/v1/orders] cart lookup failed for user ${userId}:`,
        cartLookupError,
      );
    } else if (cart) {
      const { error: clearError } = await supabase
        .from("cart_items")
        .delete()
        .eq("cart_id", cart.id);
      if (clearError) {
        console.error(
          `[POST /api/v1/orders] failed to clear cart_items for cart ${cart.id}:`,
          clearError,
        );
      }
    }
  } catch (err) {
    console.error("[POST /api/v1/orders] cart deletion threw:", err);
  }

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
});

function shortHash(input: string): string {
  return createHash("sha256").update(input).digest("hex").slice(0, 24);
}
