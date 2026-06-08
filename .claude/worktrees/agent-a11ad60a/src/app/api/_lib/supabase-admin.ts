import { createClient } from "@supabase/supabase-js";

/**
 * Thrown when the server-side Supabase environment variables are missing.
 * Distinguished from generic Errors so the route wrapper can produce a
 * helpful diagnostic message in the response body.
 */
export class MissingSupabaseConfigError extends Error {
  constructor(public readonly missing: string[]) {
    super(
      `Supabase server config missing: ${missing.join(", ")}. ` +
        `Set these in .env.local and restart the dev server.`,
    );
    this.name = "MissingSupabaseConfigError";
  }
}

/**
 * Returns a Supabase client authenticated with the service role key. Bypasses
 * RLS — use only on the server, never in a browser bundle.
 *
 * If either the URL or the service-role key is missing, throws a
 * `MissingSupabaseConfigError` with the exact names of the missing variables
 * so the dev terminal shows a one-line fix instead of supabase-js's generic
 * "supabaseKey is required".
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const missing: string[] = [];
  if (!url) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!key) missing.push("SUPABASE_SERVICE_ROLE_KEY");
  if (missing.length > 0) throw new MissingSupabaseConfigError(missing);
  return createClient(url!, key!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/**
 * Returns true iff the env required by `createAdminClient` is present.
 * Used by the diagnostic endpoint at /api/v1/health.
 */
export function isAdminConfigured() {
  return !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
}
