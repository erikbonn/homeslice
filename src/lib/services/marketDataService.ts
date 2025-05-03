import {
  generateMarketDataset,
  generateGeoJSON,
  type MarketDataPoint,
  mockRegions,
} from "../mock/marketDataGenerator";
import { FilterType } from "@/components/dashboard/filter-types";
import { getBoundaryData } from "@/lib/utils/shapefileUtils";
import type { GeoJSON } from "geojson";
import { readFileSync } from "fs";
import { join } from "path";

// In-memory cache for market data with TTL
const marketDataCache = new Map<
  string,
  { data: MarketDataPoint[]; timestamp: number }
>();
const dateCache = new Map<string, { dates: string[]; timestamp: number }>();
const geoJsonCache = new Map<
  string,
  { data: GeoJSON.FeatureCollection; timestamp: number }
>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

// Path to pre-generated GeoJSON files
const GEOJSON_DIR = join(process.cwd(), "public", "geojson");

// Add data file paths
const DATA_DIR = join(process.cwd(), "public", "data");
const METRICS_FILE = join(DATA_DIR, "metrics.json");

// Color scales for different metrics
const colorScales = {
  medianPrice: [
    "#FFEDA0",
    "#FED976",
    "#FEB24C",
    "#FD8D3C",
    "#FC4E2A",
    "#E31A1C",
    "#BD0026",
    "#800026",
  ],
  pricePerSqft: [
    "#F7FBFF",
    "#DEEBF7",
    "#C6DBEF",
    "#9ECAE1",
    "#6BAED6",
    "#4292C6",
    "#2171B5",
    "#08519C",
  ],
  daysOnMarket: [
    "#F7F4F9",
    "#E7E1EF",
    "#D4B9DA",
    "#C994C7",
    "#DF65B0",
    "#E7298A",
    "#CE1256",
    "#91003F",
  ],
  inventory: [
    "#F7FCF5",
    "#E5F5E0",
    "#C7E9C0",
    "#A1D99B",
    "#74C476",
    "#41AB5D",
    "#238B45",
    "#005A32",
  ],
};

interface FeatureProperties {
  id: string;
  name: string;
  type: string;
  value: number;
  filter: string;
  date: string;
}

interface RawFeatureProperties {
  id?: string;
  name?: string;
  [key: string]: unknown;
}

// Add interface for metric data
type MetricData = Record<string, Record<string, Record<FilterType, number>>>;

let metricsData: MetricData | null = null;

// Type guard to validate MetricData shape
function isMetricData(data: unknown): data is MetricData {
  if (!data || typeof data !== "object") return false;

  const candidate = data as Record<string, unknown>;
  if (!("metrics" in candidate)) return false;

  const metrics = candidate.metrics;
  if (!Array.isArray(metrics)) return false;

  // Add additional type checking for metrics array elements if needed
  return true;
}

// Load metrics data from API
async function loadMetricsData(): Promise<MetricData> {
  if (metricsData) return metricsData;

  try {
    const response = await fetch("/api/metrics");
    if (!response.ok) {
      throw new Error(`Failed to fetch metrics data: ${response.statusText}`);
    }
    const data: unknown = await response.json();

    if (!isMetricData(data)) {
      throw new Error("Invalid metrics data format received from API");
    }

    metricsData = data;
    return metricsData;
  } catch (error) {
    console.error("Error loading metrics data:", error);
    return {} as MetricData;
  }
}

// Get the color scale steps for a specific metric as a MapLibre expression
export function getColorScaleExpression(
  filter: string,
  geoScope = "country",
): [number, string][] {
  const scale =
    colorScales[filter as keyof typeof colorScales] || colorScales.medianPrice;

  // Adjust the number of stops based on geographic scope
  const numStops =
    geoScope === "zipcode"
      ? 8
      : geoScope === "city"
        ? 6
        : geoScope === "county"
          ? 4
          : 3;

  // Create color stops with evenly distributed values
  const colors = scale.slice(0, numStops);
  const step = 100 / (colors.length - 1);

  return colors.map((color, index) => [index * step, color]);
}

// Get or generate market data
export async function getMarketData(): Promise<MarketDataPoint[]> {
  const cacheKey = "market-data";
  const cachedData = marketDataCache.get(cacheKey);

  if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
    return cachedData.data;
  }

  // Generate new data
  const data = generateMarketDataset(12); // Reduced from 24 to 12 months
  marketDataCache.set(cacheKey, {
    data,
    timestamp: Date.now(),
  });
  return data;
}

// Add preloading state tracking
const preloadState = new Map<
  string,
  {
    status: "pending" | "loading" | "loaded" | "error";
    promise?: Promise<void>;
  }
>();

