import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetUser = vi.fn();
const mockFrom = vi.fn();
const mockSupabase = {
  auth: { getUser: mockGetUser },
  from: mockFrom,
};

vi.mock("@/app/api/_lib/supabase-admin", () => ({
  createAdminClient: vi.fn(() => mockSupabase),
}));

import { GET as getOrders, POST as placeOrder } from "@/app/api/v1/orders/route";
import { GET as getOrder } from "@/app/api/v1/orders/[id]/route";

const BEARER = "Bearer validtoken";

function setupAuth(userId = "user1", role: "user" | "admin" = "user") {
  mockGetUser.mockResolvedValue({ data: { user: { id: userId } }, error: null });
}

function makeProfilesMock(role = "user") {
  return {
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(() => Promise.resolve({ data: { role } })),
      })),
    })),
  };
}

const dbOrder = {
  id: "o1",
  user_id: "user1",
  guest_name: null,
  subtotal_cents: 9000,
  delivery_fee_cents: 199,
  total_cents: 9199,
  status: "PENDING",
  pickup_community_en: "Riverside",
  pickup_community_zh: "河滨",
  created_at: "2026-05-19T00:00:00.000Z",
};

const dbOrderItem = {
  id: "oi1",
  order_id: "o1",
  product_id: "p1",
  name_en: "Tea",
  name_zh: "茶",
  image_url: null,
  unit_price_cents: 4500,
  quantity: 2,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/v1/orders", () => {
  it("returns 401 without auth", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: { message: "no auth" } });
    const req = new Request("http://localhost/api/v1/orders");
    const res = await getOrders(req as Parameters<typeof getOrders>[0]);
    expect(res.status).toBe(401);
  });

  it("returns user orders", async () => {
    setupAuth();
    mockFrom.mockImplementation((table: string) => {
      if (table === "profiles") return makeProfilesMock();
      if (table === "orders") {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn(() =>
            Promise.resolve({
              data: [{ ...dbOrder, order_items: [dbOrderItem] }],
              error: null,
            }),
          ),
        };
      }
      return {};
    });

    const req = new Request("http://localhost/api/v1/orders", {
      headers: { Authorization: BEARER },
    });
    const res = await getOrders(req as Parameters<typeof getOrders>[0]);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(1);
    expect(body[0].id).toBe("o1");
    expect(body[0].items).toHaveLength(1);
  });
});

