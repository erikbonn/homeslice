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
  console.log("[market-data] API request received");
  try {
    const searchParams = request.nextUrl.searchParams;

    // Get query parameters
    const filter = searchParams.get("filter");
    const date = searchParams.get("date");
    const geoScope = searchParams.get("geoScope");
    const geoId = searchParams.get("geoId");
    const regionId = searchParams.get("regionId");

    console.log("[market-data] Request parameters:", {
      filter,
      date,
      geoScope,
      geoId,
      regionId,
    });

    // Validate required parameters
    if (!filter) {
      console.error("[market-data] Missing required parameter: filter");
      return NextResponse.json(
        { error: "Missing required parameter: filter" },
        { status: 400 },
      );
    }

    if (!date) {
      console.error("[market-data] Missing required parameter: date");
      return NextResponse.json(
        { error: "Missing required parameter: date" },
        { status: 400 },
      );
    }

    // Validate filter is a valid FilterType
    if (!Object.values(FilterType).includes(filter as FilterType)) {
      console.error("[market-data] Invalid filter type:", filter);
      return NextResponse.json(
        { error: "Invalid filter type" },
        { status: 400 },
      );
    }

    // Initialize dataset cache if needed
    if (!datasetCache) {
      console.log("[market-data] Initializing dataset cache");
      datasetCache = generateMarketDataset(24); // 2 years of monthly data
    }

    if (!datasetCache) {
      console.error("[market-data] Failed to generate dataset");
      return NextResponse.json(
        { error: "Failed to generate data" },
        { status: 500 },
      );
    }

    // Handle specific endpoints
    if (!regionId) {
      console.log("[market-data] Generating GeoJSON data");
      let filteredDataset = [...datasetCache];

      // Apply geographic filtering if specified
      if (geoScope && geoId) {
        console.log("[market-data] Applying geographic filtering:", {
          geoScope,
          geoId,
        });
        // Filter the dataset based on geographic scope
        switch (geoScope) {
          case "state":
            filteredDataset = filteredDataset.filter(
              (data) => data.regionType === "state",
            );
            break;
          case "county":
            filteredDataset = filteredDataset.filter(
              (data) => data.regionType === "county",
            );
            break;
          case "city":
            filteredDataset = filteredDataset.filter(
              (data) => data.regionType === "city",
            );
            break;
          case "zipcode":
            filteredDataset = filteredDataset.filter(
              (data) => data.regionType === "zip",
            );
            break;
          default:
            break;
        }
      }

      const geoJsonData = generateGeoJSON(
        filteredDataset,
        filter as FilterType,
        date,
      );

      console.log(
        "[market-data] Generated GeoJSON with features:",
        geoJsonData.features.length,
      );
      return NextResponse.json(geoJsonData);
    }

    // Single region data
    console.log("[market-data] Fetching single region data:", {
      regionId,
      date,
    });
    const regionData = datasetCache.find(
      (d) => d.regionId === regionId && d.timestamp === date,
    );

    if (!regionData) {
      console.error("[market-data] Region data not found:", { regionId, date });
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
    console.error("[market-data] Error processing request:", error);
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
