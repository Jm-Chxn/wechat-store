import { type NextRequest } from "next/server";
import { requireAdmin } from "@/app/api/_lib/auth";
import { createAdminClient } from "@/app/api/_lib/supabase-admin";
import { apiError, ok } from "@/app/api/_lib/response";
import { mapOrder } from "@/app/api/_lib/mappers";

export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  const supabase = createAdminClient();
  const { data: orders, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return apiError(500, error.message);

  const result = await Promise.all(
    (orders ?? []).map(async (order) => {
      const { data: items } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", order.id);
      return mapOrder(order as Record<string, unknown>, (items ?? []) as Record<string, unknown>[]);
    }),
  );

  return ok(result);
}