describe("POST /api/v1/orders — auth + payload", () => {
  it("returns 401 without an Authorization header", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: { message: "no auth" } });
    const req = new Request("http://localhost/api/v1/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: [{ productId: "p1", quantity: 1 }] }),
    });
    const res = await placeOrder(req as Parameters<typeof placeOrder>[0]);
    expect(res.status).toBe(401);
  });

  it("returns 400 when items contain a missing productId", async () => {
    setupAuth();
    mockFrom.mockImplementation((table: string) =>
      table === "profiles" ? makeProfilesMock() : {},
    );
    const req = new Request("http://localhost/api/v1/orders", {
      method: "POST",
      headers: { Authorization: BEARER, "Content-Type": "application/json" },
      body: JSON.stringify({ items: [{ quantity: 1 }] }),
    });
    const res = await placeOrder(req as Parameters<typeof placeOrder>[0]);
    expect(res.status).toBe(400);
  });

  it("returns 409 listing all missing IDs and removes stale cart items", async () => {
    setupAuth();
    // products lookup returns *only* one of the two requested rows — the
    // other ID is missing. The order route should respond with a helpful
    // 409 and clear the bad line from the user's cart so the next attempt
    // isn't stuck.
    const dbProduct = { id: "p1", price_cents: 1000, name_en: "X", name_zh: "X", image_url: null };
    const cartIn = vi.fn(() => Promise.resolve({ error: null }));
    const cartDelete = vi.fn(() => ({
      eq: vi.fn(() => ({ in: cartIn })),
    }));
    mockFrom.mockImplementation((table: string) => {
      if (table === "profiles") return makeProfilesMock();
      if (table === "products") {
        return {
          select: vi.fn().mockReturnThis(),
          in: vi.fn(() => Promise.resolve({ data: [dbProduct], error: null })),
        };
      }
      if (table === "carts") {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn(() => Promise.resolve({ data: { id: "cart1" }, error: null })),
        };
      }
      if (table === "cart_items") {
        return { delete: cartDelete };
      }
      return {};
    });

    const req = new Request("http://localhost/api/v1/orders", {
      method: "POST",
      headers: { Authorization: BEARER, "Content-Type": "application/json" },
      body: JSON.stringify({
        items: [
          { productId: "p1", quantity: 1 },
          { productId: "p_004", quantity: 2 },
          { productId: "p_999", quantity: 1 },
        ],
      }),
    });
    const res = await placeOrder(req as Parameters<typeof placeOrder>[0]);
    expect(res.status).toBe(409);
    const body = await res.json();
    // Both missing IDs surface in the message — not just the first one.
    expect(body.message).toContain("p_004");
    expect(body.message).toContain("p_999");
    // And they're available structurally so the client can react without
    // string-matching.
    expect(body.fields.missingProductIds.split(",").sort()).toEqual(["p_004", "p_999"]);
    // Stale lines are cleared from the cart for the user.
    expect(cartDelete).toHaveBeenCalledTimes(1);
    expect(cartIn).toHaveBeenCalledWith("product_id", ["p_004", "p_999"]);
  });

  it("clears cart_items for the user after successful order creation", async () => {
    setupAuth();
    const dbProduct = { id: "p1", price_cents: 2000, name_en: "X", name_zh: "X", image_url: null };
    const createdOrder = { ...dbOrder, subtotal_cents: 2000, delivery_fee_cents: 199, total_cents: 2199 };
    const cartDelete = vi.fn(() => ({ eq: vi.fn(() => Promise.resolve({ error: null })) }));
    mockFrom.mockImplementation((table: string) => {
      if (table === "profiles") return makeProfilesMock();
      if (table === "products") {
        return {
          select: vi.fn().mockReturnThis(),
          in: vi.fn(() => Promise.resolve({ data: [dbProduct], error: null })),
        };
      }
      if (table === "orders") {
        return {
          insert: vi.fn().mockReturnThis(),
          select: vi.fn().mockReturnThis(),
          single: vi.fn(() => Promise.resolve({ data: createdOrder, error: null })),
        };
      }
      if (table === "order_items") {
        return {
          insert: vi.fn(() => Promise.resolve({ error: null })),
          select: vi.fn().mockReturnThis(),
          eq: vi.fn(() => Promise.resolve({ data: [dbOrderItem], error: null })),
        };
      }
      if (table === "carts") {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn(() => Promise.resolve({ data: { id: "cart1" }, error: null })),
        };
      }
      if (table === "cart_items") {
        return { delete: cartDelete };
      }
      return {};
    });

    const req = new Request("http://localhost/api/v1/orders", {
      method: "POST",
      headers: { Authorization: BEARER, "Content-Type": "application/json" },
      body: JSON.stringify({ items: [{ productId: "p1", quantity: 1 }] }),
    });
    const res = await placeOrder(req as Parameters<typeof placeOrder>[0]);
    expect(res.status).toBe(201);
    expect(cartDelete).toHaveBeenCalledTimes(1);
  });

  it("Idempotency-Key replays the same order instead of creating a duplicate", async () => {
    setupAuth();
    const dbProduct = { id: "p1", price_cents: 2000, name_en: "X", name_zh: "X", image_url: null };
    const existingOrder = { ...dbOrder, subtotal_cents: 2000, delivery_fee_cents: 199, total_cents: 2199 };
    const orderInsert = vi.fn();
    mockFrom.mockImplementation((table: string) => {
      if (table === "profiles") return makeProfilesMock();
      if (table === "products") {
        return {
          select: vi.fn().mockReturnThis(),
          in: vi.fn(() => Promise.resolve({ data: [dbProduct], error: null })),
        };
      }
      if (table === "orders") {
        return {
          select: vi.fn().mockReturnThis(),
          insert: orderInsert,
          eq: vi.fn().mockReturnThis(),
          single: vi.fn(() => Promise.resolve({ data: existingOrder, error: null })),
        };
      }
      if (table === "order_items") {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn(() => Promise.resolve({ data: [dbOrderItem], error: null })),
        };
      }
      return {};
    });

    const req = new Request("http://localhost/api/v1/orders", {
      method: "POST",
      headers: {
        Authorization: BEARER,
        "Content-Type": "application/json",
        "Idempotency-Key": "client-abc",
      },
      body: JSON.stringify({ items: [{ productId: "p1", quantity: 1 }] }),
    });
    const res = await placeOrder(req as Parameters<typeof placeOrder>[0]);
    expect(res.status).toBe(200);
    expect(orderInsert).not.toHaveBeenCalled();
  });
});

