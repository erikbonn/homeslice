"use client";

import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  onSearch?: (query: string) => void;
}

export function SearchInput({
  className,
  onSearch,
  ...props
}: SearchInputProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Call the onSearch callback if provided
      if (onSearch) {
        onSearch(searchQuery);
      }

      // Scroll to the bottom of the page
      window.scrollTo({
        top: window.innerHeight,
        behavior: "smooth",
      });
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative mx-auto w-full max-w-2xl">
      <div className="relative">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-orange-200" />
        <input
          type="text"
          placeholder="Enter a city, state, or zip-code"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={cn(
            "w-full rounded-full border border-orange-200/20 bg-white/10 px-10 py-3 text-sm text-white placeholder:text-orange-200/50 focus:border-orange-200/40 focus:ring-2 focus:ring-orange-200/20 focus:outline-none",
            className,
          )}
          {...props}
        />
      </div>
    </form>
  );
}
