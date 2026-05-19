import { type NextRequest } from "next/server";
import { createAdminClient } from "@/app/api/_lib/supabase-admin";
import { getAuthUser } from "@/app/api/_lib/auth";
import { apiError, ok } from "@/app/api/_lib/response";
import { mapActivity } from "@/app/api/_lib/mappers";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body?.type) return apiError(400, "type is required");

  const authUser = await getAuthUser(request);
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("activities")
    .insert({
      type: body.type,
      user_id: authUser?.userId ?? null,
      anon_id: body.anonId ?? null,
      meta: body.meta ? JSON.stringify(body.meta) : "{}",
    })
    .select()
    .single();

  if (error) return apiError(500, error.message);
  return ok(mapActivity(data as Record<string, unknown>));
}
