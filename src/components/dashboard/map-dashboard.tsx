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

export function MapDashboard({
  initialViewState = { longitude: -98.5795, latitude: 39.8283, zoom: 3.5 },
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

  const changeMapStyle = async (style: MapStyle) => {
    if (!map.current) {
      console.error("Map instance not found");
      return;
    }

    try {
      console.log("Changing map style to:", style);
      const newStyle = mapStyles[style];
      console.log("New style configuration:", newStyle);

      // Store current view state
      const center = map.current.getCenter();
      const zoom = map.current.getZoom();

      // Remove previous style load handler if it exists
      if (styleLoadHandlerRef.current && map.current) {
        map.current.off("style.load", styleLoadHandlerRef.current);
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
      map.current.setStyle(newStyle);

      // Add the style load handler
      void map.current.once("style.load", styleLoadHandler);

      // Set a timeout to handle style loading failures
      const timeout = setTimeout(() => {
        console.warn(
          "Style load timeout, attempting to restore previous style",
        );
        if (map.current) {
          map.current.setStyle(mapStyles[currentStyle]);
        }
      }, 10000);

      // Clean up timeout when style loads
      void map.current.once("style.load", () => {
        clearTimeout(timeout);
      });
    } catch (error) {
      console.error("Error changing map style:", error);
      // Fallback to previous style if setting fails
      if (map.current) {
        map.current.setStyle(mapStyles[currentStyle]);
      }
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
