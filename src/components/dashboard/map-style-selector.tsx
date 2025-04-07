"use client";

import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MapStyle } from "./map-dashboard";

interface MapStyleSelectorProps {
  currentStyle: MapStyle;
  onStyleChange: (style: MapStyle) => void;
}

const styleLabels: Record<MapStyle, string> = {
  streets: "Streets",
  // light: "Light",
  // dark: "Dark",
  terrain: "Terrain",
  satellite: "Satellite",
};

export function MapStyleSelector({
  currentStyle,
  onStyleChange,
}: MapStyleSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<MapStyle>(currentStyle);

  // Update selected style when currentStyle prop changes
  useEffect(() => {
    setSelectedStyle(currentStyle);
  }, [currentStyle]);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-md bg-orange-500 px-3 py-1.5 text-sm text-white transition-colors hover:bg-orange-600"
      >
        <span>{styleLabels[selectedStyle]}</span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-40 rounded-md bg-gray-900/95 py-1 shadow-lg ring-1 ring-black/5">
          {Object.entries(styleLabels).map(([style, label]) => (
            <button
              key={style}
              onClick={() => {
                onStyleChange(style as MapStyle);
                setSelectedStyle(style as MapStyle);
                setIsOpen(false);
              }}
              className={`w-full px-3 py-1.5 text-left text-sm transition-colors ${
                selectedStyle === style
                  ? "bg-orange-500 text-white"
                  : "text-gray-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
