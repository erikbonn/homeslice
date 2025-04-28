import { FilterType } from "@/components/dashboard/filter-types";

// Geographic structure for mock data
type Coordinate = [number, number]; // [longitude, latitude]

interface Region {
  id: string;
  name: string;
  type: "state" | "county" | "city" | "zip";
  center: Coordinate;
  // Simplified polygon boundary for rendering
  // In a real app, you might use full GeoJSON polygons
  bounds: Coordinate[];
}

export interface MarketDataPoint {
  regionId: string;
  regionName: string;
  regionType: "state" | "county" | "city" | "zip";
  center: Coordinate;
  bounds: Coordinate[];
  timestamp: string; // ISO date string
  metrics: Record<FilterType, number | null>;
}

// Mock regions (simplified for demo)
export const mockRegions: Region[] = [
  {
    id: "ca",
    name: "California",
    type: "state",
    center: [-119.4179, 36.7783],
    bounds: generateBoxAroundPoint([-119.4179, 36.7783], 5),
  },
  {
    id: "tx",
    name: "Texas",
    type: "state",
    center: [-99.9018, 31.9686],
    bounds: generateBoxAroundPoint([-99.9018, 31.9686], 5),
  },
  {
    id: "ny",
    name: "New York",
    type: "state",
    center: [-75.0152, 43.2994],
    bounds: generateBoxAroundPoint([-75.0152, 43.2994], 3),
  },
  {
    id: "fl",
    name: "Florida",
    type: "state",
    center: [-81.5158, 27.6648],
    bounds: generateBoxAroundPoint([-81.5158, 27.6648], 3),
  },
  {
    id: "orange-ca",
    name: "Orange County",
    type: "county",
    center: [-117.7675, 33.7175],
    bounds: generateBoxAroundPoint([-117.7675, 33.7175], 1),
  },
  {
    id: "la-ca",
    name: "Los Angeles County",
    type: "county",
    center: [-118.2437, 34.0522],
    bounds: generateBoxAroundPoint([-118.2437, 34.0522], 1.5),
  },
  {
    id: "sf-ca",
    name: "San Francisco",
    type: "city",
    center: [-122.4194, 37.7749],
    bounds: generateBoxAroundPoint([-122.4194, 37.7749], 0.3),
  },
  {
    id: "sd-ca",
    name: "San Diego",
    type: "city",
    center: [-117.1611, 32.7157],
    bounds: generateBoxAroundPoint([-117.1611, 32.7157], 0.5),
  },
  {
    id: "nyc-ny",
    name: "New York City",
    type: "city",
    center: [-74.006, 40.7128],
    bounds: generateBoxAroundPoint([-74.006, 40.7128], 0.3),
  },
  {
    id: "chi-il",
    name: "Chicago",
    type: "city",
    center: [-87.6298, 41.8781],
    bounds: generateBoxAroundPoint([-87.6298, 41.8781], 0.4),
  },
  {
    id: "hou-tx",
    name: "Houston",
    type: "city",
    center: [-95.3698, 29.7604],
    bounds: generateBoxAroundPoint([-95.3698, 29.7604], 0.6),
  },
  {
    id: "mia-fl",
    name: "Miami",
    type: "city",
    center: [-80.1918, 25.7617],
    bounds: generateBoxAroundPoint([-80.1918, 25.7617], 0.3),
  },
  // Adding some zip codes
  {
    id: "94103",
    name: "94103",
    type: "zip",
    center: [-122.4167, 37.775],
    bounds: generateBoxAroundPoint([-122.4167, 37.775], 0.05),
  },
  {
    id: "90210",
    name: "90210",
    type: "zip",
    center: [-118.4034, 34.0901],
    bounds: generateBoxAroundPoint([-118.4034, 34.0901], 0.08),
  },
  {
    id: "10001",
    name: "10001",
    type: "zip",
    center: [-73.995, 40.7501],
    bounds: generateBoxAroundPoint([-73.995, 40.7501], 0.04),
  },
];

// Helper function to generate a box around a point
function generateBoxAroundPoint(
  center: Coordinate,
  size: number,
): Coordinate[] {
  const [lon, lat] = center;
  return [
    [lon - size, lat - size],
    [lon + size, lat - size],
    [lon + size, lat + size],
    [lon - size, lat + size],
    [lon - size, lat - size], // Close the loop
  ];
}

// Generate a range of dates for time-series data
function generateDateRange(months: number): string[] {
  const dates: string[] = [];
  const now = new Date();

  for (let i = 0; i < months; i++) {
    const date = new Date(now);
    date.setMonth(now.getMonth() - i);
    date.setDate(1); // First day of month
    dates.unshift(date.toISOString().split("T")[0]);
  }

  return dates;
}

