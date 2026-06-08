import { ok, apiError } from "@/app/api/_lib/response";
import { createAdminClient, isAdminConfigured } from "@/app/api/_lib/supabase-admin";
import { withRoute } from "@/app/api/_lib/route-wrapper";

/**
 * GET /api/v1/health — read-only diagnostic. Reports whether the server has
 * everything it needs to actually serve requests. Used by the post-fix smoke
 * test and by the admin UI to render a banner when something is broken.
 */
export const GET = withRoute("GET /api/v1/health", async () => {
  const configured = isAdminConfigured();
  if (!configured) {
    return apiError(
      500,
      "Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL — add to .env.local",
    );
  }

  try {
    const supabase = createAdminClient();
    const t0 = Date.now();
    const { count, error } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true });
    const latencyMs = Date.now() - t0;
    if (error) {
      console.error("[GET /api/v1/health] supabase ping failed:", error);
      return apiError(500, `supabase reachable but query failed: ${error.message}`);
    }
    return ok({
      status: "ok",
      supabase: { reachable: true, latencyMs, productCount: count ?? 0 },
      env: {
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasPublishable: !!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
        hasServiceRole: true,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[GET /api/v1/health] threw:", message);
    return apiError(500, message);
  }
});
