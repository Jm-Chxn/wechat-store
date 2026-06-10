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

import { GET as adminGetOrders } from "@/app/api/v1/admin/orders/route";
import { PATCH as adminPatchOrder } from "@/app/api/v1/admin/orders/[id]/route";

const BEARER = "Bearer admintoken";

const dbOrder = {
  id: "o1",
  user_id: "user1",
  guest_name: null,
  subtotal_cents: 9000,
  delivery_fee_cents: 0,
  total_cents: 9000,
  status: "PENDING",
  pickup_community_en: "East",
  pickup_community_zh: "东区",
  created_at: "2026-05-19T00:00:00.000Z",
};

function makeAdminAuth() {
  mockGetUser.mockResolvedValue({ data: { user: { id: "admin1" } }, error: null });
}

function makeProfilesMock(role = "admin") {
  return {
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(() => Promise.resolve({ data: { role } })),
      })),
    })),
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/v1/admin/orders", () => {
  it("returns all orders with items", async () => {
    makeAdminAuth();
    mockFrom.mockImplementation((table: string) => {
      if (table === "profiles") return makeProfilesMock();
      if (table === "orders") {
        return {
          select: vi.fn().mockReturnThis(),
          order: vi.fn(() => Promise.resolve({ data: [dbOrder], error: null })),
        };
      }
      if (table === "order_items") {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn(() => Promise.resolve({ data: [], error: null })),
        };
      }
      return {};
    });

    const req = new Request("http://localhost/api/v1/admin/orders", {
      headers: { Authorization: BEARER },
    });
    const res = await adminGetOrders(req as Parameters<typeof adminGetOrders>[0]);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(1);
    expect(body[0].id).toBe("o1");
  });
});

describe("PATCH /api/v1/admin/orders/[id]", () => {
  it("updates order status to CONFIRMED", async () => {
    makeAdminAuth();
    const updated = { ...dbOrder, status: "CONFIRMED" };
    mockFrom.mockImplementation((table: string) => {
      if (table === "profiles") return makeProfilesMock();
      if (table === "orders") {
        return {
          select: vi.fn().mockReturnThis(),
          update: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn(() => Promise.resolve({ data: updated, error: null })),
        };
      }
      if (table === "order_items") {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn(() => Promise.resolve({ data: [], error: null })),
        };
      }
      return {};
    });

    const req = new Request("http://localhost/api/v1/admin/orders/o1", {
      method: "PATCH",
      headers: { Authorization: BEARER, "Content-Type": "application/json" },
      body: JSON.stringify({ status: "CONFIRMED" }),
    });
    const res = await adminPatchOrder(req as Parameters<typeof adminPatchOrder>[0], {
      params: Promise.resolve({ id: "o1" }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("CONFIRMED");
  });

  it("returns 400 for invalid status", async () => {
    makeAdminAuth();
    mockFrom.mockImplementation((table: string) => {
      if (table === "profiles") return makeProfilesMock();
      return {};
    });

    const req = new Request("http://localhost/api/v1/admin/orders/o1", {
      method: "PATCH",
      headers: { Authorization: BEARER, "Content-Type": "application/json" },
      body: JSON.stringify({ status: "INVALID_STATUS" }),
    });
    const res = await adminPatchOrder(req as Parameters<typeof adminPatchOrder>[0], {
      params: Promise.resolve({ id: "o1" }),
    });
    expect(res.status).toBe(400);
  });

  it("returns 404 for unknown order", async () => {
    makeAdminAuth();
    mockFrom.mockImplementation((table: string) => {
      if (table === "profiles") return makeProfilesMock();
      if (table === "orders") {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
        };
      }
      return {};
    });

    const req = new Request("http://localhost/api/v1/admin/orders/ghost", {
      method: "PATCH",
      headers: { Authorization: BEARER, "Content-Type": "application/json" },
      body: JSON.stringify({ status: "CONFIRMED" }),
    });
    const res = await adminPatchOrder(req as Parameters<typeof adminPatchOrder>[0], {
      params: Promise.resolve({ id: "ghost" }),
    });
    expect(res.status).toBe(404);
  });
});
