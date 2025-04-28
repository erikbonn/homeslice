#!/usr/bin/env ts-node

/**
 * Market Data Update Script
 *
 * This script simulates a cron job that fetches the latest real estate market data
 * and updates the database. In a real implementation, this would:
 *
 * 1. Fetch data from MLS sources or real estate APIs
 * 2. Process and clean the data
 * 3. Store in a database
 * 4. Notify the API that new data is available
 *
 * For demonstration purposes, this script generates mock data and sends it to our API.
 *
 * Usage: npm run update-data
 */

import { generateMarketDataset } from "../src/lib/mock/marketDataGenerator";
import dotenv from "dotenv";
import fetch from "node-fetch";

// Load environment variables
dotenv.config();

const API_KEY = process.env.DATA_INGESTION_API_KEY;
const API_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

if (!API_KEY) {
  console.error("⚠️ DATA_INGESTION_API_KEY is not defined in the .env file");
  process.exit(1);
}

async function runMarketDataUpdate() {
  console.log("🔄 Starting market data update process...");

  try {
    // Generate fresh market data
    console.log("📊 Generating market data...");
    const marketData = generateMarketDataset(24);

    // Get most recent month's data
    const latestDate = new Date();
    latestDate.setDate(1); // First day of current month

    const monthIsoString = latestDate.toISOString().split("T")[0];
    console.log(`📅 Processing data for: ${monthIsoString}`);

    // Filter to just the latest month
    const latestMonthData = marketData.filter(
      (d) => d.timestamp === monthIsoString,
    );

    // In batches of 20 regions, update the data
    const batchSize = 20;
    for (let i = 0; i < latestMonthData.length; i += batchSize) {
      const batch = latestMonthData.slice(i, i + batchSize);

      console.log(
        `📤 Uploading batch ${i / batchSize + 1} of ${Math.ceil(latestMonthData.length / batchSize)}`,
      );

      // Send data to the API
      const response = await fetch(`${API_URL}/api/market-data`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
        },
        body: JSON.stringify({
          date: monthIsoString,
          data: batch,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `API returned error: ${response.status} - ${errorText}`,
        );
      }

      // Wait briefly between batches to avoid overwhelming the API
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log("✅ Market data update completed successfully.");
  } catch (error) {
    console.error(
      "❌ Error updating market data:",
      error instanceof Error ? error.message : String(error),
    );
    process.exit(1);
  }
}

// Run the update if this file is executed directly
if (require.main === module) {
  runMarketDataUpdate()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(
        "Unhandled error:",
        error instanceof Error ? error.message : String(error),
      );
      process.exit(1);
    });
}
