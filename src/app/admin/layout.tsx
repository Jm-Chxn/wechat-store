export const dynamic = "force-dynamic";

import { AdminGate } from "@/components/admin/AdminGate";
import { AdminShell } from "@/components/admin/AdminShell";

/**
 * /admin/* renders inside the AdminShell — a deliberately distinct chrome
 * (slate sidebar + topbar + light grey content area) so the surface reads
 * as a separate "console" rather than the storefront's cream/marketing look.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGate>
      <AdminShell>{children}</AdminShell>
    </AdminGate>
  );
}
