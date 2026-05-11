"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { Session, User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import type { Role } from "@/types";

/**
 * Auth provider backed by Supabase. Subscribes to `onAuthStateChange` so React
 * always reflects the latest session, and joins to `profiles.role` for admin
 * gating.
 */
export interface AuthUser {
  id: string;
  email: string | null;
  name: string;
  avatarUrl: string | null;
  role: Role;
}

interface AuthContextValue {
  user: AuthUser | null;
  session: Session | null;
  isReady: boolean;
  role: Role | null;
  isAdmin: boolean;
  signInWithPassword: (email: string, password: string) => Promise<{ error: string | null }>;
  signUpWithPassword: (email: string, password: string) => Promise<{ error: string | null }>;
  signInWithGoogle: (returnTo?: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

const supabase = createClient();

function deriveName(rawUser: User, profileNickname: string | null): string {
  if (profileNickname) return profileNickname;
  const meta = rawUser.user_metadata as Record<string, unknown> | undefined;
  if (meta && typeof meta.name === "string" && meta.name.length > 0) {
    return meta.name;
  }
  if (rawUser.email) return rawUser.email.split("@")[0];
  return "Member";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [session, setSession] = React.useState<Session | null>(null);
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [isReady, setReady] = React.useState(false);

  const refreshProfile = React.useCallback(async (sess: Session | null) => {
    if (!sess?.user) {
      setUser(null);
      return;
    }
    let role: Role = "user";
    let nickname: string | null = null;
    let avatarUrl: string | null = null;
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("nickname, avatar_url, role")
        .eq("user_id", sess.user.id)
        .single();
      if (!error && data) {
        role = (data.role === "admin" ? "admin" : "user") as Role;
        nickname = (data.nickname as string | null) ?? null;
        avatarUrl = (data.avatar_url as string | null) ?? null;
      }
    } catch {
      // Keep default user role/profile if profile lookup fails.
    }
    setUser({
      id: sess.user.id,
      email: sess.user.email ?? null,
      name: deriveName(sess.user, nickname),
      avatarUrl,
      role,
    });
  }, []);

  React.useEffect(() => {
    let isMounted = true;
    void supabase.auth
      .getSession()
      .then(async ({ data }) => {
        if (!isMounted) return;
        setSession(data.session);
        await refreshProfile(data.session);
      })
      .catch(() => {
        if (!isMounted) return;
        setSession(null);
        setUser(null);
      })
      .finally(() => {
        if (isMounted) setReady(true);
      });
    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, sess) => {
      setSession(sess);
      try {
        await refreshProfile(sess);
      } catch {
        setUser(null);
      } finally {
        setReady(true);
      }
    });
    return () => {
      isMounted = false;
      sub.subscription.unsubscribe();
    };
  }, [refreshProfile]);

  const signInWithPassword = React.useCallback(async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error: error?.message ?? null };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to sign in.";
      return { error: message };
    }
  }, []);

  const signUpWithPassword = React.useCallback(async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      return { error: error?.message ?? null };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to create account.";
      return { error: message };
    }
  }, []);

  const signInWithGoogle = React.useCallback(async (returnTo?: string) => {
    try {
      const origin =
        typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
      const target = returnTo ? `?next=${encodeURIComponent(returnTo)}` : "";
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${origin}/auth/callback${target}` },
      });
      return { error: error?.message ?? null };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to sign in with Google.";
      return { error: message };
    }
  }, []);

  const signOut = React.useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignore sign-out failures so UI can still clear client state via auth listener.
    } finally {
      router.refresh();
    }
  }, [router]);

  const value = React.useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      isReady,
      role: user?.role ?? null,
      isAdmin: user?.role === "admin",
      signInWithPassword,
      signUpWithPassword,
      signInWithGoogle,
      signOut,
    }),
    [user, session, isReady, signInWithPassword, signUpWithPassword, signInWithGoogle, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

export function useRequireAuth() {
  const router = useRouter();
  const { user, isReady } = useAuth();
  return React.useCallback(
    (returnTo: string) => {
      if (!isReady) return true;
      if (!user) {
        router.push(`/account/login?next=${encodeURIComponent(returnTo)}`);
        return true;
      }
      return false;
    },
    [router, user, isReady],
  );
}

export function useAdminGuard() {
  const router = useRouter();
  const { user, isReady, isAdmin } = useAuth();
  React.useEffect(() => {
    if (!isReady) return;
    if (!user) {
      router.replace(`/account/login?next=${encodeURIComponent("/admin")}`);
      return;
    }
    if (!isAdmin) router.replace("/");
  }, [user, isReady, isAdmin, router]);
  return { ready: isReady, user, isAdmin };
}
