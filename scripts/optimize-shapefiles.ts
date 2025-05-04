/**
 * Shapefile Optimization Script
 *
 * This script converts shapefiles into optimized GeoJSON files for use in the application.
 *
 * What it does:
 * 1. Reads shapefiles from public/shapefiles directory
 * 2. Converts them to optimized GeoJSON format
 * 3. Saves the results in public/geojson directory
 *
 * The script handles:
 * - Country boundaries (counties)
 * - State boundaries
 * - City boundaries
 * - ZIP code boundaries
 *
 * Each GeoJSON file will be named according to its type (e.g., country.geojson, state.geojson, etc.)
 *
 * Usage:
 * 1. Place shapefiles in public/shapefiles directory
 * 2. Run: bun run optimize-shapefiles
 * 3. Optimized GeoJSON files will be created in public/geojson
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import shapefile from "shapefile";
import type { FeatureCollection } from "geojson";

// Define the shapefile paths
const SHAPEFILE_DIR = join(process.cwd(), "public", "shapefiles");
const OUTPUT_DIR = join(process.cwd(), "public", "geojson");

// Define all shapefiles to process
const SHAPEFILES = {
  country: "tl_2022_us_county.shp", // County boundaries for the entire US
  state: "tl_2022_us_state.shp", // State boundaries
  city: "tl_2022_us_place.shp", // City boundaries
  zipcode: "tl_2022_us_zcta520.shp", // ZIP code boundaries
};

// Property mappings for each shapefile type
const PROPERTY_MAPPINGS = {
  country: {
    id: "GEOID",
    name: "NAME",
  },
  state: {
    id: "STATEFP",
    name: "NAME",
  },
  city: {
    id: "PLACEFP",
    name: "NAME",
  },
  zipcode: {
    id: "ZCTA5CE20",
    name: "NAME",
  },
};

// Safety limits
const MAX_FEATURES = 100000; // Increased limit to see if it naturally stops
const MAX_PROCESSING_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds

// Ensure output directory exists
if (!existsSync(OUTPUT_DIR)) {
  mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Add type definitions for shapefile features
interface ShapefileProperties {
  [key: string]: string | number | null | undefined;
  GEOID?: string;
  STATEFP?: string;
  PLACEFP?: string;
  ZCTA5CE20?: string;
  NAME?: string;
}

interface ShapefileFeature {
  type: "Feature";
  properties: ShapefileProperties;
  geometry: GeoJSON.Geometry;
}

async function optimizeShapefile(name: string, shapefilePath: string) {
  console.log(`Processing ${name} shapefile...`);
  console.log(`Shapefile path: ${shapefilePath}`);
  console.log(`File exists: ${existsSync(shapefilePath)}`);

  const startTime = Date.now();
  let featureCount = 0;
  let lastFeatureTime = Date.now();
  const uniqueIds = new Set<string>();
  const propertyMapping =
    PROPERTY_MAPPINGS[name as keyof typeof PROPERTY_MAPPINGS];

  try {
    // Read the shapefile
    console.log("Opening shapefile...");
    const source = await shapefile.open(shapefilePath);
    console.log("Shapefile opened successfully");

    // Read all features
    const features = [];
    let result;

    // Add progress indicator
    const progressInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      console.log(`Processed ${featureCount} features in ${elapsed}s...`);
      console.log(`Unique IDs found: ${uniqueIds.size}`);

      // Check if we're stuck
      if (Date.now() - lastFeatureTime > 30000) {
        // 30 seconds without new features
        console.error(
          "No new features processed in 30 seconds. Possible infinite loop.",
        );
        process.exit(1);
      }
    }, 5000); // Log progress every 5 seconds

    try {
      while ((result = await source.read()) && !result.done) {
        // Safety checks
        if (featureCount >= MAX_FEATURES) {
          console.error(
            `Reached maximum feature limit (${MAX_FEATURES}). Stopping.`,
          );
          break;
        }

        if (Date.now() - startTime > MAX_PROCESSING_TIME) {
          console.error(
            `Exceeded maximum processing time (${MAX_PROCESSING_TIME / 1000}s). Stopping.`,
          );
          break;
        }

        const feature = result.value;

        // Log the first feature's structure for debugging
        if (featureCount === 0) {
          console.log(
            "First feature structure:",
            JSON.stringify(feature, null, 2),
          );
          console.log("First feature type:", typeof feature);
          console.log("First feature keys:", Object.keys(feature));
        }

        // Log the feature's structure periodically
        if (featureCount % 1000 === 0) {
          console.log(`Processed ${featureCount} features...`);
          console.log(
            `Current feature structure:`,
            JSON.stringify(feature, null, 2),
          );
          console.log(`Current feature type:`, typeof feature);
          console.log(`Current feature keys:`, Object.keys(feature));
        }

        features.push(feature);
        featureCount++;
        lastFeatureTime = Date.now();
      }
    } catch (readError) {
      console.error("Error reading features:", readError);
      throw readError;
    } finally {
      clearInterval(progressInterval);
    }

    console.log(`Total features read: ${featureCount}`);
    console.log(`Unique IDs found: ${uniqueIds.size}`);

    // Create GeoJSON FeatureCollection
    const geojson: FeatureCollection = {
      type: "FeatureCollection",
      features: features.map((feature) => {
        const shapeFeature = feature as unknown as ShapefileFeature;
        return {
          type: "Feature",
          geometry: shapeFeature.geometry,
          properties: {
            id: String(shapeFeature.properties[propertyMapping.id] ?? ""),
            name: String(shapeFeature.properties[propertyMapping.name] ?? ""),
            type: name,
          },
        };
      }),
    };

    // Write to file
    const outputPath = join(OUTPUT_DIR, `${name}.geojson`);
    console.log(`Writing to ${outputPath}...`);
    writeFileSync(outputPath, JSON.stringify(geojson));

    const totalTime = Math.floor((Date.now() - startTime) / 1000);
    console.log(
      `Successfully processed ${name} shapefile (${featureCount} features) in ${totalTime}s. Output saved to ${outputPath}`,
    );
  } catch (error) {
    console.error(`Error processing ${name} shapefile:`, error);
    if (error instanceof Error) {
      console.error("Error details:", error.message);
      console.error("Stack trace:", error.stack);
    }
  }
}

async function main() {
  console.log("Starting shapefile optimization...");

  // Process each shapefile
  for (const [name, filename] of Object.entries(SHAPEFILES)) {
    const shapefilePath = join(SHAPEFILE_DIR, filename);
    if (existsSync(shapefilePath)) {
      await optimizeShapefile(name, shapefilePath);
    } else {
      console.warn(`Shapefile not found: ${shapefilePath}`);
    }
  }

  console.log("Shapefile optimization complete!");
}

main().catch(console.error);
