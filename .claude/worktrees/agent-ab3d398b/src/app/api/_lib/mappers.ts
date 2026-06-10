export function mapProduct(row: Record<string, unknown>) {
  return {
    id: row.id,
    slug: row.slug,
    nameEn: row.name_en,
    nameZh: row.name_zh,
    descriptionEn: row.description_en ?? null,
    descriptionZh: row.description_zh ?? null,
    price: row.price_cents, // repository.ts treats this as cents
    packSizeEn: row.pack_size_en ?? null,
    packSizeZh: row.pack_size_zh ?? null,
    stockStatus: row.stock_status,
    stockCount: row.stock_count,
    isNew: row.is_new,
    dietaryTags: row.dietary_tags
      ? String(row.dietary_tags)
          .split(",")
          .filter(Boolean)
      : [],
    imageUrl: row.image_url ?? null,
    categorySlug: row.category_slug,
  };
}

function parseDeliveryAddress(raw: unknown) {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.line1 !== "string" || typeof o.city !== "string") return null;
  return {
    line1: o.line1,
    line2: typeof o.line2 === "string" ? o.line2 : undefined,
    city: String(o.city),
    postalCode: typeof o.postalCode === "string" ? o.postalCode : String(o.postal_code ?? ""),
  };
}

export function mapOrder(
  row: Record<string, unknown>,
  items: Record<string, unknown>[],
) {
  return {
    id: row.id,
    userId: row.user_id ?? null,
    guestName: row.guest_name ?? null,
    subtotalCents: row.subtotal_cents,
    deliveryFeeCents: row.delivery_fee_cents,
    totalCents: row.total_cents,
    status: row.status,
    pickupCommunityEn: row.pickup_community_en ?? null,
    pickupCommunityZh: row.pickup_community_zh ?? null,
    deliveryAddress: parseDeliveryAddress(row.delivery_address),
    createdAt: row.created_at ?? null,
    items: items.map((i) => ({
      productId: i.product_id,
      nameEn: i.name_en,
      nameZh: i.name_zh,
      imageUrl: i.image_url ?? null,
      unitPriceCents: i.unit_price_cents,
      quantity: i.quantity,
    })),
  };
}

export function mapCart(
  cart: Record<string, unknown>,
  items: Record<string, unknown>[],
) {
  const subtotalCents = items.reduce(
    (sum, i) => sum + Number(i.unit_price_cents ?? 0) * Number(i.quantity),
    0,
  );
  return {
    cartId: cart.id,
    items: items.map((i) => ({
      id: i.id,
      productId: i.product_id,
      quantity: i.quantity,
      nameEn: i.name_en ?? null,
      nameZh: i.name_zh ?? null,
      unitPriceCents: i.unit_price_cents ?? 0,
      imageUrl: i.image_url ?? null,
    })),
    subtotalCents,
  };
}

export function mapActivity(row: Record<string, unknown>) {
  return {
    id: row.id,
    type: row.type,
    userId: row.user_id ?? null,
    anonId: row.anon_id ?? null,
    meta: row.meta ?? "{}",
    createdAt: row.created_at ?? null,
  };
}

export function mapUserSummary(
  profile: Record<string, unknown>,
  orderCount: number,
  activityCount: number,
  totalSpentCents: number,
) {
  return {
    userId: profile.user_id,
    nickname: profile.nickname ?? null,
    avatarUrl: profile.avatar_url ?? null,
    role: profile.role,
    createdAt: profile.created_at ?? null,
    lastSeenAt: profile.last_seen_at ?? null,
    orderCount,
    activityCount,
    totalSpentCents,
  };
}
