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

import { POST as trackEvent } from "@/app/api/v1/events/track/route";

const dbActivity = {
  id: "act1",
  type: "page_view",
  user_id: null,
  anon_id: "anon123",
  meta: "{}",
  created_at: "2026-05-19T00:00:00.000Z",
};

function makeInsertChain(result: unknown) {
  const chain = {
    insert: vi.fn(() => chain),
    select: vi.fn(() => chain),
    single: vi.fn(() => Promise.resolve({ data: result, error: null })),
  };
  return chain;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/v1/events/track", () => {
  it("tracks event without auth (anon)", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: { message: "no session" } });
    const chain = makeInsertChain(dbActivity);
    mockFrom.mockImplementation((table: string) => {
      if (table === "profiles") return { select: vi.fn(() => ({ eq: vi.fn(() => ({ single: vi.fn(() => Promise.resolve({ data: null })) })) })) };
      return chain;
    });

    const req = new Request("http://localhost/api/v1/events/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "page_view", anonId: "anon123" }),
    });

    const res = await trackEvent(req as Parameters<typeof trackEvent>[0]);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.type).toBe("page_view");
  });

  it("tracks event with authenticated user", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user1" } }, error: null });
    const activityWithUser = { ...dbActivity, user_id: "user1", anon_id: null };
    const chain = makeInsertChain(activityWithUser);
    mockFrom.mockImplementation((table: string) => {
      if (table === "profiles") {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({ data: { role: "user" } })),
            })),
          })),
        };
      }
      return chain;
    });

    const req = new Request("http://localhost/api/v1/events/track", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer token123",
      },
      body: JSON.stringify({ type: "page_view" }),
    });

    const res = await trackEvent(req as Parameters<typeof trackEvent>[0]);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.userId).toBe("user1");
  });

  it("returns 400 when type is missing", async () => {
    const req = new Request("http://localhost/api/v1/events/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ anonId: "x" }),
    });

    const res = await trackEvent(req as Parameters<typeof trackEvent>[0]);
    expect(res.status).toBe(400);
  });
});
