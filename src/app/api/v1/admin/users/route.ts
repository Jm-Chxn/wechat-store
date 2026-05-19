import { type NextRequest } from "next/server";
import { requireAdmin } from "@/app/api/_lib/auth";
import { createAdminClient } from "@/app/api/_lib/supabase-admin";
import { apiError, ok } from "@/app/api/_lib/response";
import { withRoute } from "@/app/api/_lib/route-wrapper";

interface ProfileRow {
  user_id: string;
  nickname: string | null;
  avatar_url: string | null;
  role: "user" | "admin";
  created_at: string | null;
  last_seen_at: string | null;
}

/**
 * GET /api/v1/admin/users — admin-only.
 *
 * Returns one row per user with:
 *   - identity (user_id, nickname, role, avatar, joinedAt)
 *   - contact (email, phone) joined from `auth.users` via the admin API
 *   - aggregates (orderCount, totalSpentCents, activityCount)
 *
 * `auth.users` is hidden from the public schema, so the join requires the
 * service-role key. Without it this endpoint returns names only; with it
 * we can show phone numbers in the admin UI.
 */
export const GET = withRoute("GET /api/v1/admin/users", async (request: NextRequest) => {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  const supabase = createAdminClient();

  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("user_id, nickname, avatar_url, role, created_at, last_seen_at")
    .order("last_seen_at", { ascending: false, nullsFirst: false });

  if (profilesError) {
    console.error("[GET /api/v1/admin/users] profiles failed:", profilesError);
    return apiError(500, profilesError.message);
  }

  const [{ data: orderAggs }, { data: activityRows }, authUsers] = await Promise.all([
    supabase.from("orders").select("user_id, total_cents"),
    supabase.from("activities").select("user_id"),
    fetchAllAuthUsers(supabase),
  ]);

  const orderByUser = new Map<string, { count: number; totalCents: number }>();
  for (const row of orderAggs ?? []) {
    if (!row.user_id) continue;
    const entry = orderByUser.get(row.user_id) ?? { count: 0, totalCents: 0 };
    entry.count += 1;
    entry.totalCents += row.total_cents ?? 0;
    orderByUser.set(row.user_id, entry);
  }

  const activityByUser = new Map<string, number>();
  for (const row of activityRows ?? []) {
    if (!row.user_id) continue;
    activityByUser.set(row.user_id, (activityByUser.get(row.user_id) ?? 0) + 1);
  }

  const result = ((profiles ?? []) as ProfileRow[]).map((profile) => {
    const orders = orderByUser.get(profile.user_id) ?? { count: 0, totalCents: 0 };
    const auth = authUsers.get(profile.user_id);
    return {
      userId: profile.user_id,
      nickname: profile.nickname,
      avatarUrl: profile.avatar_url,
      role: profile.role,
      email: auth?.email ?? null,
      phone: auth?.phone ?? null,
      createdAt: profile.created_at ?? auth?.createdAt ?? null,
      lastSeenAt: profile.last_seen_at ?? auth?.lastSignInAt ?? null,
      orderCount: orders.count,
      totalSpentCents: orders.totalCents,
      activityCount: activityByUser.get(profile.user_id) ?? 0,
    };
  });

  // Include auth-only users (signed up but no profile row yet — should be
  // rare since the trigger backfills, but defensive).
  const seen = new Set(result.map((r) => r.userId));
  for (const [id, auth] of authUsers) {
    if (seen.has(id)) continue;
    result.push({
      userId: id,
      nickname: null,
      avatarUrl: null,
      role: "user",
      email: auth.email,
      phone: auth.phone,
      createdAt: auth.createdAt,
      lastSeenAt: auth.lastSignInAt,
      orderCount: 0,
      totalSpentCents: 0,
      activityCount: 0,
    });
  }

  return ok(result);
});

interface AuthSnapshot {
  email: string | null;
  phone: string | null;
  createdAt: string | null;
  lastSignInAt: string | null;
}

async function fetchAllAuthUsers(
  supabase: ReturnType<typeof createAdminClient>,
): Promise<Map<string, AuthSnapshot>> {
  const out = new Map<string, AuthSnapshot>();
  try {
    const { data, error } = await supabase.auth.admin.listUsers({ perPage: 1000 });
    if (error) {
      console.warn("[admin/users] auth.admin.listUsers failed:", error.message);
      return out;
    }
    for (const u of data.users) {
      out.set(u.id, {
        email: u.email ?? null,
        phone: u.phone ?? null,
        createdAt: u.created_at ?? null,
        lastSignInAt: u.last_sign_in_at ?? null,
      });
    }
  } catch (err) {
    console.warn("[admin/users] auth.admin.listUsers threw:", err);
  }
  return out;
}
