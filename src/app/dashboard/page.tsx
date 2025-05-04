"use client";

import { MapDashboard } from "@/components/dashboard/map-dashboard";
import { SearchInput } from "@/components/ui/search-input";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { FilterType } from "@/components/dashboard/filter-types";

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") ?? "");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType | null>(null);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleFilterSelect = (filter: FilterType) => {
    setActiveFilter(filter === activeFilter ? null : filter);
  };

  return (
    <div className="h-full w-full">
      <div className="flex h-full">
        <DashboardSidebar
          isOpen={sidebarOpen}
          toggleSidebar={toggleSidebar}
          activeFilter={activeFilter}
          onFilterSelect={handleFilterSelect}
        />

        <div
          className={`flex-1 transition-all duration-300 ${sidebarOpen ? "ml-[300px]" : "ml-[50px]"}`}
        >
          <div className="flex h-full flex-col p-4">
            <h1 className="mb-4 text-3xl font-bold text-white">
              Market Analytics Dashboard
            </h1>
            <div className="mb-4">
              <SearchInput defaultValue={searchQuery} onSearch={handleSearch} />
            </div>
            <div className="flex-1 overflow-hidden">
              <MapDashboard
                searchQuery={searchQuery}
                activeFilters={activeFilter ? [activeFilter] : []}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
