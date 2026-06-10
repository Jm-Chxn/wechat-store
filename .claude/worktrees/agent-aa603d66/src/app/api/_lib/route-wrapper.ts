import { apiError } from "./response";
import { MissingSupabaseConfigError } from "./supabase-admin";

/**
 * Wraps a Route Handler so any thrown error becomes a logged 500 response
 * instead of a hard crash. Every API route should call this — it is the only
 * reliable way to make sure unexpected `throw`s reach the terminal as
 * `console.error` lines we can copy-paste while debugging.
 *
 * Special-cased errors:
 *   - `MissingSupabaseConfigError` → 500 with the names of the missing env
 *     vars so the developer sees the fix without grepping logs.
 */
export function withRoute<TArgs extends unknown[]>(
  name: string,
  fn: (...args: TArgs) => Promise<Response>,
): (...args: TArgs) => Promise<Response> {
  return async (...args: TArgs) => {
    try {
      return await fn(...args);
    } catch (err) {
      if (err instanceof MissingSupabaseConfigError) {
        console.error(
          `[api:${name}] Supabase admin client unavailable — missing env vars:`,
          err.missing,
        );
        return apiError(
          500,
          `Server misconfigured: missing ${err.missing.join(", ")}. ` +
            `Add them to .env.local and restart \`npm run dev\`.`,
        );
      }
      const msg = err instanceof Error ? err.message : String(err);
      const stack = err instanceof Error ? err.stack : undefined;
      console.error(`[api:${name}] unhandled error:`, msg);
      if (stack) console.error(stack);
      return apiError(500, msg || "Internal Server Error");
    }
  };
}
