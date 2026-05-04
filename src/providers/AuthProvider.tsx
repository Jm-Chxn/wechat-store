"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { wechatAccounts } from "@/data/wechatAccounts";
import { logActivity } from "@/lib/repository";
import { readJSON, StorageKeys, writeJSON } from "@/lib/storage";
import type { Role, WeChatAccount } from "@/types";

interface AuthContextValue {
  user: WeChatAccount | null;
  isReady: boolean;
  role: Role | null;
  isAdmin: boolean;
  signIn: (openid: string) => WeChatAccount | null;
  signOut: () => void;
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<WeChatAccount | null>(null);
  const [isReady, setReady] = React.useState(false);

  React.useEffect(() => {
    const stored = readJSON<WeChatAccount | null>(StorageKeys.user, null);
    if (stored?.openid) {
      // re-resolve so role updates from data file always win
      const fresh = wechatAccounts.find((a) => a.openid === stored.openid);
      setUser(fresh ?? stored);
    }
    setReady(true);
  }, []);

  const signIn = React.useCallback((openid: string) => {
    const acc = wechatAccounts.find((a) => a.openid === openid);
    if (!acc) return null;
    setUser(acc);
    writeJSON(StorageKeys.user, acc);
    logActivity("SIGN_IN", acc.openid, {
      nicknameEn: acc.nicknameEn,
      nicknameZh: acc.nicknameZh,
      role: acc.role,
    });
    return acc;
  }, []);

  const signOut = React.useCallback(() => {
    if (user?.openid) {
      logActivity("SIGN_OUT", user.openid, {
        nicknameEn: user.nicknameEn,
        nicknameZh: user.nicknameZh,
      });
    }
    setUser(null);
    writeJSON(StorageKeys.user, null);
  }, [user]);

  const value = React.useMemo<AuthContextValue>(
    () => ({
      user,
      isReady,
      role: user?.role ?? null,
      isAdmin: user?.role === "admin",
      signIn,
      signOut,
    }),
    [user, isReady, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

/**
 * Redirect helper for any flow that requires sign-in (Place Order, Buy Now).
 * Returns true if the caller should bail out.
 */
export function useRequireAuth() {
  const router = useRouter();
  const { user, isReady } = useAuth();

  return React.useCallback(
    (returnTo: string) => {
      if (!isReady) return true; // still loading
      if (!user) {
        const url = `/auth/wechat/consent?returnTo=${encodeURIComponent(returnTo)}`;
        router.push(url);
        return true;
      }
      return false;
    },
    [router, user, isReady],
  );
}

/** Admin-only route gate. Renders nothing while redirecting. */
export function useAdminGuard() {
  const router = useRouter();
  const { user, isReady, isAdmin } = useAuth();

  React.useEffect(() => {
    if (!isReady) return;
    if (!user) {
      router.replace(
        `/auth/wechat/consent?returnTo=${encodeURIComponent("/admin")}`,
      );
      return;
    }
    if (!isAdmin) {
      router.replace("/");
    }
  }, [user, isReady, isAdmin, router]);

  return { ready: isReady, user, isAdmin };
}
