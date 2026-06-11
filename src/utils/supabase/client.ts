import { createBrowserClient } from "@supabase/ssr";
import { env } from "@/lib/env";

/**
 * Browser-side Supabase client. Uses the publishable (sb_publishable_...) anon key
 * which is safe to expose. Auth state is persisted automatically through the
 * cookies set by `@supabase/ssr` and refreshed by the middleware in `middleware.ts`.
 */
export function createClient() {
  return createBrowserClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}
