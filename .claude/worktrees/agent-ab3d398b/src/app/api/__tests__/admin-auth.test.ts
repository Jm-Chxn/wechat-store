/**
 * Verifies that all admin routes return 401 for unauthenticated requests
 * and 403 for authenticated non-admin users.
 */
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

import { GET as adminOrders } from "@/app/api/v1/admin/orders/route";
import { POST as adminCreateProduct } from "@/app/api/v1/admin/products/route";
import { GET as adminUsers } from "@/app/api/v1/admin/users/route";
import { GET as adminActivities } from "@/app/api/v1/admin/activities/route";
import { GET as adminStats } from "@/app/api/v1/admin/stats/route";

function makeProfilesMock(role = "user") {
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

const adminRoutes: Array<{
  name: string;
  call: (req: Request) => Promise<Response>;
}> = [
  {
    name: "GET /admin/orders",
    call: (req) => adminOrders(req as Parameters<typeof adminOrders>[0]),
  },
  {
    name: "POST /admin/products",
    call: (req) => adminCreateProduct(req as Parameters<typeof adminCreateProduct>[0]),
  },
  {
    name: "GET /admin/users",
    call: (req) => adminUsers(req as Parameters<typeof adminUsers>[0]),
  },
  {
    name: "GET /admin/activities",
    call: (req) => adminActivities(req as Parameters<typeof adminActivities>[0]),
  },
  {
    name: "GET /admin/stats",
    call: (req) => adminStats(req as Parameters<typeof adminStats>[0]),
  },
];

describe("Admin routes — unauthenticated (no token)", () => {
  for (const { name, call } of adminRoutes) {
    it(`${name} returns 401`, async () => {
      mockGetUser.mockResolvedValue({ data: { user: null }, error: { message: "no auth" } });
      const req = new Request("http://localhost" + name.split(" ")[1]);
      const res = await call(req);
      expect(res.status).toBe(401);
    });
  }
});

describe("Admin routes — authenticated as regular user", () => {
  for (const { name, call } of adminRoutes) {
    it(`${name} returns 403`, async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: "user1" } }, error: null });
      mockFrom.mockImplementation(() => makeProfilesMock("user"));

      const req = new Request("http://localhost" + name.split(" ")[1], {
        headers: { Authorization: "Bearer usertoken" },
      });
      const res = await call(req);
      expect(res.status).toBe(403);
    });
  }
});
