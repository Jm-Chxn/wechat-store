/**
 * The /api/v1/health endpoint is the diagnostic that flipped the order-500
 * incident from "fix unknown" to "service role key missing" — make sure it
 * keeps reporting both the success and the missing-env failure modes.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockFrom = vi.fn();
const mockSupabase = { from: mockFrom };

vi.mock("@/app/api/_lib/supabase-admin", async () => {
  const actual =
    await vi.importActual<typeof import("@/app/api/_lib/supabase-admin")>(
      "@/app/api/_lib/supabase-admin",
    );
  return {
    ...actual,
    createAdminClient: vi.fn(() => mockSupabase),
    isAdminConfigured: vi.fn(),
  };
});

import { GET as health } from "@/app/api/v1/health/route";
import { isAdminConfigured } from "@/app/api/_lib/supabase-admin";

const originalEnv = { ...process.env };

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  process.env = { ...originalEnv };
});

describe("GET /api/v1/health", () => {
  it("returns 500 with a clear message when SUPABASE_SERVICE_ROLE_KEY is missing", async () => {
    vi.mocked(isAdminConfigured).mockReturnValue(false);
    const req = new Request("http://localhost/api/v1/health");
    const res = await health(req as Parameters<typeof health>[0]);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.message).toMatch(/SUPABASE_SERVICE_ROLE_KEY/);
  });

  it("returns 200 with product count when configured", async () => {
    vi.mocked(isAdminConfigured).mockReturnValue(true);
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://x.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "pub";
    mockFrom.mockReturnValue({
      select: vi.fn(() => Promise.resolve({ count: 36, error: null })),
    });
    const req = new Request("http://localhost/api/v1/health");
    const res = await health(req as Parameters<typeof health>[0]);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("ok");
    expect(body.supabase.productCount).toBe(36);
  });
});
