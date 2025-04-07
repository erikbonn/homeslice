"use client";

import { SearchInput } from "@/components/ui/search-input";
import { useRouter } from "next/navigation";
import ScrollAnimation from "./_components/ScrollAnimation";
import StickyFooter from "./_components/StickyFooter";

export default function Home() {
  const router = useRouter();

  const handleSearch = (query: string) => {
    if (query.trim()) {
      router.push(`/dashboard?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 px-4">
      <ScrollAnimation />
      <StickyFooter />
    </div>
  );
}
