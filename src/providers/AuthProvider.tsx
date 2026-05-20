"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import type { Role } from "@/types";

export interface AuthUser {
  id: string;
  email: string | null;
  name: string;
  fullName: string | null;
  wechatId: string | null;
  phone: string | null;
  avatarUrl: string | null;
  role: Role;
}

export interface SignUpInput {
  email: string;
  password: string;
  fullName: string;
}

export interface UpdateProfileInput {
  fullName?: string;
  wechatId?: string;
  phone?: string;
}

interface MeResponse {
  role: string;
  nickname: string | null;
  avatarUrl: string | null;
  fullName: string | null;
  wechatId: string | null;
  email: string | null;
  phone: string | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  session: Session | null;
  isReady: boolean;
  role: Role | null;
  isAdmin: boolean;
  signInWithPassword: (email: string, password: string) => Promise<{ error: string | null }>;
  signUpWithPassword: (input: SignUpInput) => Promise<{ error: string | null }>;
  updateProfile: (input: UpdateProfileInput) => Promise<{ error: string | null }>;
  signInWithGoogle: (returnTo?: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

const supabase = createClient();

function mapMeToUser(sess: Session, me: MeResponse | null): AuthUser {
  const fullName = me?.fullName ?? null;
  const displayName =
    fullName || me?.nickname || sess.user.email?.split("@")[0] || "Member";
  return {
    id: sess.user.id,
    email: me?.email ?? sess.user.email ?? null,
    name: displayName,
    fullName,
    wechatId: me?.wechatId ?? null,
    phone: me?.phone ?? null,
    avatarUrl: me?.avatarUrl ?? null,
    role: (me?.role === "admin" ? "admin" : "user") as Role,
  };
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

    try {
      const token = sess.access_token;
      const fetchPromise = fetch("/api/v1/me", {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => (r.ok ? (r.json() as Promise<MeResponse>) : null));

      const timeoutPromise = new Promise<null>((resolve) =>
        setTimeout(() => resolve(null), 10000),
      );

      const result = await Promise.race([fetchPromise, timeoutPromise]);

      if (result === null) {
        console.warn("[AuthProvider] Profile fetch timed out – using defaults.");
        setUser(mapMeToUser(sess, null));
      } else {
        setUser(mapMeToUser(sess, result));
      }
    } catch (err) {
      console.warn("[AuthProvider] Profile fetch threw:", err);
      setUser(mapMeToUser(sess, null));
    }
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

  const signUpWithPassword = React.useCallback(async (input: SignUpInput) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: input.email,
        password: input.password,
        options: {
          data: { full_name: input.fullName },
        },
      });
      if (error) return { error: error.message };

      if (data.session) {
        const res = await fetch("/api/v1/me", {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${data.session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ fullName: input.fullName }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          const msg =
            typeof body === "object" && body !== null && "message" in body
              ? String((body as { message: unknown }).message)
              : "Account created but profile could not be saved.";
          return { error: msg };
        }
      }

      return { error: null };
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

  const updateProfile = React.useCallback(
    async (input: UpdateProfileInput) => {
      try {
        let activeSession = session;
        if (!activeSession) {
          const { data } = await supabase.auth.getSession();
          activeSession = data.session;
        }
        if (!activeSession) return { error: "Not signed in." };

        const res = await fetch("/api/v1/me", {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${activeSession.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(input),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          const msg =
            typeof body === "object" && body !== null && "message" in body
              ? String((body as { message: unknown }).message)
              : "Could not save profile.";
          return { error: msg };
        }
        await refreshProfile(activeSession);
        return { error: null };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Could not save profile.";
        return { error: message };
      }
    },
    [session, refreshProfile],
  );

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
      updateProfile,
      signInWithGoogle,
      signOut,
    }),
    [
      user,
      session,
      isReady,
      signInWithPassword,
      signUpWithPassword,
      updateProfile,
      signInWithGoogle,
      signOut,
    ],
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
