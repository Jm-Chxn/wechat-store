import { type NextRequest } from "next/server";
import { requireAuth } from "@/app/api/_lib/auth";
import { createAdminClient } from "@/app/api/_lib/supabase-admin";
import { apiError, ok } from "@/app/api/_lib/response";
import { withRoute } from "@/app/api/_lib/route-wrapper";

/**
 * GET /api/v1/me — return the authenticated user's profile (role, nickname,
 * avatarUrl, email, phone). Uses the service-role client so it bypasses RLS,
 * which means callers in the browser don't need a SELECT policy on `profiles`
 * to read their own role.
 */
export const GET = withRoute("GET /api/v1/me", async (request: NextRequest) => {
  const authResult = await requireAuth(request);
  if (authResult instanceof Response) return authResult;
  const { userId, role } = authResult;

  const supabase = createAdminClient();
  const [profileRes, authUserRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("nickname, avatar_url, role")
      .eq("user_id", userId)
      .single(),
    supabase.auth.admin.getUserById(userId),
  ]);

  if (profileRes.error && profileRes.error.code !== "PGRST116") {
    console.error("[GET /api/v1/me] profile select failed:", profileRes.error);
    return apiError(500, profileRes.error.message);
  }

  const profile = profileRes.data;
  const authUser = authUserRes.data?.user;

  return ok({
    userId,
    role: (profile?.role as "admin" | "user" | undefined) ?? role,
    nickname: (profile?.nickname as string | null) ?? null,
    avatarUrl: (profile?.avatar_url as string | null) ?? null,
    email: authUser?.email ?? null,
    phone: authUser?.phone ?? null,
  });
});