describe("POST /api/v1/orders (delivery fee logic)", () => {
  it("charges delivery fee when subtotal < 5000 cents", async () => {
    setupAuth();
    const dbProduct = { id: "p1", price_cents: 2000, name_en: "Item", name_zh: "商品", image_url: null };
    const createdOrder = {
      ...dbOrder,
      subtotal_cents: 2000,
      delivery_fee_cents: 199,
      total_cents: 2199,
    };

    mockFrom.mockImplementation((table: string) => {
      if (table === "profiles") return makeProfilesMock();
      if (table === "products") {
        return {
          select: vi.fn().mockReturnThis(),
          in: vi.fn(() => Promise.resolve({ data: [dbProduct], error: null })),
        };
      }
      if (table === "orders") {
        return {
          insert: vi.fn().mockReturnThis(),
          select: vi.fn().mockReturnThis(),
          single: vi.fn(() => Promise.resolve({ data: createdOrder, error: null })),
        };
      }
      if (table === "order_items") {
        return {
          insert: vi.fn(() => Promise.resolve({ error: null })),
          select: vi.fn().mockReturnThis(),
          eq: vi.fn(() => Promise.resolve({ data: [dbOrderItem], error: null })),
        };
      }
      if (table === "carts") {
        return { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), single: vi.fn(() => Promise.resolve({ data: null })) };
      }
      return {};
    });

    const req = new Request("http://localhost/api/v1/orders", {
      method: "POST",
      headers: { Authorization: BEARER, "Content-Type": "application/json" },
      body: JSON.stringify({
        items: [{ productId: "p1", quantity: 1 }],
        pickupCommunityEn: "East",
        pickupCommunityZh: "东区",
      }),
    });
    const res = await placeOrder(req as Parameters<typeof placeOrder>[0]);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.deliveryFeeCents).toBe(199);
    expect(body.totalCents).toBe(2199);
  });

  it("waives delivery fee when subtotal >= 5000 cents", async () => {
    setupAuth();
    const dbProduct = { id: "p1", price_cents: 5000, name_en: "Item", name_zh: "商品", image_url: null };
    const createdOrder = {
      ...dbOrder,
      subtotal_cents: 5000,
      delivery_fee_cents: 0,
      total_cents: 5000,
    };

    mockFrom.mockImplementation((table: string) => {
      if (table === "profiles") return makeProfilesMock();
      if (table === "products") {
        return { select: vi.fn().mockReturnThis(), in: vi.fn(() => Promise.resolve({ data: [dbProduct], error: null })) };
      }
      if (table === "orders") {
        return {
          insert: vi.fn().mockReturnThis(),
          select: vi.fn().mockReturnThis(),
          single: vi.fn(() => Promise.resolve({ data: createdOrder, error: null })),
        };
      }
      if (table === "order_items") {
        return {
          insert: vi.fn(() => Promise.resolve({ error: null })),
          select: vi.fn().mockReturnThis(),
          eq: vi.fn(() => Promise.resolve({ data: [], error: null })),
        };
      }
      if (table === "carts") {
        return { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), single: vi.fn(() => Promise.resolve({ data: null })) };
      }
      return {};
    });

    const req = new Request("http://localhost/api/v1/orders", {
      method: "POST",
      headers: { Authorization: BEARER, "Content-Type": "application/json" },
      body: JSON.stringify({
        items: [{ productId: "p1", quantity: 1 }],
        pickupCommunityEn: "East",
        pickupCommunityZh: "东区",
      }),
    });
    const res = await placeOrder(req as Parameters<typeof placeOrder>[0]);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.deliveryFeeCents).toBe(0);
    expect(body.totalCents).toBe(5000);
  });

  it("returns 400 for empty items", async () => {
    setupAuth();
    mockFrom.mockImplementation((table: string) => {
      if (table === "profiles") return makeProfilesMock();
      return {};
    });

    const req = new Request("http://localhost/api/v1/orders", {
      method: "POST",
      headers: { Authorization: BEARER, "Content-Type": "application/json" },
      body: JSON.stringify({ items: [] }),
    });
    const res = await placeOrder(req as Parameters<typeof placeOrder>[0]);
    expect(res.status).toBe(400);
  });
});

describe("GET /api/v1/orders/[id]", () => {
  it("returns order for owner", async () => {
    setupAuth("user1");
    mockFrom.mockImplementation((table: string) => {
      if (table === "profiles") return makeProfilesMock();
      if (table === "orders") {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn(() => Promise.resolve({ data: dbOrder, error: null })),
        };
      }
      if (table === "order_items") {
        return { select: vi.fn().mockReturnThis(), eq: vi.fn(() => Promise.resolve({ data: [dbOrderItem] })) };
      }
      return {};
    });

    const req = new Request("http://localhost/api/v1/orders/o1", {
      headers: { Authorization: BEARER },
    });
    const res = await getOrder(req as Parameters<typeof getOrder>[0], {
      params: Promise.resolve({ id: "o1" }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.id).toBe("o1");
  });

  it("returns 404 (not 403) for non-owner non-admin", async () => {
    setupAuth("user2");
    mockFrom.mockImplementation((table: string) => {
      if (table === "profiles") return makeProfilesMock("user");
      if (table === "orders") {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn(() => Promise.resolve({ data: dbOrder, error: null })),
        };
      }
      return {};
    });

    const req = new Request("http://localhost/api/v1/orders/o1", {
      headers: { Authorization: BEARER },
    });
    const res = await getOrder(req as Parameters<typeof getOrder>[0], {
      params: Promise.resolve({ id: "o1" }),
    });
    expect(res.status).toBe(404);
  });

  it("allows admin to view any order", async () => {
    setupAuth("admin1", "admin");
    mockFrom.mockImplementation((table: string) => {
      if (table === "profiles") return makeProfilesMock("admin");
      if (table === "orders") {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn(() => Promise.resolve({ data: dbOrder, error: null })),
        };
      }
      if (table === "order_items") {
        return { select: vi.fn().mockReturnThis(), eq: vi.fn(() => Promise.resolve({ data: [dbOrderItem] })) };
      }
      return {};
    });

    const req = new Request("http://localhost/api/v1/orders/o1", {
      headers: { Authorization: BEARER },
    });
    const res = await getOrder(req as Parameters<typeof getOrder>[0], {
      params: Promise.resolve({ id: "o1" }),
    });
    expect(res.status).toBe(200);
  });
});