// Base metric values - realistic starting points for different metrics
const baseMetricValues: Record<FilterType, { min: number; max: number }> = {
  [FilterType.MEDIAN_PRICE]: { min: 200000, max: 1500000 },
  [FilterType.PRICE_CHANGE]: { min: -15, max: 20 },
  [FilterType.DAYS_ON_MARKET]: { min: 10, max: 120 },
  [FilterType.INVENTORY]: { min: 50, max: 5000 },
  [FilterType.MONTHS_SUPPLY]: { min: 1, max: 12 },
  [FilterType.TOTAL_SALES]: { min: 20, max: 5000 },
  [FilterType.NEW_LISTINGS]: { min: 10, max: 3000 },
  [FilterType.PENDING_SALES]: { min: 15, max: 2500 },
  [FilterType.CLOSED_SALES]: { min: 10, max: 4500 },
  [FilterType.LIST_VS_SOLD]: { min: 90, max: 110 }, // percentage
  [FilterType.PRICE_PER_SQFT]: { min: 100, max: 1200 },
  [FilterType.PRICE_CUTS]: { min: 5, max: 60 }, // percentage of listings with cuts
  [FilterType.AFFORDABILITY_INDEX]: { min: 60, max: 180 },
  [FilterType.MORTGAGE_RATES]: { min: 3, max: 8 },
  [FilterType.INCOME_TO_PRICE]: { min: 20, max: 60 }, // percentage
  [FilterType.MARKET_HEAT]: { min: 1, max: 100 },
  [FilterType.APPRECIATION_FORECAST]: { min: -5, max: 15 },
  [FilterType.SINGLE_FAMILY]: { min: 10, max: 3000 }, // inventory
  [FilterType.CONDO]: { min: 5, max: 2000 }, // inventory
  [FilterType.TOWNHOUSE]: { min: 3, max: 1500 }, // inventory
  [FilterType.MULTI_FAMILY]: { min: 1, max: 1000 }, // inventory
  [FilterType.FOR_SALE]: { min: 20, max: 5000 }, // listings
  [FilterType.SOLD]: { min: 10, max: 4000 }, // recent sales
  [FilterType.FORECLOSURE]: { min: 0, max: 500 }, // foreclosures
  [FilterType.NEW_CONSTRUCTION]: { min: 0, max: 1000 }, // new builds
};

// Generate mock data for a specified metric for a region over time
function generateMetricTimeSeries(
  metricType: FilterType,
  months: number,
  regionType: "state" | "county" | "city" | "zip",
  regionPriceLevel: "low" | "medium" | "high" = "medium",
): number[] {
  // Get base range for this metric
  const { min, max } = baseMetricValues[metricType];

  // Adjust base values based on region type and price level
  let adjustedMin = min;
  let adjustedMax = max;

  // Price level adjustments
  const multipliers = {
    low: 0.7,
    medium: 1.0,
    high: 1.5,
  };

  // Region type adjustments - larger regions have different scales
  const typeAdjustments: Record<string, number> = {
    state: 1.2,
    county: 1.0,
    city: 0.8,
    zip: 0.6,
  };

  adjustedMin *= multipliers[regionPriceLevel] * typeAdjustments[regionType];
  adjustedMax *= multipliers[regionPriceLevel] * typeAdjustments[regionType];

  // Special case for percentages and rates - don't adjust as much
  if (
    metricType === FilterType.PRICE_CHANGE ||
    metricType === FilterType.LIST_VS_SOLD ||
    metricType === FilterType.MORTGAGE_RATES ||
    metricType === FilterType.APPRECIATION_FORECAST
  ) {
    adjustedMin = min * (1 + (multipliers[regionPriceLevel] - 1) * 0.3);
    adjustedMax = max * (1 + (multipliers[regionPriceLevel] - 1) * 0.3);
  }

  // Generate a time series with some randomness but consistent trends
  const values: number[] = [];

  // Start with a random value in our range
  let currentValue = adjustedMin + Math.random() * (adjustedMax - adjustedMin);

  // Trend direction and volatility
  const trendDirection = Math.random() > 0.5 ? 1 : -1;
  const volatility = (adjustedMax - adjustedMin) * 0.05; // 5% of range

  // Some metrics have seasonal patterns
  const hasSeasonality = [
    FilterType.MEDIAN_PRICE,
    FilterType.INVENTORY,
    FilterType.TOTAL_SALES,
    FilterType.NEW_LISTINGS,
  ].includes(metricType);

  for (let i = 0; i < months; i++) {
    // Apply trend
    const trend = trendDirection * (adjustedMax - adjustedMin) * 0.01; // 1% trend per month

    // Apply seasonality if applicable
    let seasonality = 0;
    if (hasSeasonality) {
      // Simple sine wave seasonality with 12-month period
      seasonality =
        Math.sin(((i % 12) / 12) * 2 * Math.PI) *
        (adjustedMax - adjustedMin) *
        0.08;
    }

    // Apply randomness
    const randomness = (Math.random() - 0.5) * 2 * volatility;

    // Update value
    currentValue = Math.max(
      adjustedMin,
      Math.min(adjustedMax, currentValue + trend + seasonality + randomness),
    );

    // Round appropriately based on metric type
    if (
      metricType === FilterType.MEDIAN_PRICE ||
      metricType === FilterType.TOTAL_SALES ||
      metricType === FilterType.INVENTORY ||
      metricType === FilterType.NEW_LISTINGS ||
      metricType === FilterType.PENDING_SALES ||
      metricType === FilterType.CLOSED_SALES ||
      metricType === FilterType.SINGLE_FAMILY ||
      metricType === FilterType.CONDO ||
      metricType === FilterType.TOWNHOUSE ||
      metricType === FilterType.MULTI_FAMILY ||
      metricType === FilterType.FOR_SALE ||
      metricType === FilterType.SOLD ||
      metricType === FilterType.FORECLOSURE ||
      metricType === FilterType.NEW_CONSTRUCTION
    ) {
      currentValue = Math.round(currentValue);
    } else {
      // For percentages and rates, round to 1 decimal place
      currentValue = Math.round(currentValue * 10) / 10;
    }

    values.push(currentValue);
  }

  return values;
}

