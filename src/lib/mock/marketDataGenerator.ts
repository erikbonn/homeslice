import { FilterType } from "@/components/dashboard/filter-types";

// Geographic structure for mock data
type Coordinate = [number, number]; // [longitude, latitude]

interface Region {
  id: string;
  name: string;
  type: "state" | "county" | "city" | "zip";
  center: Coordinate;
  // Real polygon boundary for rendering
  geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon;
  bounds: Coordinate[]; // Simple bounds for backwards compatibility
}

export interface MarketDataPoint {
  regionId: string;
  regionName: string;
  regionType: "state" | "county" | "city" | "zip";
  center: Coordinate;
  geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon;
  bounds: Coordinate[];
  timestamp: string; // ISO date string
  metrics: Record<FilterType, number | null>;
}

// Mock regions with simplified GeoJSON geometries
export const mockRegions: Region[] = [
  {
    id: "ca",
    name: "California",
    type: "state",
    center: [-119.4179, 36.7783],
    bounds: generateBoxAroundPoint([-119.4179, 36.7783], 5),
    geometry: {
      type: "Polygon",
      coordinates: [
        // Simplified California state boundary
        [
          [-124.3087, 41.9983],
          [-123.2338, 42.0024],
          [-122.3782, 42.0126],
          [-121.2132, 41.9952],
          [-120.0091, 41.9947],
          [-119.9995, 39.0021],
          [-120.0037, 38.1999],
          [-118.1971, 37.7487],
          [-116.7312, 36.2441],
          [-115.8486, 35.7935],
          [-114.6368, 35.0002],
          [-114.6339, 34.8726],
          [-114.6368, 34.7107],
          [-114.6298, 33.9344],
          [-114.5355, 33.6968],
          [-114.5242, 33.4144],
          [-114.5653, 33.3545],
          [-114.5187, 33.3053],
          [-114.5708, 33.2654],
          [-114.619, 33.1801],
          [-114.6889, 33.0891],
          [-114.6794, 33.0328],
          [-114.7247, 33.0511],
          [-115.8464, 32.8404],
          [-117.1272, 32.5356],
          [-117.2469, 32.6683],
          [-117.2525, 32.8201],
          [-117.3317, 33.0501],
          [-117.4709, 33.2341],
          [-117.6965, 33.4057],
          [-117.8964, 33.5426],
          [-118.2099, 33.7538],
          [-118.6274, 33.8403],
          [-118.7074, 34.0286],
          [-119.3068, 34.0447],
          [-119.559, 34.3469],
          [-120.6324, 34.4471],
          [-120.6108, 34.6082],
          [-120.6709, 34.7578],
          [-120.5569, 34.8888],
          [-120.639, 35.0327],
          [-120.6153, 35.2139],
          [-120.8722, 35.4548],
          [-121.138, 35.6338],
          [-121.322, 35.7836],
          [-121.8013, 36.1383],
          [-122.1452, 36.357],
          [-122.1713, 36.8028],
          [-122.3081, 37.2162],
          [-122.4016, 37.7783],
          [-122.7583, 37.8966],
          [-122.816, 38.0712],
          [-123.0394, 38.1908],
          [-123.0856, 38.3456],
          [-123.7167, 38.5524],
          [-123.8327, 38.7999],
          [-124.0839, 39.3052],
          [-124.0528, 39.7641],
          [-124.0839, 39.8055],
          [-124.0282, 40.0131],
          [-124.0321, 40.1661],
          [-124.1642, 40.313],
          [-124.2554, 40.4388],
          [-124.2141, 40.9384],
          [-124.3087, 41.9983],
        ],
      ],
    },
  },
  {
    id: "tx",
    name: "Texas",
    type: "state",
    center: [-99.9018, 31.9686],
    bounds: generateBoxAroundPoint([-99.9018, 31.9686], 5),
    geometry: {
      type: "Polygon",
      coordinates: [
        // Simplified Texas state boundary
        [
          [-106.5715, 31.8659],
          [-106.5042, 31.7504],
          [-106.3043, 31.6242],
          [-106.2091, 31.4638],
          [-106.0187, 31.3913],
          [-105.7874, 31.1846],
          [-105.5663, 31.0012],
          [-105.4066, 30.8455],
          [-105.0035, 30.646],
          [-104.8521, 30.3847],
          [-104.7438, 30.2595],
          [-104.6915, 30.1027],
          [-104.6775, 29.9497],
          [-104.5679, 29.7642],
          [-104.5285, 29.6475],
          [-104.4048, 29.56],
          [-104.2059, 29.472],
          [-104.1565, 29.3834],
          [-103.9774, 29.2954],
          [-103.9128, 29.2801],
          [-103.8208, 29.1785],
          [-103.5641, 29.0187],
          [-103.4692, 29.0132],
          [-103.3154, 28.9613],
          [-103.1616, 29.016],
          [-103.0957, 29.1335],
          [-103.0298, 29.2149],
          [-102.8677, 29.254],
          [-102.8979, 29.3486],
          [-102.8363, 29.4839],
          [-102.8004, 29.6858],
          [-102.7002, 29.7709],
          [-102.5134, 29.759],
          [-102.3843, 29.8788],
          [-102.3048, 29.7816],
          [-102.1506, 29.7575],
          [-101.7005, 29.7559],
          [-101.4922, 29.764],
          [-101.2939, 29.6298],
          [-101.2582, 29.5288],
          [-101.0062, 29.3648],
          [-100.9209, 29.3052],
          [-100.7319, 29.1642],
          [-100.6588, 29.0946],
          [-100.4974, 28.9014],
          [-100.3601, 28.6571],
          [-100.2969, 28.4634],
          [-100.1735, 28.277],
          [-100.0198, 28.1882],
          [-99.9344, 28.0516],
          [-99.8436, 27.9436],
          [-99.9012, 27.7656],
          [-99.9649, 27.6564],
          [-99.9161, 27.4835],
          [-99.8657, 27.3059],
          [-99.6094, 27.1943],
          [-99.4776, 27.0109],
          [-99.5456, 26.8854],
          [-99.4282, 26.6897],
          [-99.5075, 26.4209],
          [-99.4748, 26.3532],
          [-99.5377, 26.2054],
          [-99.5163, 26.0909],
          [-98.8214, 26.0601],
          [-98.6659, 26.1356],
          [-98.547, 26.2218],
          [-98.3267, 26.2309],
          [-98.1703, 26.3602],
          [-98.0152, 26.3909],
          [-97.8667, 26.3303],
          [-97.6434, 26.1946],
          [-97.413, 25.9974],
          [-97.3526, 25.8444],
          [-97.0149, 25.8805],
          [-97.0685, 26.1785],
          [-97.2249, 26.8295],
          [-97.0752, 27.423],
          [-96.6096, 28.0599],
          [-96.319, 28.4248],
          [-95.9149, 28.7568],
          [-95.5542, 29.0758],
          [-94.7461, 29.38],
          [-94.2913, 29.5812],
          [-93.8287, 29.8064],
          [-93.9305, 29.9233],
          [-93.8136, 30.0489],
          [-93.7231, 30.1214],
          [-93.6996, 30.1993],
          [-93.722, 30.2935],
          [-93.7027, 30.3352],
          [-93.7659, 30.3831],
          [-93.7604, 30.4383],
          [-93.7015, 30.5079],
          [-93.7187, 30.5362],
          [-93.706, 30.6296],
          [-93.7982, 30.7494],
          [-93.7558, 30.8122],
          [-93.7011, 30.8869],
          [-93.7308, 30.9376],
          [-93.6655, 31.0289],
          [-93.6083, 31.0813],
          [-93.5562, 31.1799],
          [-93.5767, 31.1669],
          [-93.5315, 31.3069],
          [-93.6276, 31.3833],
          [-93.6133, 31.4381],
          [-93.6848, 31.5107],
          [-93.6684, 31.5852],
          [-93.6903, 31.6439],
          [-93.7296, 31.719],
          [-93.692, 31.7943],
          [-93.7648, 31.8307],
          [-93.8083, 31.8869],
          [-93.822, 31.9335],
          [-94.043, 31.9786],
          [-94.0418, 32.0882],
          [-94.1543, 32.0786],
          [-94.1612, 32.1251],
          [-94.111, 32.2025],
          [-94.1489, 32.3142],
          [-94.1818, 32.3142],
          [-94.1488, 32.3743],
          [-94.183, 32.4346],
          [-94.1521, 32.4819],
          [-94.2529, 32.5456],
          [-94.3195, 32.5798],
          [-94.3924, 32.6926],
          [-94.4196, 32.6941],
          [-94.4229, 32.7797],
          [-94.6433, 32.7904],
          [-94.6906, 32.7892],
          [-94.7363, 32.7014],
          [-94.8396, 32.7027],
          [-94.9429, 32.7878],
          [-95.03, 32.7878],
          [-95.0874, 32.737],
          [-95.2161, 32.6851],
          [-95.2857, 32.5914],
          [-95.3389, 32.5336],
          [-95.4042, 32.5314],
          [-95.5489, 32.505],
          [-95.5467, 32.4363],
          [-95.5668, 32.3853],
          [-95.6413, 32.3464],
          [-95.7509, 32.2954],
          [-95.8427, 32.1386],
          [-95.9477, 32.0829],
          [-96.0259, 32.1262],
          [-96.0315, 32.2013],
          [-96.1372, 32.2385],
          [-96.1866, 32.3314],
          [-96.2689, 32.3573],
          [-96.3153, 32.3177],
          [-96.3757, 32.3535],
          [-96.3922, 32.3157],
          [-96.4047, 32.2014],
          [-96.5131, 32.1427],
          [-96.6378, 32.0825],
          [-96.6832, 32.1481],
          [-96.7508, 32.1159],
          [-96.7741, 32.1571],
          [-96.8323, 32.1292],
          [-96.8794, 32.1987],
          [-96.9157, 32.2083],
          [-96.9766, 32.2964],
          [-97.0553, 32.2903],
          [-97.0968, 32.3412],
          [-97.1649, 32.3802],
          [-97.2179, 32.4768],
          [-97.3672, 32.5531],
          [-97.3865, 32.6679],
          [-97.4213, 32.736],
          [-97.4143, 32.7719],
          [-97.4597, 32.8451],
          [-97.4055, 32.8879],
          [-97.3634, 32.9757],
          [-97.3282, 33.1423],
          [-97.3735, 33.2287],
          [-97.3865, 33.3066],
          [-97.4104, 33.3773],
          [-97.4597, 33.4623],
          [-97.5616, 33.5414],
          [-97.6602, 33.7409],
          [-97.5968, 33.8826],
          [-97.6547, 33.9546],
          [-97.6903, 34.0234],
          [-97.7775, 34.1357],
          [-98.082, 34.1425],
          [-98.5529, 34.1425],
          [-98.7523, 34.1472],
          [-98.9517, 34.1648],
          [-99.0624, 34.2122],
          [-99.1931, 34.2628],
          [-99.2573, 34.3617],
          [-99.3823, 34.4623],
          [-99.6169, 34.3775],
          [-99.9131, 34.4401],
          [-100.0002, 34.5628],
          [-100.0004, 34.7425],
          [-100.306, 34.578],
          [-100.384, 34.5267],
          [-100.4338, 34.6379],
          [-100.53, 34.7479],
          [-100.699, 34.7857],
          [-100.9905, 34.8422],
          [-101.0903, 34.7339],
          [-101.1829, 34.7422],
          [-101.3534, 34.6845],
          [-101.488, 34.695],
          [-101.6884, 34.7478],
          [-101.8236, 34.7396],
          [-102.0329, 34.6891],
          [-102.0422, 34.5891],
          [-102.1001, 34.5891],
          [-102.1671, 34.6798],
          [-102.3417, 34.6868],
          [-102.3417, 34.7477],
          [-102.7001, 34.7477],
          [-103.042, 34.7421],
          [-103.043, 36.0005],
          [-103.0629, 36.5009],
          [-103.7318, 36.5021],
          [-106.869, 31.8939],
          [-106.5715, 31.8659],
        ],
      ],
    },
  },
  {
    id: "orange-ca",
    name: "Orange County",
    type: "county",
    center: [-117.7675, 33.7175],
    bounds: generateBoxAroundPoint([-117.7675, 33.7175], 1),
    geometry: {
      type: "Polygon",
      coordinates: [
        // Simplified Orange County boundary
        [
          [-118.1242, 33.9082],
          [-117.9797, 33.9571],
          [-117.8531, 33.9599],
          [-117.7882, 33.9092],
          [-117.7367, 33.8951],
          [-117.6825, 33.8591],
          [-117.6437, 33.8029],
          [-117.5837, 33.7466],
          [-117.5196, 33.6925],
          [-117.4992, 33.6408],
          [-117.5196, 33.5945],
          [-117.5416, 33.5579],
          [-117.5586, 33.5308],
          [-117.5855, 33.511],
          [-117.6143, 33.4953],
          [-117.6411, 33.4866],
          [-117.6765, 33.4585],
          [-117.7101, 33.4273],
          [-117.7414, 33.3967],
          [-117.7766, 33.3691],
          [-117.8129, 33.3482],
          [-117.8491, 33.3376],
          [-117.8934, 33.3323],
          [-117.9396, 33.3323],
          [-117.9831, 33.3398],
          [-118.0276, 33.3539],
          [-118.0701, 33.3761],
          [-118.1083, 33.4056],
          [-118.14, 33.4403],
          [-118.1637, 33.4788],
          [-118.1782, 33.5198],
          [-118.1827, 33.562],
          [-118.1771, 33.604],
          [-118.1616, 33.6445],
          [-118.1367, 33.6824],
          [-118.1035, 33.7164],
          [-118.0636, 33.7451],
          [-118.0187, 33.7675],
          [-117.9706, 33.7829],
          [-117.9209, 33.7907],
          [-117.8715, 33.7907],
          [-117.8236, 33.7828],
          [-117.7785, 33.7673],
          [-117.7375, 33.7447],
          [-117.7019, 33.7157],
          [-117.6728, 33.6814],
          [-117.6512, 33.6433],
          [-117.6377, 33.6027],
          [-117.6327, 33.5607],
          [-117.6363, 33.5186],
          [-117.6484, 33.4774],
          [-117.6687, 33.4384],
          [-117.6966, 33.4028],
          [-117.7312, 33.3715],
          [-117.7714, 33.3454],
          [-117.8157, 33.3252],
          [-117.8631, 33.3119],
          [-118.1297, 33.7572],
          [-118.1558, 33.8093],
          [-118.1638, 33.8635],
          [-118.1242, 33.9082],
        ],
      ],
    },
  },
  {
    id: "sf-ca",
    name: "San Francisco",
    type: "city",
    center: [-122.4194, 37.7749],
    bounds: generateBoxAroundPoint([-122.4194, 37.7749], 0.3),
    geometry: {
      type: "Polygon",
      coordinates: [
        // Simplified San Francisco boundary
        [
          [-122.5142, 37.8083],
          [-122.5056, 37.8212],
          [-122.4999, 37.8341],
          [-122.4941, 37.847],
          [-122.4856, 37.8599],
          [-122.4771, 37.8728],
          [-122.4685, 37.8728],
          [-122.4599, 37.8728],
          [-122.4513, 37.8728],
          [-122.4428, 37.8728],
          [-122.4342, 37.8728],
          [-122.4257, 37.8728],
          [-122.4171, 37.8728],
          [-122.4085, 37.8728],
          [-122.4, 37.8728],
          [-122.3914, 37.8728],
          [-122.3828, 37.8728],
          [-122.3743, 37.8728],
          [-122.3657, 37.8728],
          [-122.3572, 37.8728],
          [-122.3486, 37.8728],
          [-122.34, 37.8728],
          [-122.34, 37.8599],
          [-122.34, 37.847],
          [-122.34, 37.8341],
          [-122.34, 37.8212],
          [-122.34, 37.8083],
          [-122.34, 37.7954],
          [-122.34, 37.7825],
          [-122.34, 37.7696],
          [-122.34, 37.7567],
          [-122.34, 37.7438],
          [-122.34, 37.7309],
          [-122.34, 37.718],
          [-122.34, 37.7051],
          [-122.3486, 37.7051],
          [-122.3572, 37.7051],
          [-122.3657, 37.7051],
          [-122.3743, 37.7051],
          [-122.3828, 37.7051],
          [-122.3914, 37.7051],
          [-122.4, 37.7051],
          [-122.4085, 37.7051],
          [-122.4171, 37.7051],
          [-122.4257, 37.7051],
          [-122.4342, 37.7051],
          [-122.4428, 37.7051],
          [-122.4513, 37.7051],
          [-122.4599, 37.7051],
          [-122.4685, 37.7051],
          [-122.4771, 37.7051],
          [-122.4856, 37.7051],
          [-122.4941, 37.7051],
          [-122.5027, 37.7051],
          [-122.5113, 37.7051],
          [-122.5198, 37.7051],
          [-122.5198, 37.718],
          [-122.5198, 37.7309],
          [-122.5198, 37.7438],
          [-122.5198, 37.7567],
          [-122.5198, 37.7696],
          [-122.5198, 37.7825],
          [-122.5198, 37.7954],
          [-122.5142, 37.8083],
        ],
      ],
    },
  },
  {
    id: "94103",
    name: "94103",
    type: "zip",
    center: [-122.4167, 37.775],
    bounds: generateBoxAroundPoint([-122.4167, 37.775], 0.05),
    geometry: {
      type: "Polygon",
      coordinates: [
        // Simplified ZIP code boundary
        [
          [-122.4289, 37.7826],
          [-122.4275, 37.7841],
          [-122.4248, 37.7873],
          [-122.4226, 37.7892],
          [-122.4205, 37.7904],
          [-122.4169, 37.7914],
          [-122.4127, 37.7918],
          [-122.4084, 37.7914],
          [-122.4047, 37.7904],
          [-122.4011, 37.7888],
          [-122.3988, 37.7869],
          [-122.3967, 37.7845],
          [-122.3952, 37.7818],
          [-122.3944, 37.7789],
          [-122.3944, 37.7759],
          [-122.3952, 37.7729],
          [-122.3967, 37.7702],
          [-122.3988, 37.7677],
          [-122.4011, 37.7658],
          [-122.4047, 37.7642],
          [-122.4084, 37.7632],
          [-122.4127, 37.7628],
          [-122.4169, 37.7632],
          [-122.4205, 37.7642],
          [-122.4226, 37.7654],
          [-122.4248, 37.7673],
          [-122.4275, 37.7705],
          [-122.4289, 37.772],
          [-122.4301, 37.7748],
          [-122.4307, 37.7775],
          [-122.4301, 37.7798],
          [-122.4289, 37.7826],
        ],
      ],
    },
  },
];

