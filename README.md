# Homeslice

Your slice of Real Estate data.

## Overview

Homeslice is a modern real estate analytics platform that provides visual market insights through an interactive dashboard. The application allows users to explore housing market trends through various metrics and filters.

## Features

- **Interactive Map Dashboard**: Visualize real estate metrics on a map interface
- **Multiple Market Metrics**: Track median prices, inventory, days on market, and more
- **Geographic Filtering**: View data at state, county, city, or zip code level
- **Time-Series Data**: View historical trends over time
- **User Authentication**: Secure login with Google OAuth

## Market Data Dashboard

The dashboard allows users to:

1. **Filter by Metrics**: Select from 20+ different real estate market indicators
2. **Change Map Styles**: Switch between street, terrain, and satellite views
3. **Search Locations**: Find specific regions to analyze
4. **View Time Series**: Compare data across different time periods
5. **Interact with the Map**: Click regions to view detailed information

### Premium Features

Some advanced analytics features require a premium subscription:

- Market Heat Index
- Appreciation Forecasts
- Affordability Metrics
- Historical data beyond 12 months

## Data Pipeline

Homeslice updates its market data through an automated process:

1. A scheduled cron job runs the data collection script
2. The script fetches data from MLS sources or real estate APIs
3. The data is processed and validated
4. The API stores the data in the database
5. The dashboard pulls data from the API as needed

For development purposes, we use a mock data generator to simulate real-world market data.

## Getting Started

### Prerequisites

- Node.js 18.x or later
- PostgreSQL database
- npm or bun

### Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/homeslice.git
cd homeslice
```

2. Install dependencies

```bash
npm install
# or
bun install
```

3. Set up environment variables

```bash
cp .env.example .env
```

Then edit the .env file with your database and authentication settings.

4. Set up the database

```bash
npm run db:push
```

5. Start the development server

```bash
npm run dev
```

### Updating Market Data

To manually update the market data with mock data:

```bash
npm run update-data
```

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Maps**: MapLibre GL
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: NextAuth.js

## License

This project is licensed under the MIT License - see the LICENSE file for details.
