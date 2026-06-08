import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser-side Supabase client. Uses the publishable (sb_publishable_...) anon key
 * which is safe to expose. Auth state is persisted automatically through the
 * cookies set by `@supabase/ssr` and refreshed by the middleware in `middleware.ts`.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
