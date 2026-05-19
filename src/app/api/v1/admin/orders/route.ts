import { type NextRequest } from "next/server";
import { requireAdmin } from "@/app/api/_lib/auth";
import { createAdminClient } from "@/app/api/_lib/supabase-admin";
import { apiError, ok } from "@/app/api/_lib/response";
import { mapOrder } from "@/app/api/_lib/mappers";
import { withRoute } from "@/app/api/_lib/route-wrapper";

interface OrderRow {
  id: string;
  user_id: string | null;
  [k: string]: unknown;
}

/**
 * GET /api/v1/admin/orders — admin-only. Returns every order, newest first,
 * with the buyer's nickname, email, and phone joined in. The phone column
 * lives on `auth.users` (not `profiles`), so we batch-fetch authenticated
 * users via the admin API and merge in memory.
 */
export const GET = withRoute("GET /api/v1/admin/orders", async (request: NextRequest) => {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  const supabase = createAdminClient();
  const { data: orders, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[GET /api/v1/admin/orders] orders select failed:", error);
    return apiError(500, error.message);
  }

  const ordersList = (orders ?? []) as OrderRow[];
  const userIds = Array.from(
    new Set(ordersList.map((o) => o.user_id).filter((v): v is string => !!v)),
  );

  const nicknameByUser = await fetchNicknames(supabase, userIds);
  const authUsers = await fetchAuthUsersByIds(supabase, userIds);

  const result = await Promise.all(
    ordersList.map(async (order) => {
      const { data: items } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", order.id);
      const mapped = mapOrder(
        order as Record<string, unknown>,
        (items ?? []) as Record<string, unknown>[],
      );
      const authUser = order.user_id ? authUsers.get(order.user_id) ?? null : null;
      const nickname =
        order.user_id ? nicknameByUser.get(order.user_id) ?? null : null;
      return {
        ...mapped,
        customerName: nickname,
        customerEmail: authUser?.email ?? null,
        customerPhone: authUser?.phone ?? null,
      };
    }),
  );

  return ok(result);
});

/**
 * Best-effort lookup of `profiles.nickname` for each user id. Returns an
 * empty map (not a thrown error) if the query fails, so the orders list still
 * renders for the admin.
 */
async function fetchNicknames(
  supabase: ReturnType<typeof createAdminClient>,
  userIds: string[],
): Promise<Map<string, string | null>> {
  const out = new Map<string, string | null>();
  if (userIds.length === 0) return out;
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("user_id, nickname")
      .in("user_id", userIds);
    if (error) {
      console.warn("[admin/orders] profile nicknames failed:", error.message);
      return out;
    }
    for (const row of (data ?? []) as Array<{ user_id: string; nickname: string | null }>) {
      out.set(row.user_id, row.nickname);
    }
  } catch (err) {
    console.warn("[admin/orders] profile nicknames threw:", err);
  }
  return out;
}

/**
 * Pull every `auth.users` row in `userIds` so we can render emails and phones
 * in the admin table. The admin API paginates at 1000 rows per page; for a
 * tuangou MVP that's effectively unbounded, so a single page is fine.
 */
async function fetchAuthUsersByIds(
  supabase: ReturnType<typeof createAdminClient>,
  userIds: string[],
): Promise<Map<string, { email: string | null; phone: string | null }>> {
  const out = new Map<string, { email: string | null; phone: string | null }>();
  if (userIds.length === 0) return out;
  try {
    const { data, error } = await supabase.auth.admin.listUsers({ perPage: 1000 });
    if (error) {
      console.warn("[admin/orders] auth.admin.listUsers failed:", error.message);
      return out;
    }
    const wanted = new Set(userIds);
    for (const u of data.users) {
      if (wanted.has(u.id)) {
        out.set(u.id, { email: u.email ?? null, phone: u.phone ?? null });
      }
    }
  } catch (err) {
    console.warn("[admin/orders] auth.admin.listUsers threw:", err);
  }
  return out;
}
