export const dynamic = "force-dynamic";

import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
