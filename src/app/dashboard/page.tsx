"use client";

import { MapDashboard } from "@/components/dashboard/map-dashboard";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold text-white">
          Market Analytics Dashboard
        </h1>
        <MapDashboard />
      </div>
    </div>
  );
}
