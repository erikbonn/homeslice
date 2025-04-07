"use client";

import { MapDashboard } from "@/components/dashboard/map-dashboard";
import { SearchInput } from "@/components/ui/search-input";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") ?? "");

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold text-white">
          Market Analytics Dashboard
        </h1>
        <div className="mb-8">
          <SearchInput defaultValue={searchQuery} onSearch={handleSearch} />
        </div>
        <MapDashboard searchQuery={searchQuery} />
      </div>
    </div>
  );
}
