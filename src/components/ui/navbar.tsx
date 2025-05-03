"use client";

import Link from "next/link";
import Image from "next/image";
import { type Session } from "next-auth";

export function Navbar({ session }: { session: Session | null }) {
  return (
    <nav className="fixed left-0 right-0 top-0 z-50 bg-orange-600/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-2xl font-bold text-white"
        >
          <Image
            src="/logo.svg"
            alt="Homeslice Logo"
            width={32}
            height={32}
            className="h-8 w-8"
          />
          <span>Homeslice</span>
        </Link>
        <div className="flex items-center gap-6">
          {session && (
            <>
              <Link
                href="/dashboard"
                className="text-sm font-medium text-white transition-colors hover:text-orange-200"
              >
                Dashboard
              </Link>
              <span className="text-sm text-white">
                Welcome, {session.user?.name}
              </span>
            </>
          )}
          <Link
            href={session ? "/api/auth/signout" : "/api/auth/signin"}
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-orange-600 transition hover:bg-orange-50"
          >
            {session ? "Sign out" : "Sign in"}
          </Link>
        </div>
      </div>
    </nav>
  );
}
