import { createAdminClient } from "./supabase-admin";
import { apiError } from "./response";

export interface AuthUser {
  userId: string;
  role: "user" | "admin";
}

/**
 * Resolve the caller's identity from the Authorization header. Returns null
 * for anonymous callers; never throws.
 *
 * Implementation notes:
 *   - Uses the service-role admin client to call `auth.getUser(token)`, which
 *     validates the JWT and returns the user without needing the session.
 *   - The profile join is optional — if the row is missing (race with the
 *     auto-create trigger) we default `role` to "user".
 */
export async function getAuthUser(request: Request): Promise<AuthUser | null> {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7).trim();
  if (!token) return null;
  const supabase = createAdminClient();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    if (error) console.warn("[auth] getUser failed:", error.message);
    return null;
  }
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", data.user.id)
    .single();
  if (profileError && profileError.code !== "PGRST116") {
    console.warn("[auth] profile lookup failed:", profileError.message);
  }
  return {
    userId: data.user.id,
    role: (profile?.role as "user" | "admin") ?? "user",
  };
}

export async function requireAuth(request: Request): Promise<AuthUser | Response> {
  const user = await getAuthUser(request);
  if (!user) return apiError(401, "Unauthorized");
  return user;
}

export async function requireAdmin(request: Request): Promise<AuthUser | Response> {
  const user = await getAuthUser(request);
  if (!user) return apiError(401, "Unauthorized");
  if (user.role !== "admin") return apiError(403, "Forbidden");
  return user;
}