// Helper function to generate a box around a point
function generateBoxAroundPoint(
  center: Coordinate,
  size: number,
): Coordinate[] {
  const [lon, lat] = center;
  return [
    [lon - size, lat - size],
    [lon + size, lat - size],
    [lon + size, lat + size],
    [lon - size, lat + size],
    [lon - size, lat - size], // Close the loop
  ];
}

// Generate a range of dates for time-series data
function generateDateRange(months: number): string[] {
  const dates: string[] = [];
  const now = new Date();

  for (let i = 0; i < months; i++) {
    const date = new Date(now);
    date.setMonth(now.getMonth() - i);
    date.setDate(1); // First day of month
    dates.unshift(date.toISOString().split("T")[0]);
  }

  return dates;
}

// Base metric values - realistic starting points for different metrics
const baseMetricValues: Record<FilterType, { min: number; max: number }> = {
  [FilterType.MEDIAN_PRICE]: { min: 200000, max: 1500000 },
  [FilterType.PRICE_CHANGE]: { min: -15, max: 20 },
  [FilterType.DAYS_ON_MARKET]: { min: 10, max: 120 },
  [FilterType.INVENTORY]: { min: 50, max: 5000 },
  [FilterType.MONTHS_SUPPLY]: { min: 1, max: 12 },
  [FilterType.TOTAL_SALES]: { min: 20, max: 5000 },
  [FilterType.NEW_LISTINGS]: { min: 10, max: 3000 },
  [FilterType.PENDING_SALES]: { min: 15, max: 2500 },
  [FilterType.CLOSED_SALES]: { min: 10, max: 4500 },
  [FilterType.LIST_VS_SOLD]: { min: 90, max: 110 }, // percentage
  [FilterType.PRICE_PER_SQFT]: { min: 100, max: 1200 },
  [FilterType.PRICE_CUTS]: { min: 5, max: 60 }, // percentage of listings with cuts
  [FilterType.AFFORDABILITY_INDEX]: { min: 60, max: 180 },
  [FilterType.MORTGAGE_RATES]: { min: 3, max: 8 },
  [FilterType.INCOME_TO_PRICE]: { min: 20, max: 60 }, // percentage
  [FilterType.MARKET_HEAT]: { min: 1, max: 100 },
  [FilterType.APPRECIATION_FORECAST]: { min: -5, max: 15 },
  [FilterType.SINGLE_FAMILY]: { min: 10, max: 3000 }, // inventory
  [FilterType.CONDO]: { min: 5, max: 2000 }, // inventory
  [FilterType.TOWNHOUSE]: { min: 3, max: 1500 }, // inventory
  [FilterType.MULTI_FAMILY]: { min: 1, max: 1000 }, // inventory
  [FilterType.FOR_SALE]: { min: 20, max: 5000 }, // listings
  [FilterType.SOLD]: { min: 10, max: 4000 }, // recent sales
  [FilterType.FORECLOSURE]: { min: 0, max: 500 }, // foreclosures
  [FilterType.NEW_CONSTRUCTION]: { min: 0, max: 1000 }, // new builds
};

