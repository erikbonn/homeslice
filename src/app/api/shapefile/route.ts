import { NextResponse } from "next/server";
import { join } from "path";
import { readFileSync, existsSync } from "fs";
import type { FeatureCollection } from "geojson";

// Define the available boundary types and their mappings
const BOUNDARY_TYPES = {
  states: "state",
  counties: "country",
  cities: "city",
  zipcodes: "zipcode",
} as const;

type BoundaryType = keyof typeof BOUNDARY_TYPES;

// Cache for GeoJSON files with TTL
const geojsonCache = new Map<
  string,
  { data: FeatureCollection; timestamp: number }
>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    // Try to get the type from either 'type' or 'geoScope' parameter
    const type = (searchParams.get("type") ??
      searchParams.get("geoScope")) as BoundaryType;

    // Validate the boundary type
    if (!type || !(type in BOUNDARY_TYPES)) {
      return NextResponse.json(
        {
          error:
            "Invalid boundary type. Must be one of: states, counties, cities, zipcodes",
        },
        { status: 400 },
      );
    }

    // Check cache first
    const cachedData = geojsonCache.get(type);
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
      return NextResponse.json(cachedData.data, {
        headers: {
          "Cache-Control": "public, max-age=86400", // 24 hours
          "X-Cache": "HIT",
        },
      });
    }

    // Get the corresponding GeoJSON file name
    const geojsonFileName = BOUNDARY_TYPES[type];
    const geojsonPath = join(
      process.cwd(),
      "public",
      "geojson",
      `${geojsonFileName}.geojson`,
    );

    // Check if the file exists
    if (!existsSync(geojsonPath)) {
      return NextResponse.json(
        {
          error: `Boundary data not found for type: ${type}. Please run 'bun run optimize-shapefiles' first.`,
        },
        { status: 404 },
      );
    }

    // Read the pre-optimized GeoJSON file
    const geojsonData = JSON.parse(
      readFileSync(geojsonPath, "utf-8"),
    ) as FeatureCollection;

    // Cache the data with timestamp
    geojsonCache.set(type, {
      data: geojsonData,
      timestamp: Date.now(),
    });

    return NextResponse.json(geojsonData, {
      headers: {
        "Cache-Control": "public, max-age=86400", // 24 hours
        "X-Cache": "MISS",
      },
    });
  } catch (error) {
    console.error("Error fetching boundary data:", error);
    return NextResponse.json(
      { error: "Failed to fetch boundary data" },
      { status: 500 },
    );
  }
}
