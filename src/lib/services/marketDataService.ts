import {
  generateMarketDataset,
  generateGeoJSON,
  type MarketDataPoint,
  mockRegions,
} from "../mock/marketDataGenerator";
import { FilterType } from "@/components/dashboard/filter-types";

// In-memory cache for market data
let marketDataCache: MarketDataPoint[] | null = null;
let dateCache: string[] | null = null;

// Color scales for different metrics
export const metricColorScales: Record<
  FilterType,
  { colors: string[]; steps: number[] }
> = {
  // Price metrics (green to red)
  [FilterType.MEDIAN_PRICE]: {
    colors: ["#e5f5e0", "#a1d99b", "#41ab5d", "#006d2c"],
    steps: [200000, 500000, 800000, 1200000],
  },
  [FilterType.PRICE_CHANGE]: {
    colors: [
      "#d73027",
      "#f46d43",
      "#fdae61",
      "#fee08b",
      "#d9ef8b",
      "#a6d96a",
      "#66bd63",
    ],
    steps: [-10, -5, 0, 5, 10, 15],
  },
  [FilterType.PRICE_PER_SQFT]: {
    colors: ["#e5f5e0", "#a1d99b", "#41ab5d", "#006d2c"],
    steps: [200, 400, 600, 800],
  },
  [FilterType.PRICE_CUTS]: {
    colors: ["#d9ef8b", "#a6d96a", "#66bd63", "#3288bd", "#5e4fa2"],
    steps: [10, 20, 30, 40],
  },

  // Time-based metrics (blue scale)
  [FilterType.DAYS_ON_MARKET]: {
    colors: ["#eff3ff", "#bdd7e7", "#6baed6", "#3182bd", "#08519c"],
    steps: [20, 40, 60, 80],
  },

  // Inventory metrics (orange to purple)
  [FilterType.INVENTORY]: {
    colors: ["#feedde", "#fdbe85", "#fd8d3c", "#e6550d", "#a63603"],
    steps: [100, 500, 1000, 2000],
  },
  [FilterType.MONTHS_SUPPLY]: {
    colors: ["#feedde", "#fdbe85", "#fd8d3c", "#e6550d", "#a63603"],
    steps: [2, 4, 6, 8],
  },

  // Transaction metrics (purple scale)
  [FilterType.TOTAL_SALES]: {
    colors: ["#f2f0f7", "#dadaeb", "#bcbddc", "#9e9ac8", "#756bb1", "#54278f"],
    steps: [100, 500, 1000, 2000, 4000],
  },
  [FilterType.NEW_LISTINGS]: {
    colors: ["#f2f0f7", "#dadaeb", "#bcbddc", "#9e9ac8", "#756bb1", "#54278f"],
    steps: [50, 200, 500, 1000, 2000],
  },
  [FilterType.PENDING_SALES]: {
    colors: ["#f2f0f7", "#dadaeb", "#bcbddc", "#9e9ac8", "#756bb1", "#54278f"],
    steps: [50, 200, 500, 1000, 2000],
  },
  [FilterType.CLOSED_SALES]: {
    colors: ["#f2f0f7", "#dadaeb", "#bcbddc", "#9e9ac8", "#756bb1", "#54278f"],
    steps: [50, 200, 500, 1000, 2000],
  },

  // List vs Sold (diverging)
  [FilterType.LIST_VS_SOLD]: {
    colors: [
      "#d73027",
      "#f46d43",
      "#fdae61",
      "#fee08b",
      "#d9ef8b",
      "#a6d96a",
      "#66bd63",
    ],
    steps: [92, 96, 98, 100, 102, 104],
  },

  // Affordability metrics (blue-purple)
  [FilterType.AFFORDABILITY_INDEX]: {
    colors: ["#feebe2", "#fbb4b9", "#f768a1", "#c51b8a", "#7a0177"],
    steps: [80, 100, 120, 140],
  },
  [FilterType.MORTGAGE_RATES]: {
    colors: ["#feebe2", "#fbb4b9", "#f768a1", "#c51b8a", "#7a0177"],
    steps: [3, 4, 5, 6, 7],
  },
  [FilterType.INCOME_TO_PRICE]: {
    colors: ["#feebe2", "#fbb4b9", "#f768a1", "#c51b8a", "#7a0177"],
    steps: [25, 35, 45, 55],
  },

  // Forecasting metrics (yellow to red)
  [FilterType.MARKET_HEAT]: {
    colors: [
      "#ffffcc",
      "#ffeda0",
      "#fed976",
      "#feb24c",
      "#fd8d3c",
      "#fc4e2a",
      "#e31a1c",
      "#b10026",
    ],
    steps: [20, 30, 40, 50, 60, 70, 80],
  },
  [FilterType.APPRECIATION_FORECAST]: {
    colors: [
      "#d73027",
      "#f46d43",
      "#fdae61",
      "#fee08b",
      "#d9ef8b",
      "#a6d96a",
      "#66bd63",
    ],
    steps: [-5, -2, 0, 2, 5, 8],
  },

  // Property type metrics (blue-green)
  [FilterType.SINGLE_FAMILY]: {
    colors: ["#edf8fb", "#b2e2e2", "#66c2a4", "#2ca25f", "#006d2c"],
    steps: [50, 200, 500, 1000],
  },
  [FilterType.CONDO]: {
    colors: ["#edf8fb", "#b2e2e2", "#66c2a4", "#2ca25f", "#006d2c"],
    steps: [20, 100, 300, 700],
  },
  [FilterType.TOWNHOUSE]: {
    colors: ["#edf8fb", "#b2e2e2", "#66c2a4", "#2ca25f", "#006d2c"],
    steps: [10, 50, 200, 500],
  },
  [FilterType.MULTI_FAMILY]: {
    colors: ["#edf8fb", "#b2e2e2", "#66c2a4", "#2ca25f", "#006d2c"],
    steps: [5, 25, 100, 300],
  },

  // Listing status metrics (blue-purple)
  [FilterType.FOR_SALE]: {
    colors: [
      "#f7fcfd",
      "#e0ecf4",
      "#bfd3e6",
      "#9ebcda",
      "#8c96c6",
      "#8c6bb1",
      "#88419d",
      "#6e016b",
    ],
    steps: [50, 200, 500, 1000, 2000, 3000, 4000],
  },
  [FilterType.SOLD]: {
    colors: [
      "#f7fcfd",
      "#e0ecf4",
      "#bfd3e6",
      "#9ebcda",
      "#8c96c6",
      "#8c6bb1",
      "#88419d",
      "#6e016b",
    ],
    steps: [50, 200, 500, 1000, 2000, 3000, 4000],
  },
  [FilterType.FORECLOSURE]: {
    colors: [
      "#f7fcfd",
      "#e0ecf4",
      "#bfd3e6",
      "#9ebcda",
      "#8c96c6",
      "#8c6bb1",
      "#88419d",
    ],
    steps: [10, 50, 100, 200, 300, 400],
  },
  [FilterType.NEW_CONSTRUCTION]: {
    colors: [
      "#f7fcfd",
      "#e0ecf4",
      "#bfd3e6",
      "#9ebcda",
      "#8c96c6",
      "#8c6bb1",
      "#88419d",
    ],
    steps: [20, 100, 200, 400, 600, 800],
  },
};

