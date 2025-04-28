"use client";

import { useState } from "react";
import {
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { FilterType, filterCategories, filterNames } from "./filter-types";

interface DashboardSidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  activeFilters: FilterType[];
  onFilterToggle: (filter: FilterType) => void;
}

export function DashboardSidebar({
  isOpen,
  toggleSidebar,
  activeFilters,
  onFilterToggle,
}: DashboardSidebarProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(
    Object.keys(filterCategories).slice(0, 2), // Default: first two categories expanded
  );

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    );
  };

  return (
    <div
      className={`fixed top-16 bottom-0 left-0 z-40 bg-gray-800 shadow-xl transition-all duration-300 ${
        isOpen ? "w-[300px]" : "w-[50px]"
      }`}
    >
      {/* Toggle button */}
      <button
        onClick={toggleSidebar}
        className="absolute top-6 -right-3 flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-white shadow-md hover:bg-orange-600"
        aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
      >
        {isOpen ? (
          <ChevronLeft className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </button>

      {/* Sidebar content */}
      {isOpen && (
        <div className="h-full overflow-auto p-4 text-white">
          <h2 className="mb-6 text-xl font-bold text-orange-400">
            Market Filters
          </h2>

          {/* Premium feature notice */}
          <div className="mb-6 rounded bg-gradient-to-r from-orange-600 to-orange-800 p-3 text-sm">
            <p className="font-medium">Some filters require premium access</p>
            <p className="mt-1 text-xs opacity-80">
              Upgrade to view historical data and advanced metrics
            </p>
          </div>

          {/* Filter categories */}
          <div className="space-y-4">
            {Object.entries(filterCategories).map(([category, filters]) => (
              <div key={category} className="rounded bg-gray-700/50">
                <button
                  onClick={() => toggleCategory(category)}
                  className="flex w-full items-center justify-between p-3 text-sm font-medium text-orange-200 hover:text-orange-100"
                >
                  <span>{category}</span>
                  {expandedCategories.includes(category) ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>

                {expandedCategories.includes(category) && (
                  <div className="border-t border-gray-600/50 px-3 py-2">
                    {filters.map((filter) => (
                      <div key={filter} className="py-1">
                        <label className="flex cursor-pointer items-center text-sm">
                          <input
                            type="checkbox"
                            checked={activeFilters.includes(filter)}
                            onChange={() => onFilterToggle(filter)}
                            className="mr-2 h-4 w-4 rounded border-gray-600 bg-gray-700 text-orange-500 focus:ring-orange-500"
                          />
                          <span className="flex-1 text-gray-200">
                            {filterNames[filter]}
                          </span>

                          {/* Premium indicator for certain filters */}
                          {[
                            FilterType.APPRECIATION_FORECAST,
                            FilterType.MARKET_HEAT,
                            FilterType.AFFORDABILITY_INDEX,
                            FilterType.INCOME_TO_PRICE,
                          ].includes(filter) && (
                            <span className="ml-1 rounded-full bg-orange-500 px-1.5 py-0.5 text-xs font-medium text-white">
                              PRO
                            </span>
                          )}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Time period selector */}
          <div className="mt-6">
            <h3 className="mb-2 text-sm font-medium text-orange-200">
              Time Period
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {["1M", "3M", "6M", "1Y", "3Y", "5Y"].map((period) => (
                <button
                  key={period}
                  className={`rounded border px-2 py-1.5 text-xs font-medium ${
                    period === "1Y"
                      ? "border-orange-500 bg-orange-500/20 text-orange-400"
                      : "border-gray-600 bg-gray-700/30 text-gray-300 hover:bg-gray-700/50"
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>

          {/* Data source info */}
          <div className="mt-8 text-center text-xs text-gray-400">
            <p>Data sourced from Multiple Listing Services</p>
            <p className="mt-1">
              Last updated: {new Date().toLocaleDateString()}
            </p>
            <p className="mt-4 text-[10px]">
              {/* This will be where we later put data source disclaimers */}
              Data is provided for informational purposes only
            </p>
          </div>
        </div>
      )}

      {/* Collapsed view */}
      {!isOpen && (
        <div className="flex flex-col items-center pt-12 text-white">
          <div className="mb-4 h-6 w-6 rounded-full bg-orange-500"></div>
          {Object.keys(filterCategories).map((category, index) => (
            <button
              key={category}
              onClick={() => {
                toggleSidebar();
                setTimeout(() => {
                  toggleCategory(category);
                }, 300);
              }}
              className="my-1 h-3 w-3 rounded-full bg-gray-400"
              aria-label={`Open ${category} filters`}
              title={category}
            ></button>
          ))}
        </div>
      )}
    </div>
  );
}