// Add preloading function
export async function preloadData(
  filters: FilterType[],
  dates: string[],
  geoScope = "country",
  geoId?: string,
): Promise<void> {
  const preloadKey = `${filters.join("-")}-${dates.join("-")}-${geoScope}-${geoId ?? ""}`;

  // Check if already preloading or loaded
  const existingState = preloadState.get(preloadKey);
  if (
    existingState?.status === "loading" ||
    existingState?.status === "loaded"
  ) {
    return existingState.promise;
  }

  // Create new preload state
  const preloadPromise = (async () => {
    try {
      preloadState.set(preloadKey, { status: "loading" });

      // Load metrics data first
      await loadMetricsData();

      // Preload GeoJSON data for each filter and date combination
      const preloadPromises = filters.flatMap((filter) =>
        dates.map((date) => getFilterGeoJSON(filter, date, geoScope, geoId)),
      );

      await Promise.all(preloadPromises);
      preloadState.set(preloadKey, { status: "loaded" });
    } catch (error) {
      console.error("Error preloading data:", error);
      preloadState.set(preloadKey, { status: "error" });
      throw error;
    }
  })();

  preloadState.set(preloadKey, { status: "loading", promise: preloadPromise });
  return preloadPromise;
}

// Add function to check preload status
export function getPreloadStatus(
  filters: FilterType[],
  dates: string[],
  geoScope = "country",
  geoId?: string,
): "pending" | "loading" | "loaded" | "error" {
  const preloadKey = `${filters.join("-")}-${dates.join("-")}-${geoScope}-${geoId ?? ""}`;
  return preloadState.get(preloadKey)?.status ?? "pending";
}

// Modify getFilterGeoJSON to check preload status
export async function getFilterGeoJSON(
  filter: string,
  date: string,
  geoScope = "country",
  geoId?: string,
): Promise<GeoJSON.FeatureCollection> {
  const cacheKey = `${filter}-${date}-${geoScope}-${geoId ?? ""}`;
  const cachedData = geoJsonCache.get(cacheKey);

  if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
    return cachedData.data;
  }

  // Check if data is being preloaded
  const preloadKey = `${filter}-${date}-${geoScope}-${geoId ?? ""}`;
  const preloadStatus = preloadState.get(preloadKey);

  if (preloadStatus?.status === "loading" && preloadStatus.promise) {
    await preloadStatus.promise;
    const cachedData = geoJsonCache.get(cacheKey);
    if (cachedData) {
      return cachedData.data;
    }
  }

  try {
    // Use the API endpoint instead of reading files directly
    const params = new URLSearchParams({
      filter,
      date,
      geoScope,
      ...(geoId && { geoId }),
    });

    const response = await fetch(`/api/market-data?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch market data: ${response.statusText}`);
    }

    const geoJsonData = (await response.json()) as GeoJSON.FeatureCollection;

    // Cache the result
    geoJsonCache.set(cacheKey, {
      data: geoJsonData,
      timestamp: Date.now(),
    });

    return geoJsonData;
  } catch (error) {
    console.error(`Error loading GeoJSON for ${filter}:`, error);
    return {
      type: "FeatureCollection",
      features: [],
    };
  }
}

// Get latest date
export async function getLatestDate(): Promise<string> {
  const cacheKey = "latest-date";
  const cachedData = dateCache.get(cacheKey);

  if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
    const latestDate = cachedData.dates[0];
    if (!latestDate) {
      throw new Error("No dates available in cache");
    }
    return latestDate;
  }

  const dates = await getAvailableDates();
  const latestDate = dates[0];
  if (!latestDate) {
    throw new Error("No dates available");
  }

  dateCache.set(cacheKey, {
    dates,
    timestamp: Date.now(),
  });

  return latestDate;
}

// Get all available dates
export async function getAvailableDates(): Promise<string[]> {
  const cacheKey = "available-dates";
  const cachedData = dateCache.get(cacheKey);

  if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
    return cachedData.dates;
  }

  const marketData = await getMarketData();
  if (!marketData.length) {
    return [];
  }

  const dates = Array.from(
    new Set(marketData.map((point) => point.timestamp)),
  ).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  if (!dates.length) {
    return [];
  }

  dateCache.set(cacheKey, {
    dates,
    timestamp: Date.now(),
  });

  return dates;
}

// Get region by ID
export function getRegionById(regionId: string) {
  return mockRegions.find((region) => region.id === regionId);
}

// Get metric value for a specific region, metric, and date
export async function getMetricValue(
  regionId: string,
  metric: FilterType,
  date: string,
): Promise<number | null> {
  try {
    const metrics = await loadMetricsData();
    return metrics[regionId]?.[date]?.[metric] ?? null;
  } catch (error) {
    console.error(`Error fetching metric value:`, error);
    return null;
  }
}

// Generate a legend for a specific filter
export function generateLegend(
  filter: string,
): Array<{ color: string; label: string }> {
  const scale =
    colorScales[filter as keyof typeof colorScales] || colorScales.medianPrice;
  return scale.map((color, i) => ({
    color,
    label: `${i * 100}-${(i + 1) * 100}`,
  }));
}

// Format metric values based on their type
export function formatMetricValue(value: number, filter: string): string {
  switch (filter) {
    case "medianPrice":
      return `$${value.toLocaleString()}`;
    case "pricePerSqft":
      return `$${value.toFixed(2)}/sqft`;
    case "daysOnMarket":
      return `${Math.round(value)} days`;
    case "inventory":
      return value.toLocaleString();
    default:
      return value.toString();
  }
}
