import { type NextRequest } from "next/server";
import { requireAdmin } from "@/app/api/_lib/auth";
import { createAdminClient } from "@/app/api/_lib/supabase-admin";
import { apiError, ok } from "@/app/api/_lib/response";
import { mapUserSummary } from "@/app/api/_lib/mappers";

export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  const supabase = createAdminClient();

  // Fetch profiles
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("*")
    .order("last_seen_at", { ascending: false, nullsFirst: false });

  if (profilesError) return apiError(500, profilesError.message);

  // Fetch order aggregates per user
  const { data: orderAggs } = await supabase
    .from("orders")
    .select("user_id, total_cents");

  // Fetch activity counts per user
  const { data: activityRows } = await supabase
    .from("activities")
    .select("user_id");

  // Aggregate in TypeScript
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

  const result = (profiles ?? []).map((profile) => {
    const uid = profile.user_id as string;
    const orders = orderByUser.get(uid) ?? { count: 0, totalCents: 0 };
    const activityCount = activityByUser.get(uid) ?? 0;
    return mapUserSummary(
      profile as Record<string, unknown>,
      orders.count,
      activityCount,
      orders.totalCents,
    );
  });

  return ok(result);
}