// Price levels for different regions to ensure realistic data
const regionPriceLevels: Record<string, "low" | "medium" | "high"> = {
  ca: "high",
  tx: "medium",
  ny: "high",
  fl: "medium",
  "orange-ca": "high",
  "la-ca": "high",
  "sf-ca": "high",
  "sd-ca": "high",
  "nyc-ny": "high",
  "chi-il": "medium",
  "hou-tx": "medium",
  "mia-fl": "medium",
  "94103": "high", // SF zip
  "90210": "high", // Beverly Hills
  "10001": "high", // NYC zip
};

// Generate a complete dataset for all regions, metrics, and time periods
export function generateMarketDataset(months: number = 24): MarketDataPoint[] {
  const dates = generateDateRange(months);
  const dataset: MarketDataPoint[] = [];

  // For each region
  mockRegions.forEach((region) => {
    const priceLevel = regionPriceLevels[region.id] || "medium";

    // Generate metrics for each time period
    const metricValues: Record<FilterType, number[]> = {} as Record<
      FilterType,
      number[]
    >;

    // Generate time series for each metric
    Object.values(FilterType).forEach((metricType) => {
      metricValues[metricType] = generateMetricTimeSeries(
        metricType,
        months,
        region.type,
        priceLevel,
      );
    });

    // Create data points for each date
    dates.forEach((date, i) => {
      const metrics: Record<FilterType, number | null> = {} as Record<
        FilterType,
        number | null
      >;

      // Set values for each metric at this time point
      Object.values(FilterType).forEach((metricType) => {
        metrics[metricType] = metricValues[metricType][i];
      });

      // Add data point to dataset
      dataset.push({
        regionId: region.id,
        regionName: region.name,
        regionType: region.type,
        center: region.center,
        bounds: region.bounds,
        timestamp: date,
        metrics,
      });
    });
  });

  return dataset;
}

// Generate GeoJSON from market data for a specific filter and date
export function generateGeoJSON(
  marketData: MarketDataPoint[],
  filter: FilterType,
  date: string,
) {
  // Filter data for the specific date
  const filteredData = marketData.filter(
    (dataPoint) => dataPoint.timestamp === date,
  );

  // Create GeoJSON feature collection
  return {
    type: "FeatureCollection",
    features: filteredData.map((dataPoint) => ({
      type: "Feature",
      id: dataPoint.regionId,
      properties: {
        id: dataPoint.regionId,
        name: dataPoint.regionName,
        type: dataPoint.regionType,
        value: dataPoint.metrics[filter],
        filter: filter,
        date: date,
      },
      geometry: {
        type: "Polygon",
        coordinates: [dataPoint.bounds],
      },
    })),
  };
}
