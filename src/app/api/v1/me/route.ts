import { type NextRequest } from "next/server";
import { requireAuth } from "@/app/api/_lib/auth";
import { createAdminClient } from "@/app/api/_lib/supabase-admin";
import { apiError, ok } from "@/app/api/_lib/response";
import { withRoute } from "@/app/api/_lib/route-wrapper";

/**
 * GET /api/v1/me — return the authenticated user's profile (role, nickname,
 * avatarUrl, email, phone, fullName, wechatId). Uses the service-role client.
 */
export const GET = withRoute("GET /api/v1/me", async (request: NextRequest) => {
  const authResult = await requireAuth(request);
  if (authResult instanceof Response) return authResult;
  const { userId, role } = authResult;

  const supabase = createAdminClient();
  const [profileRes, authUserRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("nickname, avatar_url, role, full_name, wechat_id, phone")
      .eq("user_id", userId)
      .single(),
    supabase.auth.admin.getUserById(userId),
  ]);

  if (profileRes.error && profileRes.error.code !== "PGRST116") {
    console.error("[GET /api/v1/me] profile select failed:", profileRes.error);
    return apiError(500, "Internal server error");
  }

  const profile = profileRes.data;
  const authUser = authUserRes.data?.user;
  const meta = authUser?.user_metadata as Record<string, unknown> | undefined;

  return ok({
    userId,
    role: (profile?.role as "admin" | "user" | undefined) ?? role,
    nickname: (profile?.nickname as string | null) ?? null,
    avatarUrl: (profile?.avatar_url as string | null) ?? null,
    fullName:
      (profile?.full_name as string | null) ??
      (typeof meta?.full_name === "string" ? meta.full_name : null),
    wechatId:
      (profile?.wechat_id as string | null) ??
      (typeof meta?.wechat_id === "string" ? meta.wechat_id : null),
    email: authUser?.email ?? null,
    phone: (profile?.phone as string | null) ?? authUser?.phone ?? null,
  });
});

/**
 * PATCH /api/v1/me — update profile (full_name, wechat_id, phone) and/or auth data.
 */
export const PATCH = withRoute("PATCH /api/v1/me", async (request: NextRequest) => {
  const authResult = await requireAuth(request);
  if (authResult instanceof Response) return authResult;
  const { userId } = authResult;

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return apiError(400, "Invalid JSON body");
  }

  const supabase = createAdminClient();

  if (
    body.fullName !== undefined ||
    body.wechatId !== undefined ||
    body.nickname !== undefined ||
    body.phone !== undefined
  ) {
    const upsert: Record<string, unknown> = { user_id: userId };
    if (body.fullName !== undefined) upsert.full_name = body.fullName;
    if (body.wechatId !== undefined) upsert.wechat_id = body.wechatId;
    if (body.nickname !== undefined) upsert.nickname = body.nickname;
    if (body.phone !== undefined) upsert.phone = body.phone;

    const { error } = await supabase.from("profiles").upsert(upsert, {
      onConflict: "user_id",
    });
    if (error) {
      console.error("[PATCH /api/v1/me] profile upsert failed:", error);
      return apiError(500, "Internal server error");
    }
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("nickname, avatar_url, role, full_name, wechat_id, phone")
    .eq("user_id", userId)
    .single();

  const { data: authUserRes } = await supabase.auth.admin.getUserById(userId);
  const authUser = authUserRes.user;

  return ok({
    userId,
    role: (profile?.role as "admin" | "user" | undefined) ?? "user",
    nickname: (profile?.nickname as string | null) ?? null,
    avatarUrl: (profile?.avatar_url as string | null) ?? null,
    fullName: (profile?.full_name as string | null) ?? null,
    wechatId: (profile?.wechat_id as string | null) ?? null,
    email: authUser?.email ?? null,
    phone: (profile?.phone as string | null) ?? authUser?.phone ?? null,
  });
});
