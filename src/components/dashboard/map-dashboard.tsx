"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { MapStyleSelector } from "./map-style-selector";

interface MapDashboardProps {
  initialViewState?: {
    longitude: number;
    latitude: number;
    zoom: number;
  };
  searchQuery?: string;
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
}: MapDashboardProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [currentStyle, setCurrentStyle] = useState<MapStyle>("streets");
  const styleLoadHandlerRef = useRef<(() => void) | null>(null);

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
    });

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [initialViewState]);

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
        }
      } catch (error) {
        console.error("Error geocoding search query:", error);
      }
    };

    void geocodeSearch();
  }, [searchQuery]);

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
        }
      };

      // Store the handler reference
      styleLoadHandlerRef.current = styleLoadHandler;

      // Set the new style
      map.current.setStyle(mapStyles[style]);

      // Add the style load handler
      void map.current.once("style.load", styleLoadHandler);

      // Set a timeout to handle style loading failures
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
    </div>
  );
}
