import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetUser = vi.fn();
const mockFrom = vi.fn();
const mockSupabase = {
  auth: { getUser: mockGetUser },
  from: mockFrom,
};

vi.mock("@/app/api/_lib/supabase-admin", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/app/api/_lib/supabase-admin")>();
  return {
    ...actual,
    createAdminClient: vi.fn(() => mockSupabase),
  };
});

import { GET as getCart } from "@/app/api/v1/cart/route";
import { POST as addItem } from "@/app/api/v1/cart/items/route";
import { PATCH as patchItem, DELETE as deleteItem } from "@/app/api/v1/cart/items/[id]/route";
import { POST as mergeCart } from "@/app/api/v1/cart/merge/route";

const BEARER = "Bearer validtoken";

function setupAuth(userId = "user1", role = "user") {
  mockGetUser.mockResolvedValue({ data: { user: { id: userId } }, error: null });
  mockFrom.mockImplementation((table: string) => {
    if (table === "profiles") {
      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: { role } })),
          })),
        })),
      };
    }
    return null;
  });
}

const dbCart = { id: "cart1", user_id: "user1" };
const dbItem = {
  id: "ci1",
  cart_id: "cart1",
  product_id: "p1",
  quantity: 2,
  products: { name_en: "Tea", name_zh: "茶", price_cents: 4500, image_url: null },
};

function makeCartTable() {
  return {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(() => Promise.resolve({ data: dbCart, error: null })),
    then: (resolve: (v: unknown) => unknown) =>
      Promise.resolve({ data: dbCart, error: null }).then(resolve),
  };
}

function makeItemsTable(items = [dbItem]) {
  return {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(() => Promise.resolve({ data: null, error: null })),
    then: (resolve: (v: unknown) => unknown) =>
      Promise.resolve({ data: items, error: null }).then(resolve),
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/v1/cart", () => {
  it("returns 401 without auth", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: { message: "no auth" } });
    // getAuthUser needs at least the Bearer prefix present
    const req = new Request("http://localhost/api/v1/cart");
    const res = await getCart(req as Parameters<typeof getCart>[0]);
    expect(res.status).toBe(401);
  });

  it("returns existing cart with items", async () => {
    setupAuth();
    mockFrom.mockImplementation((table: string) => {
      if (table === "profiles") {
        return {
          select: vi.fn(() => ({ eq: vi.fn(() => ({ single: vi.fn(() => Promise.resolve({ data: { role: "user" } })) })) })),
        };
      }
      if (table === "carts") return makeCartTable();
      if (table === "cart_items") return makeItemsTable();
      return {};
    });

    const req = new Request("http://localhost/api/v1/cart", {
      headers: { Authorization: BEARER },
    });
    const res = await getCart(req as Parameters<typeof getCart>[0]);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.cartId).toBe("cart1");
    expect(body.items).toHaveLength(1);
    expect(body.subtotalCents).toBe(9000); // 4500 * 2
  });

  it("creates cart if none exists", async () => {
    setupAuth();
    let cartCreated = false;
    mockFrom.mockImplementation((table: string) => {
      if (table === "profiles") {
        return {
          select: vi.fn(() => ({ eq: vi.fn(() => ({ single: vi.fn(() => Promise.resolve({ data: { role: "user" } })) })) })),
        };
      }
      if (table === "carts") {
        return {
          select: vi.fn().mockReturnThis(),
          upsert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnThis(),
            single: vi.fn(() => Promise.resolve({ data: dbCart, error: null })),
          }),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn(() => Promise.resolve({ data: dbCart, error: null })),
          then: (resolve: (v: unknown) => unknown) =>
            Promise.resolve({ data: dbCart, error: null }).then(resolve),
        };
      }
      if (table === "cart_items") return makeItemsTable([]);
      return {};
    });

    const req = new Request("http://localhost/api/v1/cart", {
      headers: { Authorization: BEARER },
    });
    const res = await getCart(req as Parameters<typeof getCart>[0]);
    expect(res.status).toBe(200);
  });
});

describe("POST /api/v1/cart/items", () => {
  it("returns 400 for missing productId", async () => {
    setupAuth();
    mockFrom.mockImplementation((table: string) => {
      if (table === "profiles") {
        return { select: vi.fn(() => ({ eq: vi.fn(() => ({ single: vi.fn(() => Promise.resolve({ data: { role: "user" } })) })) })) };
      }
      return {};
    });

    const req = new Request("http://localhost/api/v1/cart/items", {
      method: "POST",
      headers: { Authorization: BEARER, "Content-Type": "application/json" },
      body: JSON.stringify({ quantity: 1 }),
    });
    const res = await addItem(req as Parameters<typeof addItem>[0]);
    expect(res.status).toBe(400);
  });

  it("adds new item and returns cart", async () => {
    setupAuth();
    mockFrom.mockImplementation((table: string) => {
      if (table === "profiles") {
        return { select: vi.fn(() => ({ eq: vi.fn(() => ({ single: vi.fn(() => Promise.resolve({ data: { role: "user" } })) })) })) };
      }
      if (table === "products") {
        return { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), single: vi.fn(() => Promise.resolve({ data: { id: "p1" }, error: null })) };
      }
      if (table === "carts") return makeCartTable();
      if (table === "cart_items") {
        return {
          select: vi.fn().mockReturnThis(),
          insert: vi.fn(() => Promise.resolve({ error: null })),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
          then: (resolve: (v: unknown) => unknown) => Promise.resolve({ data: [dbItem], error: null }).then(resolve),
        };
      }
      return {};
    });

    const req = new Request("http://localhost/api/v1/cart/items", {
      method: "POST",
      headers: { Authorization: BEARER, "Content-Type": "application/json" },
      body: JSON.stringify({ productId: "p1", quantity: 2 }),
    });
    const res = await addItem(req as Parameters<typeof addItem>[0]);
    expect(res.status).toBe(200);
  });
});

