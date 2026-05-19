import { type NextRequest } from "next/server";
import { requireAdmin } from "@/app/api/_lib/auth";
import { createAdminClient } from "@/app/api/_lib/supabase-admin";
import { apiError, ok } from "@/app/api/_lib/response";
import { mapOrder } from "@/app/api/_lib/mappers";

const VALID_STATUSES = ["CONFIRMED", "PROCESSING", "COMPLETED", "CANCELLED"] as const;

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  const body = await request.json().catch(() => null);
  if (!body?.status) return apiError(400, "status is required");
  if (!VALID_STATUSES.includes(body.status)) {
    return apiError(400, `status must be one of: ${VALID_STATUSES.join(", ")}`);
  }

  const supabase = createAdminClient();

  const { data: existing } = await supabase
    .from("orders")
    .select("id")
    .eq("id", id)
    .single();
  if (!existing) return apiError(404, "order not found");

  const { data: order, error } = await supabase
    .from("orders")
    .update({ status: body.status })
    .eq("id", id)
    .select()
    .single();

  if (error) return apiError(500, error.message);

  const { data: items } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", id);

  return ok(mapOrder(order as Record<string, unknown>, (items ?? []) as Record<string, unknown>[]));
}
