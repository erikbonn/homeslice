"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { MapStyleSelector } from "./map-style-selector";
import { FilterType, filterNames } from "./filter-types";
import { Info, Layers } from "lucide-react";

interface MapDashboardProps {
  initialViewState?: {
    longitude: number;
    latitude: number;
    zoom: number;
  };
  searchQuery?: string;
  activeFilters?: FilterType[];
}

export type MapStyle = "streets" | "terrain" | "satellite";

const mapStyles: Record<MapStyle, maplibregl.StyleSpecification> = {
  streets: {
    version: 8,
    sources: {
      "raster-tiles": {
        type: "raster",
        tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
        tileSize: 256,
        attribution: "© OpenStreetMap contributors",
      },
    },
    layers: [
      {
        id: "simple-tiles",
        type: "raster",
        source: "raster-tiles",
        minzoom: 0,
        maxzoom: 22,
      },
    ],
  },
  //   light: {
  //     version: 8,
  //     sources: {
  //       "raster-tiles": {
  //         type: "raster",
  //         tiles: [
  //           "https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png",
  //         ],
  //         tileSize: 256,
  //         attribution:
  //           "© Stadia Maps © OpenMapTiles © OpenStreetMap contributors",
  //       },
  //     },
  //     layers: [
  //       {
  //         id: "simple-tiles",
  //         type: "raster",
  //         source: "raster-tiles",
  //         minzoom: 0,
  //         maxzoom: 20,
  //       },
  //     ],
  //   },
  //   dark: {
  //     version: 8,
  //     sources: {
  //       "raster-tiles": {
  //         type: "raster",
  //         tiles: [
  //           "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png",
  //         ],
  //         tileSize: 256,
  //         attribution:
  //           "© Stadia Maps © OpenMapTiles © OpenStreetMap contributors",
  //       },
  //     },
  //     layers: [
  //       {
  //         id: "simple-tiles",
  //         type: "raster",
  //         source: "raster-tiles",
  //         minzoom: 0,
  //         maxzoom: 20,
  //       },
  //     ],
  //   },
  terrain: {
    version: 8,
    sources: {
      "raster-tiles": {
        type: "raster",
        tiles: ["https://tile.opentopomap.org/{z}/{x}/{y}.png"],
        tileSize: 256,
        attribution: "© OpenTopoMap contributors",
      },
    },
    layers: [
      {
        id: "simple-tiles",
        type: "raster",
        source: "raster-tiles",
        minzoom: 0,
        maxzoom: 17,
      },
    ],
  },
  satellite: {
    version: 8,
    sources: {
      "raster-tiles": {
        type: "raster",
        tiles: [
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        ],
        tileSize: 256,
        attribution: "© ESRI",
      },
    },
    layers: [
      {
        id: "simple-tiles",
        type: "raster",
        source: "raster-tiles",
        minzoom: 0,
        maxzoom: 19,
      },
    ],
  },
};

interface GeocodingResult {
  lat: string;
  lon: string;
  display_name: string;
}