describe("PATCH /api/v1/cart/items/[id]", () => {
  it("returns 400 for negative quantity", async () => {
    setupAuth();
    mockFrom.mockImplementation((table: string) => {
      if (table === "profiles") {
        return { select: vi.fn(() => ({ eq: vi.fn(() => ({ single: vi.fn(() => Promise.resolve({ data: { role: "user" } })) })) })) };
      }
      return {};
    });

    const req = new Request("http://localhost/api/v1/cart/items/ci1", {
      method: "PATCH",
      headers: { Authorization: BEARER, "Content-Type": "application/json" },
      body: JSON.stringify({ quantity: -1 }),
    });
    const res = await patchItem(req as Parameters<typeof patchItem>[0], {
      params: Promise.resolve({ id: "ci1" }),
    });
    expect(res.status).toBe(400);
  });

  it("deletes item when quantity is 0", async () => {
    setupAuth();
    const existingItem = { id: "ci1", cart_id: "cart1", product_id: "p1", quantity: 2, carts: { user_id: "user1" } };
    mockFrom.mockImplementation((table: string) => {
      if (table === "profiles") {
        return { select: vi.fn(() => ({ eq: vi.fn(() => ({ single: vi.fn(() => Promise.resolve({ data: { role: "user" } })) })) })) };
      }
      if (table === "cart_items") {
        return {
          select: vi.fn().mockReturnThis(),
          delete: vi.fn().mockReturnThis(),
          update: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn(() => Promise.resolve({ data: existingItem, error: null })),
          then: (resolve: (v: unknown) => unknown) => Promise.resolve({ data: [], error: null }).then(resolve),
        };
      }
      if (table === "carts") return makeCartTable();
      return {};
    });

    const req = new Request("http://localhost/api/v1/cart/items/ci1", {
      method: "PATCH",
      headers: { Authorization: BEARER, "Content-Type": "application/json" },
      body: JSON.stringify({ quantity: 0 }),
    });
    const res = await patchItem(req as Parameters<typeof patchItem>[0], {
      params: Promise.resolve({ id: "ci1" }),
    });
    expect(res.status).toBe(200);
  });
});

describe("DELETE /api/v1/cart/items/[id]", () => {
  it("removes item and returns updated cart", async () => {
    setupAuth();
    const existingItem = { id: "ci1", cart_id: "cart1", product_id: "p1", quantity: 1, carts: { user_id: "user1" } };
    mockFrom.mockImplementation((table: string) => {
      if (table === "profiles") {
        return { select: vi.fn(() => ({ eq: vi.fn(() => ({ single: vi.fn(() => Promise.resolve({ data: { role: "user" } })) })) })) };
      }
      if (table === "cart_items") {
        return {
          select: vi.fn().mockReturnThis(),
          delete: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn(() => Promise.resolve({ data: existingItem, error: null })),
          then: (resolve: (v: unknown) => unknown) => Promise.resolve({ data: [], error: null }).then(resolve),
        };
      }
      if (table === "carts") return makeCartTable();
      return {};
    });

    const req = new Request("http://localhost/api/v1/cart/items/ci1", {
      method: "DELETE",
      headers: { Authorization: BEARER },
    });
    const res = await deleteItem(req as Parameters<typeof deleteItem>[0], {
      params: Promise.resolve({ id: "ci1" }),
    });
    expect(res.status).toBe(200);
  });

  it("returns 404 for item not owned by user", async () => {
    setupAuth("user2");
    const existingItem = { id: "ci1", cart_id: "cart1", carts: { user_id: "user1" } };
    mockFrom.mockImplementation((table: string) => {
      if (table === "profiles") {
        return { select: vi.fn(() => ({ eq: vi.fn(() => ({ single: vi.fn(() => Promise.resolve({ data: { role: "user" } })) })) })) };
      }
      if (table === "cart_items") {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn(() => Promise.resolve({ data: existingItem, error: null })),
        };
      }
      return {};
    });

    const req = new Request("http://localhost/api/v1/cart/items/ci1", {
      method: "DELETE",
      headers: { Authorization: BEARER },
    });
    const res = await deleteItem(req as Parameters<typeof deleteItem>[0], {
      params: Promise.resolve({ id: "ci1" }),
    });
    expect(res.status).toBe(404);
  });
});

describe("POST /api/v1/cart/merge", () => {
  it("merges guest items into user cart", async () => {
    setupAuth();
    mockFrom.mockImplementation((table: string) => {
      if (table === "profiles") {
        return { select: vi.fn(() => ({ eq: vi.fn(() => ({ single: vi.fn(() => Promise.resolve({ data: { role: "user" } })) })) })) };
      }
      if (table === "carts") return makeCartTable();
      if (table === "cart_items") {
        return {
          select: vi.fn().mockReturnThis(),
          insert: vi.fn(() => Promise.resolve({ error: null })),
          update: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
          then: (resolve: (v: unknown) => unknown) => Promise.resolve({ data: [dbItem], error: null }).then(resolve),
        };
      }
      return {};
    });

    const req = new Request("http://localhost/api/v1/cart/merge", {
      method: "POST",
      headers: { Authorization: BEARER, "Content-Type": "application/json" },
      body: JSON.stringify({ items: [{ productId: "p1", quantity: 1 }] }),
    });
    const res = await mergeCart(req as Parameters<typeof mergeCart>[0]);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.cartId).toBe("cart1");
  });
});
