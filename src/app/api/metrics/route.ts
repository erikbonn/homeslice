import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

// Path to metrics data file
const DATA_DIR = join(process.cwd(), "public", "data");
const METRICS_FILE = join(DATA_DIR, "metrics.json");

export async function GET() {
  try {
    const data = readFileSync(METRICS_FILE, "utf-8");
    const metricsData = JSON.parse(data);
    return NextResponse.json(metricsData);
  } catch (error) {
    console.error("Error loading metrics data:", error);
    return NextResponse.json(
      { error: "Failed to load metrics data" },
      { status: 500 },
    );
  }
}