// Get the color scale steps for a specific metric as a MapLibre expression
export function getColorScaleExpression(
  metricType: FilterType,
  geoScope?: string,
): Array<string | number | Array<string | string[]>> {
  const { colors, steps } = metricColorScales[metricType];

  // Adjust steps based on geographic scope if needed
  let adjustedSteps = [...steps];

  // For smaller geographic areas, we might want to adjust the scale
  // This is optional and depends on your data distribution
  if (geoScope === "city" || geoScope === "zipcode") {
    // For city or zip level, adjust thresholds to be more granular
    // This is just an example - adjust based on your actual data
    adjustedSteps = steps.map((step) =>
      metricType === FilterType.MEDIAN_PRICE ? step * 0.8 : step,
    );
  }

  // Create a MapLibre interpolate expression
  // First value is the property to interpolate by
  const expression: Array<string | number | Array<string | string[]>> = [
    "interpolate",
    ["linear"],
    ["get", "value"],
  ];

  // Add steps and colors
  adjustedSteps.forEach((step, index) => {
    expression.push(step);
    expression.push(colors[index]);
  });

  // Add the last color for values beyond the last step
  if (adjustedSteps.length < colors.length) {
    expression.push(adjustedSteps[adjustedSteps.length - 1] * 1.5); // A value beyond the last step
    expression.push(colors[colors.length - 1]);
  }

  return expression;
}

