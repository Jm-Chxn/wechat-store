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
      // Fetch profile via the /api/v1/me API route which uses the service-role
      // key, bypassing any missing RLS SELECT policies on the profiles table.
      // Race against a 10-second timeout to handle cold-starting Supabase projects.
      const token = sess.access_token;
      const fetchPromise = fetch("/api/v1/me", {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => (r.ok ? (r.json() as Promise<{ role: string; nickname: string | null; avatarUrl: string | null }>) : null));

      const timeoutPromise = new Promise<null>((resolve) =>
        setTimeout(() => resolve(null), 10000),
      );

      const result = await Promise.race([fetchPromise, timeoutPromise]);

      if (result === null) {
        console.warn("[AuthProvider] Profile fetch timed out – using defaults.");
      } else {
        role = (result.role === "admin" ? "admin" : "user") as Role;
        nickname = result.nickname ?? null;
        avatarUrl = result.avatarUrl ?? null;
      }
    } catch (err) {
      console.warn("[AuthProvider] Profile fetch threw:", err);
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
    void supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return;
      setSession(data.session);
      void refreshProfile(data.session).finally(() => {
        if (isMounted) setReady(true);
      });
    });
    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, sess) => {
      setSession(sess);
      await refreshProfile(sess);
    });
    return () => {
      isMounted = false;
      sub.subscription.unsubscribe();
    };
  }, [refreshProfile]);

  const signInWithPassword = React.useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }, []);

  const signUpWithPassword = React.useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    return { error: error?.message ?? null };
  }, []);

  const signInWithGoogle = React.useCallback(async (returnTo?: string) => {
    const origin =
      typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    const target = returnTo ? `?next=${encodeURIComponent(returnTo)}` : "";
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${origin}/auth/callback${target}` },
    });
    return { error: error?.message ?? null };
  }, []);

  const signOut = React.useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

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
