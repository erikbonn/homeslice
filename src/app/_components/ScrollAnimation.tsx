"use client";

import { useEffect, useState } from "react";

export default function ScrollAnimation() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const welcomeOpacity = Math.max(0, 1 - scrollY / 300);
  const welcomeTransform = `translateY(${Math.min(scrollY * 0.5, 200)}px)`;
  const imageOpacity = Math.min(1, scrollY / 300);
  const imageTransform = `translateY(${Math.max(-100, -scrollY * 0.3)}px)`;

  return (
    <div className="relative h-[200vh]">
      <div
        className="fixed top-0 right-0 left-0 flex min-h-screen flex-col items-center justify-center px-4"
        style={{
          opacity: welcomeOpacity,
          transform: welcomeTransform,
        }}
      >
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
          Welcome to <span className="text-orange-200">Homeslice</span>
        </h1>
        <p className="mt-4 text-center text-xl text-orange-100">
          Your slice of the real estate market.
        </p>
      </div>

      <div
        className="fixed top-0 right-0 left-0 flex min-h-screen items-center justify-center px-4"
        style={{
          opacity: imageOpacity,
          transform: imageTransform,
        }}
      >
        <div className="relative w-full max-w-6xl">
          <div className="aspect-video w-full rounded-xl bg-white/10 p-8 shadow-2xl backdrop-blur-sm">
            <div className="flex h-full items-center justify-center">
              <p className="text-2xl text-orange-100">
                Market Analytics Dashboard
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