// Get or generate market data
export async function getMarketData(): Promise<MarketDataPoint[]> {
  // Use cached data if available
  if (marketDataCache) {
    return marketDataCache;
  }

  // Generate new market data (simulates API call)
  // In a real app, this would be an API call to your backend
  return new Promise((resolve) => {
    // Simulate network delay
    setTimeout(() => {
      const data = generateMarketDataset(24); // 2 years of monthly data
      marketDataCache = data;
      resolve(data);
    }, 500);
  });
}

// Get GeoJSON for a specific filter and date
export async function getFilterGeoJSON(
  filter: FilterType,
  date: string,
  geoScope: string = "country",
  geoId?: string,
): Promise<GeoJSON.FeatureCollection> {
  try {
    // Fetch data from API endpoint with geographic scope parameters
    const params = new URLSearchParams({
      filter: filter,
      date: date,
    });

    // Add optional geographic scope parameters
    if (geoScope && geoScope !== "country") {
      params.append("geoScope", geoScope);
    }

    if (geoId) {
      params.append("geoId", geoId);
    }

    const response = await fetch(
      `/api/market-data?${params.toString()}`,
      { next: { revalidate: 3600 } }, // Cache for 1 hour
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data as GeoJSON.FeatureCollection;
  } catch (error) {
    console.error(`Error fetching GeoJSON for ${filter}:`, error);
    // Return empty feature collection as fallback
    return {
      type: "FeatureCollection",
      features: [],
    };
  }
}

// Get the latest available date in the data
export async function getLatestDate(): Promise<string> {
  if (dateCache && dateCache.length > 0) {
    return dateCache[dateCache.length - 1];
  }

  const dates = await getAvailableDates();
  return dates[dates.length - 1];
}

// Get all available dates
export async function getAvailableDates(): Promise<string[]> {
  if (dateCache) {
    return dateCache;
  }

  try {
    // This would be a real API call in production
    // For now, we'll generate dates locally
    const now = new Date();
    const dates: string[] = [];

    // Generate 24 months of dates (first of each month)
    for (let i = 0; i < 24; i++) {
      const date = new Date(now);
      date.setMonth(now.getMonth() - i);
      date.setDate(1);
      dates.unshift(date.toISOString().split("T")[0]);
    }

    // Sort chronologically
    const sortedDates = dates.sort();
    dateCache = sortedDates;

    return sortedDates;
  } catch (error) {
    console.error("Error fetching available dates:", error);
    return [];
  }
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
    // Fetch data from API endpoint
    const response = await fetch(
      `/api/market-data?filter=${metric}&date=${date}&regionId=${regionId}`,
      { next: { revalidate: 3600 } }, // Cache for 1 hour
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.metrics[metric] ?? null;
  } catch (error) {
    console.error(`Error fetching metric value:`, error);
    return null;
  }
}

// Generate a legend for a specific filter
export function generateLegend(filter: FilterType) {
  const { colors, steps } = metricColorScales[filter];

  if (!steps || steps.length === 0) {
    return [];
  }

  // Create legend items
  const legendItems = [];

  // First legend item for values below first step
  legendItems.push({
    color: colors[0],
    label: `< ${formatMetricValue(steps[0], filter)}`,
  });

  // Middle legend items
  for (let i = 0; i < steps.length - 1; i++) {
    legendItems.push({
      color: colors[i + 1],
      label: `${formatMetricValue(steps[i], filter)} - ${formatMetricValue(steps[i + 1], filter)}`,
    });
  }

  // Last legend item for values above last step
  legendItems.push({
    color: colors[colors.length - 1],
    label: `> ${formatMetricValue(steps[steps.length - 1], filter)}`,
  });

  return legendItems;
}

// Format metric values based on their type
export function formatMetricValue(value: number, metric: FilterType): string {
  if (value === null || value === undefined) return "N/A";

  switch (metric) {
    case FilterType.MEDIAN_PRICE:
      return `$${value.toLocaleString()}`;

    case FilterType.PRICE_CHANGE:
    case FilterType.LIST_VS_SOLD:
    case FilterType.APPRECIATION_FORECAST:
      return `${value}%`;

    case FilterType.PRICE_PER_SQFT:
      return `$${value}/sqft`;

    case FilterType.DAYS_ON_MARKET:
      return `${value} days`;

    case FilterType.MORTGAGE_RATES:
      return `${value}%`;

    case FilterType.MONTHS_SUPPLY:
      return `${value} months`;

    default:
      return value.toLocaleString();
  }
}
