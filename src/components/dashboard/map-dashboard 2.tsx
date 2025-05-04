"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { MapStyleSelector } from "./map-style-selector";
import { FilterType, filterNames } from "./filter-types";
import { Info, Layers, Calendar, AlertTriangle } from "lucide-react";
import {
  getColorScaleExpression,
  getFilterGeoJSON,
  getLatestDate,
  generateLegend,
  formatMetricValue,
  preloadData,
  getPreloadStatus,
} from "@/lib/services/marketDataService";
import type { MapLayerMouseEvent, MapGeoJSONFeature } from "maplibre-gl";
import type { Feature, Geometry } from "geojson";
import { DashboardSidebar } from "./dashboard-sidebar";
import { MapComponent } from "./map-component";

interface MapDashboardProps {
  initialViewState?: {
    longitude: number;
    latitude: number;
    zoom: number;
  };
  searchQuery?: string;
  activeFilters?: FilterType[];
}

// Define a proper type for our feature properties
interface FeatureProperties {
  id: string;
  name: string;
  type: string;
  value: number;
  filter: string;
  date: string;
}

// Define our custom feature type that extends GeoJSON Feature
type MapFeature = Feature<Geometry, FeatureProperties>;

export type MapStyle = "streets" | "terrain" | "satellite";

interface GeocodingResult {
  lat: string;
  lon: string;
  display_name: string;
}

const mapStyles: Record<MapStyle, maplibregl.StyleSpecification> = {
  streets: {
    version: 8,
    sources: {
      "raster-tiles": {
        type: "raster",
        tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
        tileSize: 256,
        attribution: "© OpenStreetMap contributors",
      },
    },
    layers: [
      {
        id: "simple-tiles",
        type: "raster",
        source: "raster-tiles",
        minzoom: 0,
        maxzoom: 22,
      },
    ],
  },
  terrain: {
    version: 8,
    sources: {
      "raster-tiles": {
        type: "raster",
        tiles: ["https://tile.opentopomap.org/{z}/{x}/{y}.png"],
        tileSize: 256,
        attribution: "© OpenTopoMap contributors",
      },
    },
    layers: [
      {
        id: "simple-tiles",
        type: "raster",
        source: "raster-tiles",
        minzoom: 0,
        maxzoom: 17,
      },
    ],
  },
  satellite: {
    version: 8,
    sources: {
      "raster-tiles": {
        type: "raster",
        tiles: [
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        ],
        tileSize: 256,
        attribution: "© ESRI",
      },
    },
    layers: [
      {
        id: "simple-tiles",
        type: "raster",
        source: "raster-tiles",
        minzoom: 0,
        maxzoom: 19,
      },
    ],
  },
};

// Add client-side cache for GeoJSON data
const geojsonCache = new Map<
  string,
  { data: GeoJSON.FeatureCollection; timestamp: number }
>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

// Add loading state type
interface LoadingState {
  isLoading: boolean;
  progress: number;
  currentFilter?: string;
}

interface GeographicBoundary {
  type: "country" | "state" | "county" | "city" | "zipcode";
  id: string;
  name: string;
  bounds?: [[number, number], [number, number]];
}

export function MapDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<FilterType | null>(null);
  const [mapData, setMapData] = useState<MapData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleFilterSelect = (filter: FilterType) => {
    setSelectedFilter(filter);
    fetchMapData(filter);
  };

  const fetchMapData = async (filter: FilterType) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/market-data?filter=${filter}`);
      if (!response.ok) {
        throw new Error("Failed to fetch market data");
      }
      const data = await response.json();
      setMapData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative h-full w-full">
      <DashboardSidebar
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        activeFilter={selectedFilter}
        onFilterSelect={handleFilterSelect}
      />

      <div className={`h-full ${isSidebarOpen ? "ml-[300px]" : "ml-[50px]"}`}>
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
              <p className="text-gray-600">Loading market data...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <p className="text-red-500">{error}</p>
              <button
                onClick={() => selectedFilter && fetchMapData(selectedFilter)}
                className="mt-4 rounded bg-orange-500 px-4 py-2 text-white hover:bg-orange-600"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : (
          <div className="h-full w-full">
            {mapData ? (
              <MapComponent data={mapData} filter={selectedFilter} />
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-gray-600">
                  Select a metric to view market data
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
