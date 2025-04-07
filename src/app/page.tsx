"use client";

import { SearchInput } from "@/components/ui/search-input";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const handleSearch = (query: string) => {
    if (query.trim()) {
      router.push(`/dashboard?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 px-4">
      <div className="text-center">
        <h1 className="welcome-text text-5xl font-extrabold tracking-tight sm:text-[5rem]">
          Welcome to <span className="animated-gradient">Homeslice</span>
        </h1>
        <p className="mt-4 text-center text-xl text-orange-100">
          Get to know your <strong>slice</strong> of the real estate market.
        </p>
        <div className="mt-8 flex w-full justify-center">
          <div className="w-full max-w-2xl">
            <SearchInput onSearch={handleSearch} />
          </div>
        </div>
      </div>
    </div>
  );
}
