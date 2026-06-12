import { createAdminClient } from "@/app/api/_lib/supabase-admin";
import { apiError, ok, okCached } from "@/app/api/_lib/response";
import { mapProduct } from "@/app/api/_lib/mappers";
import { withRoute } from "@/app/api/_lib/route-wrapper";

export const GET = withRoute("GET /api/v1/products", async () => {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("products").select("*").order("id");
  if (error) {
    console.error("[GET /api/v1/products] failed:", error);
    return apiError(500, "Internal server error");
  }
  return okCached(data.map(mapProduct), 60);
});
