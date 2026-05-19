"use client";

import * as React from "react";
import Link from "next/link";
import { ShieldOff, Loader2 } from "lucide-react";
import { useAdminGuard } from "@/providers/AuthProvider";

/**
 * Auth gate for /admin/*. Three states:
 *   1. Loading (auth state hasn't settled yet)   → spinner
 *   2. Signed in but not admin                   → explicit "Access denied"
 *   3. Signed in admin                            → renders children
 *
 * The "Access denied" screen used to be a redirect-to-home; the explicit
 * screen is friendlier and prevents non-admins from getting an infinite
 * spinner if they navigate to /admin directly.
 */
export function AdminGate({ children }: { children: React.ReactNode }) {
  const { ready, user, isAdmin } = useAdminGuard();

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-600">
        <div className="flex items-center gap-2 text-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          Verifying admin access…
        </div>
      </div>
    );
  }

  if (!user) return null; // redirect already kicked off in useAdminGuard

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-rose-50 text-rose-600">
            <ShieldOff className="h-5 w-5" />
          </div>
          <h1 className="mt-4 text-lg font-semibold text-slate-900">Access denied</h1>
          <p className="mt-1 text-sm text-slate-600">
            Your account doesn&apos;t have admin permission. Ask an existing admin
            to promote your profile (set <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px]">role=admin</code> in <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px]">profiles</code>).
          </p>
          <Link
            href="/"
            className="mt-5 inline-flex items-center justify-center rounded-lg bg-slate-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Back to storefront
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
