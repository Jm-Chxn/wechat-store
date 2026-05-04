// Shared domain types for the tuangou MVP.

export type Locale = "en" | "zh";

export type Role = "user" | "admin";

export type StockStatus = "IN_STOCK" | "LIMITED" | "OUT_OF_STOCK";

export type DietaryTag =
  | "VEGAN"
  | "VEGETARIAN"
  | "GLUTEN_FREE"
  | "HALAL"
  | "ORGANIC"
  | "SPICY";

export type CategorySlug =
  | "fresh-meat-poultry"
  | "eggs-dairy"
  | "snacks-crackers"
  | "noodles-wrappers"
  | "pantry-sauces"
  | "frozen-foods"
  | "tofu-soy"
  | "beverages";

export interface Category {
  slug: CategorySlug;
  nameEn: string;
  nameZh: string;
  iconName: string; // lucide icon name
  blurbEn: string;
  blurbZh: string;
}

export interface Product {
  id: string;
  slug: string;
  nameEn: string;
  nameZh: string;
  descriptionEn: string;
  descriptionZh: string;
  /** price in cents (USD) */
  price: number;
  packSizeEn: string;
  packSizeZh: string;
  stockStatus: StockStatus;
  stockCount: number;
  isNew: boolean;
  dietaryTags: DietaryTag[];
  imageUrl: string;
  categorySlug: CategorySlug;
}

export interface WeChatAccount {
  openid: string;
  nicknameEn: string;
  nicknameZh: string;
  avatarUrl: string;
  role: Role;
  joinedAt: string; // ISO
}

export interface CartLine {
  productId: string;
  quantity: number;
}

export type OrderStatus = "CONFIRMED" | "PROCESSING" | "COMPLETED" | "CANCELLED";

export interface OrderItem {
  productId: string;
  nameEn: string;
  nameZh: string;
  imageUrl: string;
  unitPrice: number;
  quantity: number;
}

export interface Order {
  id: string;
  userOpenid: string | null;
  guestName?: string;
  items: OrderItem[];
  /** subtotal in cents */
  subtotal: number;
  /** delivery fee in cents */
  deliveryFee: number;
  /** total in cents */
  total: number;
  status: OrderStatus;
  createdAt: string; // ISO
  pickupCommunityEn: string;
  pickupCommunityZh: string;
}

export type ActivityType =
  | "SIGN_IN"
  | "SIGN_OUT"
  | "CLICK_BUY"
  | "ADD_TO_CART"
  | "PLACE_ORDER"
  | "ADMIN_PRODUCT_CREATE"
  | "ADMIN_PRODUCT_DELETE"
  | "ADMIN_PRODUCT_UPDATE"
  | "ADMIN_ORDER_STATUS";

export interface Activity {
  id: string;
  type: ActivityType;
  userOpenid: string | null;
  /** descriptive payload for the feed */
  meta?: Record<string, unknown>;
  createdAt: string; // ISO
}
