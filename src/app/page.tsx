"use client";

import { api } from "@/trpc/react";
import ScrollAnimation from "./_components/ScrollAnimation";

export default function Home() {
  console.log("[Home] Rendering home page");

  const { data, status } = api.health.check.useQuery();
  console.log("[Home] TRPC health check:", { status, data });

  return (
    <div className="relative space-y-8">
      <ScrollAnimation />
      <div className="mx-auto max-w-4xl">
        <div className="rounded-lg bg-white p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-gray-900">
            Welcome to Homeslice
          </h2>
          <p className="mt-3 text-gray-600">
            Your one-stop shop for real estate market insights.
          </p>
          <div className="mt-4 flex items-center gap-2 text-sm">
            <span className="font-medium text-gray-700">API Status:</span>
            <span
              className={`${status === "success" ? "text-green-600" : "text-orange-600"}`}
            >
              {status === "success" ? "✅ Connected" : "⏳ Connecting..."}
            </span>
            {data && (
              <span className="ml-auto text-xs text-gray-400">
                Last check: {new Date(data.timestamp).toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
