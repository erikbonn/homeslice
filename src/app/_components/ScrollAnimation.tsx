"use client";

import { useEffect, useState } from "react";
import { SearchInput } from "@/components/ui/search-input";

export default function ScrollAnimation() {
  const [scrollY, setScrollY] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (query: string) => {
    setIsScrolling(true);
    // Reset scrolling state after animation completes
    setTimeout(() => setIsScrolling(false), 1000);
  };

  const welcomeOpacity = Math.max(0, 1 - scrollY / 300);
  const welcomeTransform = `translateY(${Math.min(scrollY * 0.5, 200)}px)`;
  const imageOpacity = Math.min(1, scrollY / 300);
  const imageTransform = `translateY(${Math.max(-100, -scrollY * 0.3)}px)`;

  return (
    <div className="relative h-[300vh]">
      <div
        className="fixed top-0 right-0 left-0 flex min-h-screen flex-col items-center justify-center px-4"
        style={{
          opacity: welcomeOpacity,
          transform: welcomeTransform,
          zIndex: 10,
          pointerEvents: isScrolling ? "none" : "auto",
        }}
      >
        <h1 className="welcome-text text-5xl font-extrabold tracking-tight sm:text-[5rem]">
          Welcome to <span className="animated-gradient">Homeslice</span>
        </h1>
        <p className="mt-4 text-center text-xl text-orange-100">
          Your <strong>slice</strong> of the real estate market.
        </p>
        <div className="mt-8 flex w-full justify-center">
          <div className="w-full max-w-2xl">
            <SearchInput onSearch={handleSearch} />
          </div>
        </div>
      </div>

      <div
        id="market-analytics"
        className="fixed top-0 right-0 left-0 flex min-h-screen items-center justify-center px-4 pt-40"
        style={{
          opacity: imageOpacity,
          transform: imageTransform,
          zIndex: 5,
          pointerEvents: "none",
        }}
      >
        <div className="relative w-full max-w-7xl">
          <div className="h-[calc(100vh-8rem)] w-full rounded-xl bg-white/10 p-8 shadow-2xl backdrop-blur-sm">
            <div className="flex h-full flex-col">
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-orange-100">
                  Market Analytics Dashboard
                </h2>
                <p className="mt-2 text-orange-200">
                  Explore real estate trends across the United States
                </p>
              </div>
              <div className="flex-1 rounded-lg bg-white/5">
                {/* Map canvas will go here */}
                <div className="flex h-full items-center justify-center">
                  <p className="text-xl text-orange-200">
                    Interactive US Map Coming Soon
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
