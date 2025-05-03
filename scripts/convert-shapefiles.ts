import { exec } from "child_process";
import { promisify } from "util";
import { join } from "path";
import { mkdir } from "fs/promises";

const execAsync = promisify(exec);

// Define the shapefiles to convert with different simplification levels
const SHAPEFILES = [
  {
    input: "tl_2022_us_state.shp",
    output: "states.geojson",
    simplify: "5%",
    command:
      "-clean -simplify 5% keep-shapes -o format=geojson precision=0.0001",
  },
  {
    input: "tl_2022_us_county.shp",
    output: "counties.geojson",
    command:
      "-clean -simplify 10% keep-shapes -o format=geojson precision=0.0001",
  },
  {
    input: "tl_2022_us_uac10.shp",
    output: "cities.geojson",
    command:
      "-clean -simplify 10% keep-shapes -o format=geojson precision=0.0001",
  },
  {
    input: "tl_2022_us_zcta520.shp",
    output: "zipcodes.geojson",
    // Most aggressive optimization for zipcodes:
    // - Using Douglas-Peucker algorithm with 25% simplification
    // - Only keeping essential fields
    // - Higher precision value to reduce coordinate decimals
    // - Using visvalingam simplification as well
    command:
      "-clean -simplify visvalingam 25% -filter-fields ZCTA5CE20 -o format=geojson precision=0.001",
  },
];

async function convertShapefiles() {
  try {
    // Create output directory if it doesn't exist
    const outputDir = join(process.cwd(), "public", "geojson");
    await mkdir(outputDir, { recursive: true });

    // Process each shapefile
    for (const { input, output, command } of SHAPEFILES) {
      console.log(`Processing ${input}...`);

      const inputPath = join(process.cwd(), "public", "shapefiles", input);
      const outputPath = join(outputDir, output);

      // Run mapshaper with optimization settings
      const fullCommand = `mapshaper "${inputPath}" ${command} "${outputPath}"`;

      const { stdout, stderr } = await execAsync(fullCommand);

      if (stderr) {
        console.warn(`Warning for ${input}:`, stderr);
      }

      console.log(`Successfully converted ${input} to ${output}`);
    }

    console.log("All shapefiles converted successfully!");
  } catch (error) {
    console.error("Error converting shapefiles:", error);
    process.exit(1);
  }
}

// Run the conversion
void convertShapefiles();
