import type { Feature, FeatureCollection } from "geojson";
import { FilterType } from "@/components/dashboard/filter-types";

// Function to get boundary data from the API
export async function getBoundaryData(
  geoScope: string,
  geoId?: string,
): Promise<FeatureCollection | null> {
  try {
    const params = new URLSearchParams();
    params.append("geoScope", geoScope);
    if (geoId) {
      params.append("geoId", geoId);
    }

    const response = await fetch(`/api/shapefile?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch boundary data: ${response.statusText}`);
    }

    const data = (await response.json()) as FeatureCollection;
    return data;
  } catch (error) {
    console.error(`Error getting boundary data for ${geoScope}:`, error);
    return null;
  }
}

// Function to get market boundary data
export async function getMarketBoundaryData(
  marketId: string,
): Promise<FeatureCollection | null> {
  try {
    const response = await fetch(`/api/market-boundary/${marketId}`);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch market boundary data: ${response.statusText}`,
      );
    }

    const data = (await response.json()) as FeatureCollection;
    return data;
  } catch (error) {
    console.error(`Error getting market boundary data for ${marketId}:`, error);
    return null;
  }
}

// Function to get combined boundary data
export async function getCombinedBoundaryData(
  geoScope: string,
  geoId: string,
  marketId: string,
): Promise<FeatureCollection | null> {
  try {
    const [boundaryData, marketData] = await Promise.all([
      getBoundaryData(geoScope, geoId),
      getMarketBoundaryData(marketId),
    ]);

    if (!boundaryData || !marketData) {
      return null;
    }

    // Combine the features from both GeoJSON objects
    const combinedFeatures = [...boundaryData.features, ...marketData.features];

    return {
      type: "FeatureCollection",
      features: combinedFeatures,
    };
  } catch (error) {
    console.error("Error getting combined boundary data:", error);
    return null;
  }
}

// Function to get neighboring boundaries
export async function getNeighboringBoundaries(
  geoScope: string,
  geoId: string,
): Promise<FeatureCollection | null> {
  try {
    // Get the main boundary
    const mainBoundary = await getBoundaryData(geoScope, geoId);

    if (!mainBoundary) {
      return null;
    }

    if (
      mainBoundary.type !== "FeatureCollection" ||
      !mainBoundary.features.length
    ) {
      return mainBoundary;
    }

    // Get all boundaries of the same type
    const allBoundaries = await getBoundaryData(geoScope);

    if (!allBoundaries) {
      return null;
    }

    if (allBoundaries.type !== "FeatureCollection") {
      return allBoundaries;
    }

    // Find features that share a boundary with our main feature
    const neighboringFeatures = allBoundaries.features.filter((feature) => {
      if (!feature.properties) return false;
      return feature.properties.id !== geoId;
    });

    return {
      ...allBoundaries,
      features: neighboringFeatures,
    };
  } catch (error) {
    console.error(
      `Error getting neighboring boundaries for ${geoScope}:`,
      error,
    );
    return null;
  }
}
