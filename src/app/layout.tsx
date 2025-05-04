import "./globals.css";
import { type Metadata } from "next";
import { auth } from "@/server/auth";
import { TRPCReactProvider } from "@/trpc/react";
import { Navbar } from "@/components/ui/navbar";

export const metadata: Metadata = {
  title: "Homeslice",
  description: "Your slice of Real Estate data",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log("[RootLayout] Starting to render root layout");

  let session;
  try {
    console.log("[RootLayout] Attempting to get auth session");
    session = await auth();
    console.log("[RootLayout] Auth session retrieved:", !!session);
  } catch (error) {
    console.error("[RootLayout] Error getting auth session:", error);
    session = null;
  }

  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-900" suppressHydrationWarning>
        <TRPCReactProvider>
          <Navbar session={session} />
          <main className="h-[calc(100vh-4rem)] w-full overflow-hidden">
            {children}
          </main>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
