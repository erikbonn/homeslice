import { execSync } from "child_process";
import { join } from "path";
import { existsSync, mkdirSync } from "fs";

// Define the shapefiles to convert
const shapefiles = [
  {
    name: "states",
    path: "tl_2022_us_state.shp",
    simplify: "5%", // States can be simplified more since they're larger
  },
  {
    name: "counties",
    path: "tl_2022_us_county.shp",
    simplify: "10%", // Counties need more detail
  },
  {
    name: "cities",
    path: "tl_2022_us_uac10.shp",
    simplify: "15%", // Cities need more detail
  },
  {
    name: "zipcodes",
    path: "tl_2022_us_zcta520.shp",
    simplify: "20%", // Zipcodes need the most detail
  },
];

async function optimizeShapefile(
  inputPath: string,
  outputPath: string,
  simplify: string,
) {
  try {
    console.log(
      `Optimizing ${inputPath} to ${outputPath} with ${simplify} simplification...`,
    );

    // Create the command
    const command = `mapshaper ${inputPath} -clean -simplify ${simplify} -o format=geojson precision=0.0001 ${outputPath}`;

    // Execute the command
    execSync(command, { stdio: "inherit" });

    console.log(`Successfully optimized ${inputPath} to ${outputPath}`);
  } catch (error) {
    console.error(`Error optimizing ${inputPath}:`, error);
    throw error;
  }
}

async function main() {
  try {
    // Create the output directory if it doesn't exist
    const outputDir = join(process.cwd(), "public", "geojson");
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }

    // Process each shapefile
    for (const { name, path, simplify } of shapefiles) {
      const inputPath = join(process.cwd(), "public", "shapefiles", path);
      const outputPath = join(outputDir, `${name}.geojson`);

      // Check if input file exists
      if (!existsSync(inputPath)) {
        console.warn(`Input file not found: ${inputPath}`);
        continue;
      }

      await optimizeShapefile(inputPath, outputPath, simplify);
    }

    console.log("All shapefiles have been optimized successfully!");
  } catch (error) {
    console.error("Error in main process:", error);
    process.exit(1);
  }
}

void main();
