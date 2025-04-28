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
  const [activeFilters, setActiveFilters] = useState<FilterType[]>([]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleFilterToggle = (filter: FilterType) => {
    if (activeFilters.includes(filter)) {
      setActiveFilters(activeFilters.filter((f) => f !== filter));
    } else {
      setActiveFilters([...activeFilters, filter]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="flex h-[calc(100vh-64px)]">
        <DashboardSidebar
          isOpen={sidebarOpen}
          toggleSidebar={toggleSidebar}
          activeFilters={activeFilters}
          onFilterToggle={handleFilterToggle}
        />

        <div
          className={`flex-1 transition-all duration-300 ${sidebarOpen ? "ml-[300px]" : "ml-[50px]"}`}
        >
          <div className="p-6">
            <h1 className="mb-6 text-3xl font-bold text-white">
              Market Analytics Dashboard
            </h1>
            <div className="mb-6">
              <SearchInput defaultValue={searchQuery} onSearch={handleSearch} />
            </div>
            <MapDashboard
              searchQuery={searchQuery}
              activeFilters={activeFilters}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
