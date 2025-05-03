"use client";

import { useEffect, useState } from "react";
import { SearchInput } from "@/components/ui/search-input";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import type { ChartOptions } from "chart.js";
import { Line } from "react-chartjs-2";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

// Mock data - In a real application, this would come from an API
const mockData = {
  labels: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ],
  datasets: [
    {
      label: "2023",
      data: [
        350000, 355000, 360000, 365000, 370000, 375000, 380000, 385000, 390000,
        395000, 400000, 405000,
      ],
      borderColor: "rgb(249, 115, 22)",
      backgroundColor: "rgba(249, 115, 22, 0.5)",
      tension: 0.4,
    },
    {
      label: "2024",
      data: [
        410000, 415000, 420000, 425000, 430000, 435000, 440000, 445000, 450000,
        455000, 460000, 465000,
      ],
      borderColor: "rgb(234, 88, 12)",
      backgroundColor: "rgba(234, 88, 12, 0.5)",
      tension: 0.4,
    },
  ],
};

const metroAreas = [
  { name: "New York, NY", lastYear: 750000, current: 780000 },
  { name: "Los Angeles, CA", lastYear: 850000, current: 890000 },
  { name: "Chicago, IL", lastYear: 350000, current: 370000 },
  { name: "Houston, TX", lastYear: 320000, current: 340000 },
  { name: "Phoenix, AZ", lastYear: 450000, current: 480000 },
  { name: "Philadelphia, PA", lastYear: 280000, current: 300000 },
  { name: "San Antonio, TX", lastYear: 290000, current: 310000 },
  { name: "San Diego, CA", lastYear: 800000, current: 830000 },
  { name: "Dallas, TX", lastYear: 380000, current: 400000 },
  { name: "San Jose, CA", lastYear: 1200000, current: 1250000 },
  { name: "Austin, TX", lastYear: 450000, current: 470000 },
  { name: "Jacksonville, FL", lastYear: 320000, current: 340000 },
  { name: "Fort Worth, TX", lastYear: 330000, current: 350000 },
  { name: "Columbus, OH", lastYear: 280000, current: 300000 },
  { name: "Charlotte, NC", lastYear: 350000, current: 370000 },
  { name: "San Francisco, CA", lastYear: 1300000, current: 1350000 },
  { name: "Indianapolis, IN", lastYear: 250000, current: 370000 },
  { name: "Seattle, WA", lastYear: 750000, current: 780000 },
  { name: "Denver, CO", lastYear: 550000, current: 580000 },
  { name: "Washington, DC", lastYear: 600000, current: 630000 },
  { name: "Boston, MA", lastYear: 700000, current: 730000 },
  { name: "El Paso, TX", lastYear: 220000, current: 240000 },
  { name: "Nashville, TN", lastYear: 380000, current: 400000 },
  { name: "Detroit, MI", lastYear: 200000, current: 220000 },
  { name: "Portland, OR", lastYear: 500000, current: 520000 },
];

export default function ScrollAnimation() {
  const [scrollY, setScrollY] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    // Set initial scroll position
    handleScroll();

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

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: "white",
        },
      },
      title: {
        display: true,
        text: "US Median Home Price YoY Comparison",
        color: "white",
        font: {
          size: 16,
        },
      },
    },
    scales: {
      y: {
        ticks: {
          color: "white",
          callback: (value) => `$${Number(value).toLocaleString()}`,
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
      },
      x: {
        ticks: {
          color: "white",
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
      },
    },
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div className="relative h-[300vh]">
      <div
        className="fixed left-0 right-0 top-0 flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-orange-900 px-4"
        style={{
          opacity: welcomeOpacity,
          transform: welcomeTransform,
          zIndex: 10,
          pointerEvents: isScrolling ? "none" : "auto",
        }}
      >
        <h1 className="welcome-text text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
          Welcome to <span className="animated-gradient">Homeslice</span>
        </h1>
        <p className="mt-4 text-center text-xl text-orange-100">
          Get to know your <strong className="text-white">slice</strong> of the
          real estate market.
        </p>
        <div className="mt-8 flex w-full justify-center">
          <div className="w-full max-w-2xl">
            <SearchInput onSearch={handleSearch} />
          </div>
        </div>
      </div>

      <div
        id="market-analytics"
        className="fixed left-0 right-0 top-0 flex min-h-screen items-center justify-center bg-gradient-to-b from-orange-900 to-gray-900 px-4 pt-40"
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
              <div className="flex flex-col gap-6">
                <div className="h-[300px] w-full rounded-lg bg-white/5 p-6">
                  <Line options={options} data={mockData} />
                </div>
                <div className="rounded-lg bg-white/5 p-6">
                  <h3 className="mb-4 text-xl font-semibold text-white">
                    Top Metro Areas - Median Home Prices
                  </h3>
                  <div className="h-[300px] overflow-hidden rounded-lg border border-white/10">
                    <div className="h-full overflow-y-auto">
                      <table className="w-full">
                        <thead className="sticky top-0 bg-white/10 backdrop-blur-sm">
                          <tr className="border-b border-white/20">
                            <th className="px-4 py-2 text-left text-sm font-medium text-orange-200">
                              Metro Area
                            </th>
                            <th className="px-4 py-2 text-right text-sm font-medium text-orange-200">
                              Last Year
                            </th>
                            <th className="px-4 py-2 text-right text-sm font-medium text-orange-200">
                              Current
                            </th>
                            <th className="px-4 py-2 text-right text-sm font-medium text-orange-200">
                              Change
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {metroAreas.map((area, index) => {
                            const change =
                              ((area.current - area.lastYear) / area.lastYear) *
                              100;
                            return (
                              <tr
                                key={area.name}
                                className={`border-b border-white/10 ${
                                  index % 2 === 0 ? "bg-white/5" : ""
                                }`}
                              >
                                <td className="px-4 py-2 text-sm text-white">
                                  {area.name}
                                </td>
                                <td className="px-4 py-2 text-right text-sm text-white">
                                  ${area.lastYear.toLocaleString()}
                                </td>
                                <td className="px-4 py-2 text-right text-sm text-white">
                                  ${area.current.toLocaleString()}
                                </td>
                                <td
                                  className={`px-4 py-2 text-right text-sm ${
                                    change >= 0
                                      ? "text-green-400"
                                      : "text-red-400"
                                  }`}
                                >
                                  {change.toFixed(1)}%
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
