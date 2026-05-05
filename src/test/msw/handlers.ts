import { http, HttpResponse } from "msw";

const BASE = "http://localhost:8080/api/v1";

export const fixtures = {
  product: {
    id: "p1",
    slug: "longjing-tea",
    nameEn: "Longjing Tea",
    nameZh: "龙井茶",
    descriptionEn: "Fragrant green tea.",
    descriptionZh: "西湖龙井",
    price: 4500,
    packSizeEn: "100g",
    packSizeZh: "100克",
    stockStatus: "IN_STOCK",
    stockCount: 12,
    isNew: true,
    dietaryTags: ["VEGAN"],
    imageUrl: "/img/tea.jpg",
    categorySlug: "pantry-staples",
  },
  order: {
    id: "o1",
    userId: "u1",
    guestName: null,
    subtotalCents: 9000,
    deliveryFeeCents: 500,
    totalCents: 9500,
    status: "PENDING",
    pickupCommunityEn: "Riverside",
    pickupCommunityZh: "河滨",
    createdAt: new Date().toISOString(),
    items: [
      {
        productId: "p1",
        nameEn: "Longjing Tea",
        nameZh: "龙井茶",
        imageUrl: "/img/tea.jpg",
        unitPriceCents: 4500,
        quantity: 2,
      },
    ],
  },
  cart: {
    cartId: "c1",
    items: [{ id: "ci1", productId: "p1", quantity: 1 }],
    subtotalCents: 4500,
  },
};

export const handlers = [
  http.get(`${BASE}/products`, () => HttpResponse.json([fixtures.product])),
  http.get(`${BASE}/products/:slug`, () => HttpResponse.json(fixtures.product)),
  http.get(`${BASE}/categories`, () => HttpResponse.json([])),
  http.get(`${BASE}/cart`, () => HttpResponse.json(fixtures.cart)),
  http.post(`${BASE}/cart/items`, () => HttpResponse.json(fixtures.cart)),
  http.patch(`${BASE}/cart/items/:id`, () => HttpResponse.json(fixtures.cart)),
  http.delete(`${BASE}/cart/items/:id`, () => HttpResponse.json(fixtures.cart)),
  http.post(`${BASE}/cart/merge`, () => HttpResponse.json(fixtures.cart)),
  http.post(`${BASE}/orders`, () => HttpResponse.json(fixtures.order)),
  http.get(`${BASE}/orders`, () => HttpResponse.json([fixtures.order])),
  http.get(`${BASE}/orders/:id`, () => HttpResponse.json(fixtures.order)),
  http.post(`${BASE}/events/track`, () => HttpResponse.json({ ok: true })),
  http.get(`${BASE}/admin/activities`, () => HttpResponse.json([])),
  http.get(`${BASE}/admin/users`, () => HttpResponse.json([])),
  http.get(`${BASE}/admin/orders`, () => HttpResponse.json([fixtures.order])),
  http.patch(`${BASE}/admin/orders/:id`, () =>
    HttpResponse.json({ ...fixtures.order, status: "FULFILLED" }),
  ),
  http.get(`${BASE}/admin/stats`, () =>
    HttpResponse.json({
      totalUsers: 1,
      ordersToday: 1,
      revenueTodayCents: 9500,
      topCategorySlug: "pantry-staples",
      ordersLast7d: [],
      revenueByCategory: [],
    }),
  ),
  http.post(`${BASE}/admin/products`, () => HttpResponse.json(fixtures.product)),
  http.patch(`${BASE}/admin/products/:id`, () => HttpResponse.json(fixtures.product)),
  http.delete(`${BASE}/admin/products/:id`, () => HttpResponse.json({ ok: true })),
];