// Generate mock data for a specified metric for a region over time
function generateMetricTimeSeries(
  metricType: FilterType,
  months: number,
  regionType: "state" | "county" | "city" | "zip",
  regionPriceLevel: "low" | "medium" | "high" = "medium",
): number[] {
  // Get base range for this metric
  const { min, max } = baseMetricValues[metricType];

  // Adjust base values based on region type and price level
  let adjustedMin = min;
  let adjustedMax = max;

  // Price level adjustments
  const multipliers = {
    low: 0.7,
    medium: 1.0,
    high: 1.5,
  };

  // Region type adjustments - larger regions have different scales
  const typeAdjustments: Record<string, number> = {
    state: 1.2,
    county: 1.0,
    city: 0.8,
    zip: 0.6,
  };

  adjustedMin *= multipliers[regionPriceLevel] * typeAdjustments[regionType];
  adjustedMax *= multipliers[regionPriceLevel] * typeAdjustments[regionType];

  // Special case for percentages and rates - don't adjust as much
  if (
    metricType === FilterType.PRICE_CHANGE ||
    metricType === FilterType.LIST_VS_SOLD ||
    metricType === FilterType.MORTGAGE_RATES ||
    metricType === FilterType.APPRECIATION_FORECAST
  ) {
    adjustedMin = min * (1 + (multipliers[regionPriceLevel] - 1) * 0.3);
    adjustedMax = max * (1 + (multipliers[regionPriceLevel] - 1) * 0.3);
  }

  // Generate a time series with some randomness but consistent trends
  const values: number[] = [];

  // Start with a random value in our range
  let currentValue = adjustedMin + Math.random() * (adjustedMax - adjustedMin);

  // Trend direction and volatility
  const trendDirection = Math.random() > 0.5 ? 1 : -1;
  const volatility = (adjustedMax - adjustedMin) * 0.05; // 5% of range

  // Some metrics have seasonal patterns
  const hasSeasonality = [
    FilterType.MEDIAN_PRICE,
    FilterType.INVENTORY,
    FilterType.TOTAL_SALES,
    FilterType.NEW_LISTINGS,
  ].includes(metricType);

  for (let i = 0; i < months; i++) {
    // Apply trend
    const trend = trendDirection * (adjustedMax - adjustedMin) * 0.01; // 1% trend per month

    // Apply seasonality if applicable
    let seasonality = 0;
    if (hasSeasonality) {
      // Simple sine wave seasonality with 12-month period
      seasonality =
        Math.sin(((i % 12) / 12) * 2 * Math.PI) *
        (adjustedMax - adjustedMin) *
        0.08;
    }

    // Apply randomness
    const randomness = (Math.random() - 0.5) * 2 * volatility;

    // Update value
    currentValue = Math.max(
      adjustedMin,
      Math.min(adjustedMax, currentValue + trend + seasonality + randomness),
    );

    // Round appropriately based on metric type
    if (
      metricType === FilterType.MEDIAN_PRICE ||
      metricType === FilterType.TOTAL_SALES ||
      metricType === FilterType.INVENTORY ||
      metricType === FilterType.NEW_LISTINGS ||
      metricType === FilterType.PENDING_SALES ||
      metricType === FilterType.CLOSED_SALES ||
      metricType === FilterType.SINGLE_FAMILY ||
      metricType === FilterType.CONDO ||
      metricType === FilterType.TOWNHOUSE ||
      metricType === FilterType.MULTI_FAMILY ||
      metricType === FilterType.FOR_SALE ||
      metricType === FilterType.SOLD ||
      metricType === FilterType.FORECLOSURE ||
      metricType === FilterType.NEW_CONSTRUCTION
    ) {
      currentValue = Math.round(currentValue);
    } else {
      // For percentages and rates, round to 1 decimal place
      currentValue = Math.round(currentValue * 10) / 10;
    }

    values.push(currentValue);
  }

  return values;
}

