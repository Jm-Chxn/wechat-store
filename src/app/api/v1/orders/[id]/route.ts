import { type NextRequest } from "next/server";
import { getAuthUser } from "@/app/api/_lib/auth";
import { createAdminClient } from "@/app/api/_lib/supabase-admin";
import { apiError, ok } from "@/app/api/_lib/response";
import { mapOrder } from "@/app/api/_lib/mappers";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const authUser = await getAuthUser(request);
  if (!authUser) return apiError(401, "Unauthorized");

  const supabase = createAdminClient();
  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .single();

  if (!order) return apiError(404, "order not found");

  const orderRecord = order as Record<string, unknown>;

  // Return 404 (not 403) for non-owner non-admin to avoid leaking existence
  if (orderRecord.user_id !== authUser.userId && authUser.role !== "admin") {
    return apiError(404, "order not found");
  }

  const { data: items } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", id);

  return ok(mapOrder(orderRecord, (items ?? []) as Record<string, unknown>[]));
}
