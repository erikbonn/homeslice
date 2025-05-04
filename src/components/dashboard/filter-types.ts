// Define all the possible filter types that can be applied in the dashboard

export enum FilterType {
  // Market Overview Filters
  MEDIAN_PRICE = "median_price",
  PRICE_CHANGE = "price_change",
  DAYS_ON_MARKET = "days_on_market",
  INVENTORY = "inventory",
  MONTHS_SUPPLY = "months_supply",

  // Transaction Filters
  TOTAL_SALES = "total_sales",
  NEW_LISTINGS = "new_listings",
  PENDING_SALES = "pending_sales",
  CLOSED_SALES = "closed_sales",

  // Price Filters
  LIST_VS_SOLD = "list_vs_sold",
  PRICE_PER_SQFT = "price_per_sqft",
  PRICE_CUTS = "price_cuts",

  // Affordability Filters
  AFFORDABILITY_INDEX = "affordability_index",
  MORTGAGE_RATES = "mortgage_rates",
  INCOME_TO_PRICE = "income_to_price",

  // Predictive Filters
  MARKET_HEAT = "market_heat",
  APPRECIATION_FORECAST = "appreciation_forecast",

  // Property Types
  SINGLE_FAMILY = "single_family",
  CONDO = "condo",
  TOWNHOUSE = "townhouse",
  MULTI_FAMILY = "multi_family",

  // Status Types
  FOR_SALE = "for_sale",
  SOLD = "sold",
  FORECLOSURE = "foreclosure",
  NEW_CONSTRUCTION = "new_construction",
}

// Group filters by category for UI organization
export const filterCategories = {
  "Market Overview": [
    FilterType.MEDIAN_PRICE,
    FilterType.PRICE_CHANGE,
    FilterType.DAYS_ON_MARKET,
    FilterType.INVENTORY,
    FilterType.MONTHS_SUPPLY,
  ],
  Transactions: [
    FilterType.TOTAL_SALES,
    FilterType.NEW_LISTINGS,
    FilterType.PENDING_SALES,
    FilterType.CLOSED_SALES,
  ],
  "Price Metrics": [
    FilterType.LIST_VS_SOLD,
    FilterType.PRICE_PER_SQFT,
    FilterType.PRICE_CUTS,
  ],
  Affordability: [
    FilterType.AFFORDABILITY_INDEX,
    FilterType.MORTGAGE_RATES,
    FilterType.INCOME_TO_PRICE,
  ],
  "Market Forecast": [FilterType.MARKET_HEAT, FilterType.APPRECIATION_FORECAST],
  "Property Types": [
    FilterType.SINGLE_FAMILY,
    FilterType.CONDO,
    FilterType.TOWNHOUSE,
    FilterType.MULTI_FAMILY,
  ],
  "Listing Status": [
    FilterType.FOR_SALE,
    FilterType.SOLD,
    FilterType.FORECLOSURE,
    FilterType.NEW_CONSTRUCTION,
  ],
};

// Friendly display names for filter types
export const filterNames: Record<FilterType, string> = {
  [FilterType.MEDIAN_PRICE]: "Median Price",
  [FilterType.PRICE_CHANGE]: "Price Change (%)",
  [FilterType.DAYS_ON_MARKET]: "Days on Market",
  [FilterType.INVENTORY]: "Active Inventory",
  [FilterType.MONTHS_SUPPLY]: "Months of Supply",
  [FilterType.TOTAL_SALES]: "Total Sales",
  [FilterType.NEW_LISTINGS]: "New Listings",
  [FilterType.PENDING_SALES]: "Pending Sales",
  [FilterType.CLOSED_SALES]: "Closed Sales",
  [FilterType.LIST_VS_SOLD]: "List vs. Sold Price",
  [FilterType.PRICE_PER_SQFT]: "Price per Sq.Ft.",
  [FilterType.PRICE_CUTS]: "Price Reductions",
  [FilterType.AFFORDABILITY_INDEX]: "Affordability Index",
  [FilterType.MORTGAGE_RATES]: "Mortgage Rates",
  [FilterType.INCOME_TO_PRICE]: "Income to Price Ratio",
  [FilterType.MARKET_HEAT]: "Market Heat Index",
  [FilterType.APPRECIATION_FORECAST]: "Appreciation Forecast",
  [FilterType.SINGLE_FAMILY]: "Single Family",
  [FilterType.CONDO]: "Condos/Co-ops",
  [FilterType.TOWNHOUSE]: "Townhomes",
  [FilterType.MULTI_FAMILY]: "Multi-Family",
  [FilterType.FOR_SALE]: "For Sale",
  [FilterType.SOLD]: "Recently Sold",
  [FilterType.FORECLOSURE]: "Foreclosures",
  [FilterType.NEW_CONSTRUCTION]: "New Construction",
};
