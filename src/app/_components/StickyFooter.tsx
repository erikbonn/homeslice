"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function StickyFooter() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`fixed right-0 bottom-0 left-0 z-50 transform bg-orange-600/80 backdrop-blur-sm transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <p className="text-lg font-semibold">Ready to get started?</p>
        <Link
          href="/signup"
          className="rounded-full bg-white/10 px-6 py-2 font-semibold transition hover:bg-white/20"
        >
          Join Now
        </Link>
      </div>
    </div>
  );
}
