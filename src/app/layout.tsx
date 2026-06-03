import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_SC } from "next/font/google";
import { AppProviders } from "@/providers/AppProviders";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const notoSansSC = Noto_Sans_SC({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto-sans-sc",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Good Food, Shared Together / 好食材，一起团",
  description:
    "Community group-buying for fresh meats, sauces, noodles, and pantry staples — neighbour-friendly prices.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "好食材团购",
  },
  openGraph: {
    title: "Good Food, Shared Together / 好食材，一起团",
    description: "Community group-buying, neighbour-friendly prices.",
    type: "website",
    locale: "zh_CN",
    alternateLocale: "en_US",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${notoSansSC.variable}`}>
      <body className="min-h-screen bg-bg text-ink antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
