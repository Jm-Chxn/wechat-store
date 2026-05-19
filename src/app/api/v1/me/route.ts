import { type NextRequest } from "next/server";
import { requireAuth } from "@/app/api/_lib/auth";
import { createAdminClient } from "@/app/api/_lib/supabase-admin";
import { apiError, ok } from "@/app/api/_lib/response";

/**
 * GET /api/v1/me
 *
 * Returns the authenticated user's profile (role, nickname, avatarUrl).
 * Uses the service-role client so it bypasses RLS — callers in the browser
 * (AuthProvider) hit this endpoint instead of querying `profiles` directly,
 * which would silently fail whenever a SELECT policy is missing.
 */
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof Response) return authResult;
  const { userId, role } = authResult;

  const supabase = createAdminClient();
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("nickname, avatar_url, role")
    .eq("user_id", userId)
    .single();

  if (error && error.code !== "PGRST116") {
    return apiError(500, error.message);
  }

  return ok({
    userId,
    role: (profile?.role as "admin" | "user" | undefined) ?? role,
    nickname: (profile?.nickname as string | null) ?? null,
    avatarUrl: (profile?.avatar_url as string | null) ?? null,
  });
}