// Price levels for different regions to ensure realistic data
const regionPriceLevels: Record<string, "low" | "medium" | "high"> = {
  ca: "high",
  tx: "medium",
  ny: "high",
  fl: "medium",
  "orange-ca": "high",
  "la-ca": "high",
  "sf-ca": "high",
  "sd-ca": "high",
  "nyc-ny": "high",
  "chi-il": "medium",
  "hou-tx": "medium",
  "mia-fl": "medium",
  "94103": "high", // SF zip
  "90210": "high", // Beverly Hills
  "10001": "high", // NYC zip
};

// Generate a complete dataset for all regions, metrics, and time periods
export function generateMarketDataset(months: number = 24): MarketDataPoint[] {
  const dates = generateDateRange(months);
  const dataset: MarketDataPoint[] = [];

  // For each region
  mockRegions.forEach((region) => {
    const priceLevel = regionPriceLevels[region.id] || "medium";

    // Generate metrics for each time period
    const metricValues: Record<FilterType, number[]> = {} as Record<
      FilterType,
      number[]
    >;

    // Generate time series for each metric
    Object.values(FilterType).forEach((metricType) => {
      metricValues[metricType] = generateMetricTimeSeries(
        metricType,
        months,
        region.type,
        priceLevel,
      );
    });

    // Create data points for each date
    dates.forEach((date, i) => {
      const metrics: Record<FilterType, number | null> = {} as Record<
        FilterType,
        number | null
      >;

      // Set values for each metric at this time point
      Object.values(FilterType).forEach((metricType) => {
        metrics[metricType] = metricValues[metricType][i];
      });

      // Add data point to dataset
      dataset.push({
        regionId: region.id,
        regionName: region.name,
        regionType: region.type,
        center: region.center,
        bounds: region.bounds,
        geometry: region.geometry,
        timestamp: date,
        metrics,
      });
    });
  });

  return dataset;
}

// Generate GeoJSON from market data for a specific filter and date
export function generateGeoJSON(
  marketData: MarketDataPoint[],
  filter: FilterType,
  date: string,
) {
  // Filter data for the specific date
  const filteredData = marketData.filter(
    (dataPoint) => dataPoint.timestamp === date,
  );

  // Create GeoJSON feature collection
  return {
    type: "FeatureCollection",
    features: filteredData.map((dataPoint) => ({
      type: "Feature",
      id: dataPoint.regionId,
      properties: {
        id: dataPoint.regionId,
        name: dataPoint.regionName,
        type: dataPoint.regionType,
        value: dataPoint.metrics[filter],
        filter: filter,
        date: date,
      },
      geometry: dataPoint.geometry,
    })),
  };
}