export function MapDashboard({
  initialViewState = { longitude: -98.5795, latitude: 39.8283, zoom: 3.5 },
  searchQuery,
  activeFilters = [],
}: MapDashboardProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [currentStyle, setCurrentStyle] = useState<MapStyle>("streets");
  const styleLoadHandlerRef = useRef<(() => void) | null>(null);
  const [activeLayers, setActiveLayers] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [showLayerInfo, setShowLayerInfo] = useState(false);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize the map with OpenStreetMap as fallback
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: mapStyles.streets,
      center: [initialViewState.longitude, initialViewState.latitude],
      zoom: initialViewState.zoom,
    });

    // Add navigation controls
    map.current.addControl(new maplibregl.NavigationControl(), "top-right");

    // Handle map load
    map.current.on("load", () => {
      setMapLoaded(true);

      // Initialize dummy data sources for filters
      // Note: In a real implementation, these would come from your API
      initializeDataSources();
    });

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [initialViewState]);

  // Initialize data sources for the map
  const initializeDataSources = () => {
    if (!map.current) return;

    // Initialize sources for each type of filter
    // This is where you'd add data from your API

    // Example: Adding a source for median home prices (dummy data)
    map.current.addSource("median-prices", {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: [],
      },
    });

    // Example: Adding a layer for median home prices
    map.current.addLayer({
      id: FilterType.MEDIAN_PRICE,
      type: "fill",
      source: "median-prices",
      layout: { visibility: "none" },
      paint: {
        "fill-color": [
          "interpolate",
          ["linear"],
          ["get", "median_price"],
          100000,
          "#ffffcc",
          500000,
          "#fd8d3c",
          1000000,
          "#800026",
        ],
        "fill-opacity": 0.7,
        "fill-outline-color": "#000",
      },
    });

    // Note: In a real implementation, you would add all data sources
    // and layers for each filter type here, or dynamically when filters are toggled
  };

  // Handle search query changes
  useEffect(() => {
    if (!map.current || !searchQuery) return;

    const geocodeSearch = async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            searchQuery,
          )}&limit=1`,
        );
        const data = (await response.json()) as GeocodingResult[];

        if (data && data.length > 0 && data[0]) {
          const result = data[0];
          map.current?.flyTo({
            center: [parseFloat(result.lon), parseFloat(result.lat)],
            zoom: 8,
            essential: true,
          });
          setSelectedLocation(result.display_name);

          // This is where you would fetch data for this location
          // and update the map layers
          fetchLocationData(result.display_name);
        }
      } catch (error) {
        console.error("Error geocoding search query:", error);
      }
    };

    void geocodeSearch();
  }, [searchQuery]);

  // Handle filter changes
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Update visible layers based on active filters
    activeFilters.forEach((filter) => {
      // Check if layer exists for this filter
      if (map.current?.getLayer(filter)) {
        map.current.setLayoutProperty(filter, "visibility", "visible");

        if (!activeLayers.includes(filter)) {
          setActiveLayers((prev) => [...prev, filter]);
        }
      } else {
        // Create layer if it doesn't exist
        // Note: In a real implementation, you would fetch data from your API
        console.log(`Layer for ${filter} would be created here`);
        // createLayerForFilter(filter);
      }
    });

    // Hide layers that are no longer active
    activeLayers.forEach((layer) => {
      if (
        !activeFilters.includes(layer as FilterType) &&
        map.current?.getLayer(layer)
      ) {
        map.current.setLayoutProperty(layer, "visibility", "none");
        setActiveLayers((prev) => prev.filter((l) => l !== layer));
      }
    });
  }, [activeFilters, mapLoaded, activeLayers]);

  // Fetch data for a selected location
  const fetchLocationData = (locationName: string) => {
    // This is where you would make API calls to fetch real data
    console.log(`Fetching data for ${locationName}`);

    // In a real implementation:
    // 1. Call your backend API to get data for the selected location
    // 2. Process the returned data
    // 3. Update the map sources with the new data

    // For demonstration purposes, we're just logging for now
    activeFilters.forEach((filter) => {
      console.log(
        `Would fetch ${filterNames[filter]} data for ${locationName}`,
      );
    });
  };

  const changeMapStyle = async (style: MapStyle) => {
    if (!map.current) {
      console.error("Map instance not found");
      return;
    }

    try {
      // Store current view state
      const center = map.current.getCenter();
      const zoom = map.current.getZoom();

      // Remove previous style load handler if it exists
      if (styleLoadHandlerRef.current) {
        map.current.off("style.load", styleLoadHandlerRef.current);
        styleLoadHandlerRef.current = null;
      }

      // Create new style load handler
      const styleLoadHandler = () => {
        if (map.current) {
          map.current.setCenter(center);
          map.current.setZoom(zoom);
          setCurrentStyle(style);

          // Re-add data sources and layers after style change
          initializeDataSources();

          // Re-apply active filters
          activeFilters.forEach((filter) => {
            if (map.current?.getLayer(filter)) {
              map.current.setLayoutProperty(filter, "visibility", "visible");
            }
          });
        }
      };

      // Store the handler reference
      styleLoadHandlerRef.current = styleLoadHandler;

      // Set the new style
      map.current.setStyle(mapStyles[style]);

      // Add the style load handler
      void map.current.once("style.load", styleLoadHandler);
    } catch (error) {
      console.error("Error changing map style:", error);
      // Fallback to previous style if setting fails
    }
  };

  return (
    <div className="relative h-[600px] w-full overflow-hidden rounded-lg">
      <div ref={mapContainer} className="absolute top-0 left-0 h-full w-full" />
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50">
          <div className="text-white">Loading map...</div>
        </div>
      )}

      {/* Map Style Controls */}
      <div className="absolute top-4 left-4 z-10">
        <MapStyleSelector
          currentStyle={currentStyle}
          onStyleChange={changeMapStyle}
        />
      </div>

      {/* Active Location */}
      {selectedLocation && (
        <div className="absolute top-4 right-16 left-[120px] z-10 truncate overflow-hidden rounded-md bg-gray-800/80 px-3 py-1.5 text-sm text-white">
          {selectedLocation}
        </div>
      )}

      {/* Active Layers Indicator */}
      {activeLayers.length > 0 && (
        <div className="absolute bottom-4 left-4 z-10">
          <button
            onClick={() => setShowLayerInfo(!showLayerInfo)}
            className="flex items-center gap-2 rounded-md bg-gray-800/80 px-3 py-2 text-sm text-white hover:bg-gray-700/80"
          >
            <Layers className="h-4 w-4" />
            <span>{activeLayers.length} active layers</span>
          </button>

          {showLayerInfo && (
            <div className="mt-2 w-60 rounded-md bg-gray-800/90 p-3 text-xs text-white shadow-lg">
              <div className="mb-2 flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5 text-orange-400" />
                <span className="font-medium">Currently Displayed:</span>
              </div>
              <ul className="space-y-1">
                {activeLayers.map((layer) => (
                  <li key={layer} className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                    <span>{filterNames[layer as FilterType]}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 text-[10px] text-gray-300">
                Data is updated weekly from MLS sources
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
