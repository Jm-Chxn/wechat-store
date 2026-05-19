import { createAdminClient } from "@/app/api/_lib/supabase-admin";
import { apiError, ok } from "@/app/api/_lib/response";
import { mapProduct } from "@/app/api/_lib/mappers";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const supabase = createAdminClient();

  let { data } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!data) {
    ({ data } = await supabase
      .from("products")
      .select("*")
      .eq("id", slug)
      .single());
  }

  if (!data) return apiError(404, "product not found");
  return ok(mapProduct(data as Record<string, unknown>));
}
