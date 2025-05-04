"use client";

import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  onSearch?: (query: string) => void;
  defaultValue?: string;
}

export function SearchInput({
  className,
  onSearch,
  defaultValue = "",
  ...props
}: SearchInputProps) {
  const [searchQuery, setSearchQuery] = useState(defaultValue);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Call the onSearch callback if provided
      if (onSearch) {
        onSearch(searchQuery);
      }

      // Route to dashboard with search query
      router.push(`/dashboard?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative mx-auto w-full max-w-2xl">
      <div className="group relative">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-orange-200 transition-colors group-hover:text-orange-100" />
        <input
          type="text"
          placeholder="Enter a city, state, county, or zip-code"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={cn(
            "w-full rounded-full border-2 border-orange-200/20 bg-white/10 px-12 py-4 text-base text-white transition-all placeholder:text-orange-200/50 hover:border-orange-200/30 hover:bg-white/20 focus:border-orange-200/40 focus:outline-none focus:ring-2 focus:ring-orange-200/20",
            className,
          )}
          {...props}
        />
      </div>
    </form>
  );
}
