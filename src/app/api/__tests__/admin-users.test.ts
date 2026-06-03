/**
 * Verifies /api/v1/admin/users joins `profiles` with `auth.users` (via the
 * service-role `auth.admin.listUsers` API) so the admin UI sees emails and
 * phone numbers, not just nicknames.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetUser = vi.fn();
const mockListUsers = vi.fn();
const mockFrom = vi.fn();
const mockSupabase = {
  auth: {
    getUser: mockGetUser,
    admin: { listUsers: mockListUsers },
  },
  from: mockFrom,
};

vi.mock("@/app/api/_lib/supabase-admin", () => ({
  createAdminClient: vi.fn(() => mockSupabase),
}));

import { GET as adminUsers } from "@/app/api/v1/admin/users/route";

const BEARER = "Bearer admintoken";

const profile = {
  user_id: "u1",
  nickname: "Auntie Mei",
  avatar_url: "https://example.com/a.png",
  role: "user",
  created_at: "2026-05-01T00:00:00.000Z",
  last_seen_at: "2026-05-19T00:00:00.000Z",
};

function makeProfilesRoleMock(role = "admin") {
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

describe("GET /api/v1/admin/users", () => {
  it("joins phone/email from auth.users and aggregates orders + activities", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "admin1" } }, error: null });
    mockListUsers.mockResolvedValue({
      data: {
        users: [
          {
            id: "u1",
            email: "mei@x.com",
            phone: "+15551234567",
            created_at: "2026-04-01T00:00:00.000Z",
            last_sign_in_at: "2026-05-19T12:00:00.000Z",
          },
        ],
      },
      error: null,
    });

    // mockFrom is called multiple times; track which call it is so we can
    // distinguish the role lookup (single) from the bulk profiles lookup (order).
    let profilesCall = 0;
    mockFrom.mockImplementation((table: string) => {
      if (table === "profiles") {
        profilesCall++;
        if (profilesCall === 1) return makeProfilesRoleMock("admin");
        // bulk SELECT * .range .order
        return {
          select: vi.fn().mockReturnThis(),
          range: vi.fn().mockReturnThis(),
          order: vi.fn(() => Promise.resolve({ data: [profile], error: null })),
        };
      }
      if (table === "orders") {
        return {
          select: vi.fn(() =>
            Promise.resolve({ data: [{ user_id: "u1", total_cents: 4500 }], error: null }),
          ),
        };
      }
      if (table === "activities") {
        return {
          select: vi.fn(() =>
            Promise.resolve({ data: [{ user_id: "u1" }, { user_id: "u1" }], error: null }),
          ),
        };
      }
      return {};
    });

    const req = new Request("http://localhost/api/v1/admin/users", {
      headers: { Authorization: BEARER },
    });
    const res = await adminUsers(req as Parameters<typeof adminUsers>[0]);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(1);
    expect(body[0]).toMatchObject({
      userId: "u1",
      nickname: "Auntie Mei",
      email: "mei@x.com",
      phone: "+15551234567",
      orderCount: 1,
      totalSpentCents: 4500,
      activityCount: 2,
    });
  });
});
