import { createAdminClient } from "@/app/api/_lib/supabase-admin";
import { apiError, ok } from "@/app/api/_lib/response";
import { mapProduct } from "@/app/api/_lib/mappers";

export async function GET() {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("products").select("*").order("id");
  if (error) return apiError(500, error.message);
  return ok(data.map(mapProduct));
}
