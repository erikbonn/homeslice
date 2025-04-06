import "@/styles/globals.css";
import "@/styles/animations.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import { auth } from "@/server/auth";

import { TRPCReactProvider } from "@/trpc/react";

export const metadata: Metadata = {
  title: "Homeslice",
  description: "Your slice of Real Estate data",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();

  return (
    <html lang="en" className={`${geist.variable}`}>
      <body className="min-h-screen bg-gradient-to-b from-orange-500 to-orange-700 text-white">
        <nav className="fixed top-0 right-0 left-0 z-50 bg-orange-600/80 backdrop-blur-sm">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <Link href="/" className="text-3xl font-bold">
              Homeslice
            </Link>
            <div className="flex items-center gap-4">
              {session && (
                <span className="text-sm">Welcome, {session.user?.name}</span>
              )}
              <Link
                href={session ? "/api/auth/signout" : "/api/auth/signin"}
                className="rounded-full bg-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/30"
              >
                {session ? "Sign out" : "Sign in"}
              </Link>
            </div>
          </div>
        </nav>
        <div className="pt-16">
          <TRPCReactProvider>{children}</TRPCReactProvider>
        </div>
      </body>
    </html>
  );
}
