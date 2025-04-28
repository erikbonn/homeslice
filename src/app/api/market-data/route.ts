import { NextRequest, NextResponse } from "next/server";
import {
  generateGeoJSON,
  generateMarketDataset,
  type MarketDataPoint,
} from "@/lib/mock/marketDataGenerator";
import { FilterType } from "@/components/dashboard/filter-types";

// In-memory cache for mock data
let datasetCache: MarketDataPoint[] | null = null;

/**
 * GET handler for fetching market data
 *
 * Query parameters:
 * - filter: The FilterType to get data for
 * - date: The date to get data for (YYYY-MM-DD)
 * - geoScope: (Optional) Geographic scope (country, state, county, city, zipcode)
 * - geoId: (Optional) ID of the specific region to filter by
 * - regionId: (Optional) Specific region to fetch data for
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Get query parameters
    const filter = searchParams.get("filter");
    const date = searchParams.get("date");
    const geoScope = searchParams.get("geoScope");
    const geoId = searchParams.get("geoId");
    const regionId = searchParams.get("regionId");

    // Validate required parameters
    if (!filter) {
      return NextResponse.json(
        { error: "Missing required parameter: filter" },
        { status: 400 },
      );
    }

    if (!date) {
      return NextResponse.json(
        { error: "Missing required parameter: date" },
        { status: 400 },
      );
    }

    // Validate filter is a valid FilterType
    if (!Object.values(FilterType).includes(filter as FilterType)) {
      return NextResponse.json(
        { error: "Invalid filter type" },
        { status: 400 },
      );
    }

    // Initialize dataset cache if needed
    if (!datasetCache) {
      datasetCache = generateMarketDataset(24); // 2 years of monthly data
    }

    // Handle specific endpoints

    // GeoJSON data for map visualization
    if (!regionId) {
      let filteredDataset = [...datasetCache];

      // Apply geographic filtering if specified
      if (geoScope && geoId) {
        // Filter the dataset based on geographic scope
        switch (geoScope) {
          case "state":
            // Get state and neighboring states
            filteredDataset = filteredDataset.filter(
              (data) => data.regionType === "state",
            );
            break;
          case "county":
            // Get county and neighboring counties
            filteredDataset = filteredDataset.filter(
              (data) => data.regionType === "county",
            );
            break;
          case "city":
            // For cities, show the city and other cities in the same county
            filteredDataset = filteredDataset.filter(
              (data) => data.regionType === "city",
            );
            break;
          case "zipcode":
            // For zipcodes, show the zipcode and neighboring zipcodes
            filteredDataset = filteredDataset.filter(
              (data) => data.regionType === "zip",
            );
            break;
          default:
            // By default show all regions (country level)
            break;
        }
      }

      const geoJsonData = generateGeoJSON(
        filteredDataset,
        filter as FilterType,
        date,
      );

      return NextResponse.json(geoJsonData);
    }

    // Single region data
    const regionData = datasetCache.find(
      (d) => d.regionId === regionId && d.timestamp === date,
    );

    if (!regionData) {
      return NextResponse.json(
        { error: "Region data not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      id: regionData.regionId,
      name: regionData.regionName,
      timestamp: regionData.timestamp,
      metrics: regionData.metrics,
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * POST handler for future implementation of data ingestion
 * This would be used by a cron job to update market data
 */
export async function POST(request: NextRequest) {
  // Only allow in development for now
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not implemented" }, { status: 501 });
  }

  try {
    const body = await request.json();

    // Validate API key for security (would be implementation in production)
    const apiKey = request.headers.get("x-api-key");
    if (!apiKey || apiKey !== process.env.DATA_INGESTION_API_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // This is where you would process and store the incoming data
    // For now, we just return a success message
    console.log("Would process and store data:", body);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
