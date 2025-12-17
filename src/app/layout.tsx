import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { CartLinkBadge } from "@/components/CartLinkBadge";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Health Community Marketplace",
  description: "Community + Marketplace for health-focused content",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {/* 🔝 Global Header */}
          <header className="border-b">


            <div className="mx-auto max-w-5xl px-6 py-3 flex items-center justify-between">
            <Link href="/about" className="hover:underline">
  About
</Link>
              <Link href="/" className="font-semibold">
                Health Community
              </Link>

              <nav className="flex items-center gap-4 text-sm">
                <Link href="/community" className="hover:underline">
                  Community
                </Link>
                <Link href="/marketplace" className="hover:underline">
                  Marketplace
                </Link>
                <CartLinkBadge />
                <Link href="/orders" className="hover:underline">
  Orders
</Link>


              </nav>
            </div>
          </header>

          {/* Page content */}
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
