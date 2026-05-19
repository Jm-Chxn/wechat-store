import { describe, it, expect, vi, beforeEach } from "vitest";

const mockFrom = vi.fn();
const mockSupabase = { from: mockFrom };

vi.mock("@/app/api/_lib/supabase-admin", () => ({
  createAdminClient: vi.fn(() => mockSupabase),
}));

import { GET as getProducts } from "@/app/api/v1/products/route";
import { GET as getProduct } from "@/app/api/v1/products/[slug]/route";

const dbProduct = {
  id: "p1",
  slug: "longjing-tea",
  name_en: "Longjing Tea",
  name_zh: "龙井茶",
  description_en: "Fragrant green tea.",
  description_zh: "西湖龙井",
  price_cents: 4500,
  pack_size_en: "100g",
  pack_size_zh: "100克",
  stock_status: "IN_STOCK",
  stock_count: 12,
  is_new: true,
  dietary_tags: "VEGAN",
  image_url: "/img/tea.jpg",
  category_slug: "pantry-staples",
};

const wireProduct = {
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
};

function makeChain(result: unknown) {
  const chain = {
    select: vi.fn(() => chain),
    order: vi.fn(() => Promise.resolve({ data: result, error: null })),
    eq: vi.fn(() => chain),
    single: vi.fn(() => Promise.resolve({ data: result, error: null })),
  };
  return chain;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/v1/products", () => {
  it("returns mapped products", async () => {
    const chain = makeChain([dbProduct]);
    mockFrom.mockReturnValue(chain);
    chain.order.mockResolvedValue({ data: [dbProduct], error: null });

    const res = await getProducts();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual([wireProduct]);
  });

  it("returns 500 on db error", async () => {
    const chain = {
      select: vi.fn(() => chain),
      order: vi.fn(() => Promise.resolve({ data: null, error: { message: "db error" } })),
    };
    mockFrom.mockReturnValue(chain);

    const res = await getProducts();
    expect(res.status).toBe(500);
  });
});

describe("GET /api/v1/products/[slug]", () => {
  it("returns product by slug", async () => {
    const chain = {
      select: vi.fn(() => chain),
      eq: vi.fn(() => chain),
      single: vi.fn(() => Promise.resolve({ data: dbProduct, error: null })),
    };
    mockFrom.mockReturnValue(chain);

    const req = new Request("http://localhost/api/v1/products/longjing-tea");
    const res = await getProduct(req, { params: Promise.resolve({ slug: "longjing-tea" }) });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.slug).toBe("longjing-tea");
    expect(body.nameEn).toBe("Longjing Tea");
  });

  it("falls back to id lookup when slug misses", async () => {
    let callCount = 0;
    const chain = {
      select: vi.fn(() => chain),
      eq: vi.fn(() => chain),
      single: vi.fn(() => {
        callCount++;
        if (callCount === 1) return Promise.resolve({ data: null, error: null });
        return Promise.resolve({ data: dbProduct, error: null });
      }),
    };
    mockFrom.mockReturnValue(chain);

    const req = new Request("http://localhost/api/v1/products/p1");
    const res = await getProduct(req, { params: Promise.resolve({ slug: "p1" }) });
    expect(res.status).toBe(200);
    expect(callCount).toBe(2);
  });

  it("returns 404 when not found", async () => {
    const chain = {
      select: vi.fn(() => chain),
      eq: vi.fn(() => chain),
      single: vi.fn(() => Promise.resolve({ data: null, error: null })),
    };
    mockFrom.mockReturnValue(chain);

    const req = new Request("http://localhost/api/v1/products/nope");
    const res = await getProduct(req, { params: Promise.resolve({ slug: "nope" }) });
    expect(res.status).toBe(404);
  });
});
