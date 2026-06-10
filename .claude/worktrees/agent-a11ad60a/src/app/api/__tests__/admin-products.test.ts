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

import { POST as createProduct } from "@/app/api/v1/admin/products/route";
import {
  PATCH as updateProduct,
  DELETE as deleteProduct,
} from "@/app/api/v1/admin/products/[id]/route";

const BEARER = "Bearer admintoken";

const dbProduct = {
  id: "p1",
  slug: "longjing-tea",
  name_en: "Longjing Tea",
  name_zh: "龙井茶",
  description_en: null,
  description_zh: null,
  price_cents: 4500,
  pack_size_en: null,
  pack_size_zh: null,
  stock_status: "IN_STOCK",
  stock_count: 10,
  is_new: false,
  dietary_tags: "",
  image_url: null,
  category_slug: "pantry-staples",
};

function makeAdminAuth() {
  mockGetUser.mockResolvedValue({ data: { user: { id: "admin1" } }, error: null });
  mockFrom.mockImplementation((table: string) => {
    if (table === "profiles") {
      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: { role: "admin" } })),
          })),
        })),
      };
    }
    return null;
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/v1/admin/products", () => {
  it("creates product and returns 201", async () => {
    makeAdminAuth();
    mockFrom.mockImplementation((table: string) => {
      if (table === "profiles") {
        return { select: vi.fn(() => ({ eq: vi.fn(() => ({ single: vi.fn(() => Promise.resolve({ data: { role: "admin" } })) })) })) };
      }
      if (table === "products") {
        return {
          insert: vi.fn().mockReturnThis(),
          select: vi.fn().mockReturnThis(),
          single: vi.fn(() => Promise.resolve({ data: dbProduct, error: null })),
        };
      }
      return {};
    });

    const req = new Request("http://localhost/api/v1/admin/products", {
      method: "POST",
      headers: { Authorization: BEARER, "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: "longjing-tea",
        nameEn: "Longjing Tea",
        nameZh: "龙井茶",
        price: 4500,
        categorySlug: "pantry-staples",
      }),
    });
    const res = await createProduct(req as Parameters<typeof createProduct>[0]);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.slug).toBe("longjing-tea");
  });
});

describe("PATCH /api/v1/admin/products/[id]", () => {
  it("updates product", async () => {
    makeAdminAuth();
    mockFrom.mockImplementation((table: string) => {
      if (table === "profiles") {
        return { select: vi.fn(() => ({ eq: vi.fn(() => ({ single: vi.fn(() => Promise.resolve({ data: { role: "admin" } })) })) })) };
      }
      if (table === "products") {
        return {
          select: vi.fn().mockReturnThis(),
          update: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn(() => Promise.resolve({ data: { ...dbProduct, stock_count: 20 }, error: null })),
        };
      }
      return {};
    });

    const req = new Request("http://localhost/api/v1/admin/products/p1", {
      method: "PATCH",
      headers: { Authorization: BEARER, "Content-Type": "application/json" },
      body: JSON.stringify({ stockCount: 20 }),
    });
    const res = await updateProduct(req as Parameters<typeof updateProduct>[0], {
      params: Promise.resolve({ id: "p1" }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.stockCount).toBe(20);
  });

  it("returns 404 for unknown product", async () => {
    makeAdminAuth();
    mockFrom.mockImplementation((table: string) => {
      if (table === "profiles") {
        return { select: vi.fn(() => ({ eq: vi.fn(() => ({ single: vi.fn(() => Promise.resolve({ data: { role: "admin" } })) })) })) };
      }
      if (table === "products") {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
        };
      }
      return {};
    });

    const req = new Request("http://localhost/api/v1/admin/products/nope", {
      method: "PATCH",
      headers: { Authorization: BEARER, "Content-Type": "application/json" },
      body: JSON.stringify({ stockCount: 5 }),
    });
    const res = await updateProduct(req as Parameters<typeof updateProduct>[0], {
      params: Promise.resolve({ id: "nope" }),
    });
    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/v1/admin/products/[id]", () => {
  it("returns 204 on success", async () => {
    makeAdminAuth();
    mockFrom.mockImplementation((table: string) => {
      if (table === "profiles") {
        return { select: vi.fn(() => ({ eq: vi.fn(() => ({ single: vi.fn(() => Promise.resolve({ data: { role: "admin" } })) })) })) };
      }
      if (table === "products") {
        return {
          select: vi.fn().mockReturnThis(),
          delete: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn(() => Promise.resolve({ data: { id: "p1" }, error: null })),
          then: (resolve: (v: unknown) => unknown) =>
            Promise.resolve({ data: null, error: null }).then(resolve),
        };
      }
      return {};
    });

    const req = new Request("http://localhost/api/v1/admin/products/p1", {
      method: "DELETE",
      headers: { Authorization: BEARER },
    });
    const res = await deleteProduct(req as Parameters<typeof deleteProduct>[0], {
      params: Promise.resolve({ id: "p1" }),
    });
    expect(res.status).toBe(204);
  });

  it("returns 404 for unknown product", async () => {
    makeAdminAuth();
    mockFrom.mockImplementation((table: string) => {
      if (table === "profiles") {
        return { select: vi.fn(() => ({ eq: vi.fn(() => ({ single: vi.fn(() => Promise.resolve({ data: { role: "admin" } })) })) })) };
      }
      if (table === "products") {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
        };
      }
      return {};
    });

    const req = new Request("http://localhost/api/v1/admin/products/ghost", {
      method: "DELETE",
      headers: { Authorization: BEARER },
    });
    const res = await deleteProduct(req as Parameters<typeof deleteProduct>[0], {
      params: Promise.resolve({ id: "ghost" }),
    });
    expect(res.status).toBe(404);
  });
});
