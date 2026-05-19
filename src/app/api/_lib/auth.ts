import { createAdminClient } from "./supabase-admin";

export interface AuthUser {
  userId: string;
  role: "user" | "admin";
}

export async function getAuthUser(request: Request): Promise<AuthUser | null> {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  const supabase = createAdminClient();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", data.user.id)
    .single();
  return {
    userId: data.user.id,
    role: (profile?.role as "user" | "admin") ?? "user",
  };
}

export async function requireAuth(request: Request): Promise<AuthUser | Response> {
  const user = await getAuthUser(request);
  if (!user) return errorResponse(401, "Unauthorized");
  return user;
}

export async function requireAdmin(request: Request): Promise<AuthUser | Response> {
  const user = await getAuthUser(request);
  if (!user) return errorResponse(401, "Unauthorized");
  if (user.role !== "admin") return errorResponse(403, "Forbidden");
  return user;
}

function errorResponse(status: number, message: string) {
  return new Response(
    JSON.stringify({ status, error: message, message, timestamp: new Date().toISOString() }),
    { status, headers: { "Content-Type": "application/json" } },
  );
}
