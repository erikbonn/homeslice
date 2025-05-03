"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import maplibregl from "maplibre-gl";
import type { MapGeoJSONFeature } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { MapStyleSelector } from "./map-style-selector";
import { FilterType, filterNames } from "./filter-types";
import { Info, Layers, Calendar, AlertTriangle } from "lucide-react";
import {
  getColorScaleExpression,
  getFilterGeoJSON,
  getLatestDate,
  generateLegend,
  formatMetricValue,
} from "@/lib/services/marketDataService";

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
      "osm-tiles": {
        type: "raster",
        tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
        tileSize: 256,
        attribution: "© OpenStreetMap contributors",
        maxzoom: 19,
      },
    },
    layers: [
      {
        id: "osm-tiles",
        type: "raster",
        source: "osm-tiles",
        minzoom: 0,
        maxzoom: 19,
      },
    ],
  },
  terrain: {
    version: 8,
    sources: {
      "terrain-tiles": {
        type: "raster",
        tiles: ["https://tile.opentopomap.org/{z}/{x}/{y}.png"],
        tileSize: 256,
        attribution: "© OpenTopoMap contributors",
        maxzoom: 17,
      },
    },
    layers: [
      {
        id: "terrain-tiles",
        type: "raster",
        source: "terrain-tiles",
        minzoom: 0,
        maxzoom: 17,
      },
    ],
  },
  satellite: {
    version: 8,
    sources: {
      "satellite-tiles": {
        type: "raster",
        tiles: [
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        ],
        tileSize: 256,
        attribution: "© ESRI",
        maxzoom: 19,
      },
    },
    layers: [
      {
        id: "satellite-tiles",
        type: "raster",
        source: "satellite-tiles",
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
  osm_id?: string;
}

// Add these new interfaces to help with geographic scope management
interface GeographicBoundary {
  type: "country" | "state" | "county" | "city" | "zipcode";
  id: string;
  name: string;
  bounds?: [[number, number], [number, number]]; // SW, NE corners
}

export function MapDashboard({
  initialViewState = { longitude: -98.5795, latitude: 39.8283, zoom: 3.5 },
  searchQuery,
  activeFilters = [],
}: MapDashboardProps) {
  console.log("[MapDashboard] Component rendering");

  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [currentStyle, setCurrentStyle] = useState<MapStyle>("streets");
  const styleLoadHandlerRef = useRef<(() => void) | null>(null);
  const [activeLayers, setActiveLayers] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [showLayerInfo, setShowLayerInfo] = useState(false);
  const [currentDate, setCurrentDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLegend, setShowLegend] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<FilterType | null>(null);
  const [hoveredFeature, setHoveredFeature] =
    useState<MapGeoJSONFeature | null>(null);
  const [currentGeographicScope, setCurrentGeographicScope] =
    useState<GeographicBoundary>({
      type: "country",
      id: "US",
      name: "United States",
    });

  // Add resize observer to handle container size changes
  useEffect(() => {
    if (!mapContainer.current) return;

    const resizeObserver = new ResizeObserver(() => {
      if (map.current) {
        map.current.resize();
      }
    });

    resizeObserver.observe(mapContainer.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Fetch the most recent date when component mounts
  useEffect(() => {
    console.log("[MapDashboard] useEffect - fetchLatestDate");
    const fetchLatestDate = async () => {
      try {
        console.log("[MapDashboard] Calling getLatestDate()");
        const date = await getLatestDate();
        console.log("[MapDashboard] Got latest date:", date);
        setCurrentDate(date);
      } catch (error) {
        console.error("[MapDashboard] Error fetching latest date:", error);
        setError("Failed to load market data");
      }
    };

    void fetchLatestDate();
  }, []);

  // Initialize map
  useEffect(() => {
    console.log("[MapDashboard] useEffect - map initialization");

    if (!mapContainer.current) {
      console.log("[MapDashboard] Map container not found");
      return;
    }

    const container = mapContainer.current;

    // Ensure we don't initialize the map multiple times
    if (map.current) {
      console.log("[MapDashboard] Map already initialized");
      return;
    }

    try {
      // Create map instance with minimal configuration first
      const mapInstance = new maplibregl.Map({
        container: container,
        style: mapStyles.streets,
        center: [initialViewState.longitude, initialViewState.latitude],
        zoom: initialViewState.zoom,
        attributionControl: false,
      });

      // Store the map instance
      console.log(
        "[MapDashboard] Map instance created",
        mapInstance,
        container,
      );
      map.current = mapInstance;

      // Add event handlers after successful initialization
      mapInstance.on("load", () => {
        console.log("[MapDashboard] Map loaded event fired");

        // Defer execution until after style and projection are initialized
        requestAnimationFrame(() => {
          try {
            mapInstance.addControl(
              new maplibregl.NavigationControl(),
              "top-right",
            );

            // // Set zoom and bounds constraints *after* internal projection is ready
            // mapInstance.setMaxBounds([
            //   [-180, -85],
            //   [180, 85],
            // ]);
            // mapInstance.setMaxZoom(19);
            // mapInstance.setMinZoom(0);
            // mapInstance.setMaxPitch(0);

            setMapLoaded(true);
          } catch (error) {
            console.error(
              "[MapDashboard] Error setting map properties:",
              error,
            );
          }
        });
      });

      // Handle errors
      mapInstance.on("error", (e) => {
        console.error("[MapDashboard] Map error:", e);
        setError("An error occurred while loading the map");
      });

      // Set up interaction handlers
      let mouseMoveTimeout: NodeJS.Timeout;
      mapInstance.on("mousemove", (e) => {
        if (mouseMoveTimeout) {
          clearTimeout(mouseMoveTimeout);
        }

        mouseMoveTimeout = setTimeout(() => {
          const existingLayers = activeLayers.filter((layer) =>
            mapInstance.getLayer(layer),
          );

          if (existingLayers.length === 0) return;

          const features = mapInstance.queryRenderedFeatures(e.point, {
            layers: existingLayers,
          });

          if (features.length > 0) {
            mapInstance.getCanvas().style.cursor = "pointer";
            setHoveredFeature(features[0] ?? null);
          } else {
            mapInstance.getCanvas().style.cursor = "";
            setHoveredFeature(null);
          }
        }, 50);
      });

      mapInstance.on("mouseleave", () => {
        mapInstance.getCanvas().style.cursor = "";
        setHoveredFeature(null);
      });

      mapInstance.on("click", (e) => {
        const existingLayers = activeLayers.filter((layer) =>
          mapInstance.getLayer(layer),
        );

        if (existingLayers.length === 0) return;

        const features = mapInstance.queryRenderedFeatures(e.point, {
          layers: existingLayers,
        });

        if (features.length > 0) {
          const feature = features[0];
          console.log("Feature clicked:", feature);
        }
      });

      // Cleanup function
      return () => {
        console.log("[MapDashboard] Cleaning up map instance");
        if (mapInstance) {
          mapInstance.remove();
          map.current = null;
        }
      };
    } catch (error) {
      console.error("[MapDashboard] Error initializing map:", error);
      setError("Failed to initialize map");
    }
  }, [
    initialViewState.latitude,
    initialViewState.longitude,
    initialViewState.zoom,
  ]);

  // Add debug information for the active layers
  useEffect(() => {
    console.log("Current active layers:", activeLayers);
  }, [activeLayers]);

  // Add debug information for the searchQuery
  useEffect(() => {
    console.log("Search query changed:", searchQuery);
  }, [searchQuery]);

  // Handle search query changes
  useEffect(() => {
    if (!map.current) return;

    if (!searchQuery) {
      // If there's no search query, set the scope to the entire US
      setCurrentGeographicScope({
        type: "country",
        id: "US",
        name: "United States",
      });

      // Reset map to national view
      map.current.flyTo({
        center: [initialViewState.longitude, initialViewState.latitude],
        zoom: initialViewState.zoom,
        essential: true,
      });

      return;
    }

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

          // Extract OSM type and determine geographic scope
          let geoScope: GeographicBoundary["type"] = "country";
          const geoName = result.display_name;

          // Parse the display_name to determine the type of location
          // This is a basic heuristic and could be improved with better geocoding or boundary data
          const zipRegex = /\b\d{5}(-\d{4})?\b/;
          const stateCodeRegex = /, [A-Z]{2},/;

          if (zipRegex.exec(searchQuery)) {
            geoScope = "zipcode";
          } else if (result.display_name.includes("County")) {
            geoScope = "county";
          } else if (stateCodeRegex.exec(result.display_name)) {
            // If it contains a state code format like ", CA,"
            if (result.display_name.split(",").length <= 3) {
              geoScope = "state";
            } else {
              geoScope = "city";
            }
          }

          map.current?.flyTo({
            center: [parseFloat(result.lon), parseFloat(result.lat)],
            zoom:
              geoScope === "country"
                ? 3.5
                : geoScope === "state"
                  ? 6
                  : geoScope === "county"
                    ? 8
                    : geoScope === "city"
                      ? 10
                      : 12,
            essential: true,
          });

          setSelectedLocation(result.display_name);

          // Set the geographic scope for layer filtering
          setCurrentGeographicScope({
            type: geoScope,
            id: result.osm_id ?? searchQuery,
            name: geoName,
            bounds: getBoundsFromLonLat(
              parseFloat(result.lon),
              parseFloat(result.lat),
              geoScope,
            ),
          });
        }
      } catch (error) {
        console.error("Error geocoding search query:", error);
      }
    };

    void geocodeSearch();
  }, [
    searchQuery,
    initialViewState.latitude,
    initialViewState.longitude,
    initialViewState.zoom,
  ]);

  // Helper function to estimate bounds based on location type
  const getBoundsFromLonLat = (
    lon: number,
    lat: number,
    type: GeographicBoundary["type"],
  ): [[number, number], [number, number]] => {
    // These are rough approximations - ideally you'd use actual boundary data
    const padding =
      type === "zipcode"
        ? 0.05
        : type === "city"
          ? 0.1
          : type === "county"
            ? 0.5
            : type === "state"
              ? 2
              : 5;

    return [
      [lon - padding, lat - padding],
      [lon + padding, lat + padding],
    ];
  };

  // Optimize layer management with memoization and batching
  const updateLayers = useCallback(async () => {
    console.log("[MapDashboard] updateLayers called");
    if (!map.current || !mapLoaded || !currentDate) {
      console.log(
        "[MapDashboard] updateLayers early return - missing dependencies:",
        {
          hasMap: !!map.current,
          mapLoaded,
          currentDate,
        },
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("[MapDashboard] Starting layer updates");
      // Track layers that need to be removed
      const layersToRemove = activeLayers.filter(
        (layerId) => !activeFilters.includes(layerId as FilterType),
      );

      // Batch layer removals
      if (layersToRemove.length > 0) {
        layersToRemove.forEach((layerId) => {
          try {
            if (map.current?.getLayer(layerId)) {
              if (map.current.getLayer(`${layerId}-line`)) {
                map.current.removeLayer(`${layerId}-line`);
              }
              map.current.removeLayer(layerId);
              if (map.current.getSource(`source-${layerId}`)) {
                map.current.removeSource(`source-${layerId}`);
              }
            }
          } catch (error) {
            console.error(`Error removing layer ${layerId}:`, error);
          }
        });
      }

      // Set to track new active layers
      const newActiveLayers: string[] = [];

      // Process each filter sequentially to avoid race conditions
      for (const filter of activeFilters) {
        try {
          // Skip if this layer is already loaded correctly
          if (map.current?.getLayer(filter) && activeLayers.includes(filter)) {
            newActiveLayers.push(filter);
            continue;
          }

          // Get GeoJSON data for this filter
          const geoJsonData = await getFilterGeoJSON(
            filter,
            currentDate,
            currentGeographicScope.type,
            currentGeographicScope.id,
          );

          // Skip if no features were returned
          if (!geoJsonData.features || geoJsonData.features.length === 0) {
            console.warn(`No data available for ${filter}`);
            continue;
          }

          // Add source if it doesn't exist yet
          const sourceId = `source-${filter}`;
          if (map.current?.getSource(sourceId)) {
            // Update existing source
            const source = map.current.getSource(sourceId);
            if (source) {
              (source as maplibregl.GeoJSONSource).setData(geoJsonData);
            }
          } else {
            // Create new source
            map.current?.addSource(sourceId, {
              type: "geojson",
              data: geoJsonData,
            });
          }

          // Wait a small amount of time to ensure source is added
          await new Promise((resolve) => setTimeout(resolve, 50));

          // Create fill layer
          if (!map.current?.getLayer(filter)) {
            const colorStops = getColorScaleExpression(
              filter,
              currentGeographicScope.type,
            );

            map.current?.addLayer({
              id: filter,
              type: "fill",
              source: sourceId,
              paint: {
                "fill-color": [
                  "interpolate",
                  ["linear"],
                  ["get", "value"],
                  ...colorStops.flat(),
                ],
                "fill-opacity": 0.7,
                "fill-outline-color": "rgba(0, 0, 0, 0.5)",
              },
            });
          }

          // Create line layer for outlines
          const lineLayerId = `${filter}-line`;
          if (!map.current?.getLayer(lineLayerId)) {
            const lineWidth =
              currentGeographicScope.type === "zipcode"
                ? 2
                : currentGeographicScope.type === "city"
                  ? 1.5
                  : currentGeographicScope.type === "county"
                    ? 1
                    : 0.5;

            map.current?.addLayer({
              id: lineLayerId,
              type: "line",
              source: sourceId,
              paint: {
                "line-color": "rgba(0, 0, 0, 0.5)",
                "line-width": lineWidth,
              },
            });
          }

          newActiveLayers.push(filter);
        } catch (error) {
          console.error(`Error adding layer for ${filter}:`, error);
        }
      }

      // Update active layers state
      setActiveLayers(newActiveLayers);

      // Set the first active filter as selected for the legend
      if (newActiveLayers.length > 0 && !selectedFilter) {
        setSelectedFilter(newActiveLayers[0] as FilterType);
        setShowLegend(true);
      } else if (newActiveLayers.length === 0) {
        setSelectedFilter(null);
        setShowLegend(false);
      }
    } catch (err) {
      console.error("[MapDashboard] Error updating map layers:", err);
      setError("Failed to update map data");
    } finally {
      setLoading(false);
    }
  }, [
    activeFilters,
    mapLoaded,
    currentDate,
    currentGeographicScope,
    selectedFilter,
  ]);

  // Use the optimized updateLayers function
  useEffect(() => {
    console.log("[MapDashboard] useEffect - updateLayers");
    void updateLayers();
  }, [updateLayers]);

  // Fix: Add useEffect for handling style changes to ensure layers persist
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Add event handler for style.load to restore layers
    const handleStyleLoad = () => {
      console.log("Style loaded, restoring layers");

      // Force reloading of active layers by triggering the effect
      const currentFilters = [...activeFilters];
      setActiveLayers([]);

      // Small delay to allow the style to fully load
      setTimeout(() => {
        // This will re-trigger the effect that adds the layers
        // We're using the same state setter that was passed to the component
        if (currentFilters.length > 0) {
          // Clear and then restore the filters to trigger a refresh
          setActiveLayers([]);
          setTimeout(() => {
            setActiveLayers(currentFilters.map((f) => f as string));
          }, 100);
        }
      }, 200);
    };

    // Add the event handler
    map.current.on("style.load", handleStyleLoad);

    // Cleanup
    return () => {
      if (map.current) {
        map.current.off("style.load", handleStyleLoad);
      }
    };
  }, [map.current, mapLoaded, activeFilters]);

  // Modify the changeMapStyle function
  const changeMapStyle = async (style: MapStyle) => {
    if (!map.current) {
      console.error("Map instance not found");
      return;
    }

    try {
      // Store current view state
      const center = map.current.getCenter();
      const zoom = map.current.getZoom();
      setCurrentStyle(style);

      // Set the new style - our 'style.load' handler will take care of restoring layers
      map.current.setStyle(mapStyles[style]);

      // Restore the center and zoom after a small delay
      setTimeout(() => {
        if (map.current) {
          map.current.setCenter(center);
          map.current.setZoom(zoom);
        }
      }, 300);
    } catch (error) {
      console.error("Error changing map style:", error);
    }
  };

  // Helper function to safely get property values
  const getPropertySafe = <T,>(
    obj: MapGeoJSONFeature | null,
    prop: string,
    defaultValue: T,
  ): T => {
    if (!obj || !obj.properties) return defaultValue;
    return (obj.properties[prop] as T) ?? defaultValue;
  };

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div
        ref={mapContainer}
        className="absolute inset-0 h-full w-full"
        style={{ display: "block" }}
      />

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/30">
          <div className="rounded-lg bg-gray-800 px-4 py-2 text-white">
            Loading map data...
          </div>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="absolute left-0 right-0 top-20 mx-auto w-max rounded-lg bg-red-900/80 px-4 py-2 text-white shadow-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Map Style Controls */}
      <div className="absolute left-4 top-4 z-10">
        <MapStyleSelector
          currentStyle={currentStyle}
          onStyleChange={changeMapStyle}
        />
      </div>

      {/* Active Location */}
      {selectedLocation && (
        <div className="absolute left-[120px] right-16 top-4 z-10 overflow-hidden truncate rounded-md bg-gray-800/80 px-3 py-1.5 text-sm text-white">
          {selectedLocation}
        </div>
      )}

      {/* Current Date Display */}
      {currentDate && (
        <div className="absolute right-4 top-16 z-10 flex items-center gap-1.5 rounded-md bg-gray-800/80 px-3 py-1.5 text-sm text-white">
          <Calendar className="h-4 w-4" />
          <span>
            {new Date(currentDate).toLocaleDateString("en-US", {
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>
      )}

      {/* Hover Information */}
      {hoveredFeature && (
        <div className="absolute bottom-24 right-4 z-20 w-64 rounded-md bg-gray-800/90 p-3 text-xs text-white shadow-xl">
          <div className="mb-1 font-medium">
            {getPropertySafe(hoveredFeature, "name", "Unknown")}
          </div>
          {hoveredFeature.properties?.filter && (
            <div className="flex items-center justify-between">
              <span>
                {filterNames[
                  getPropertySafe(hoveredFeature, "filter", "") as FilterType
                ] || "Value"}
                :
              </span>
              <span className="font-medium">
                {formatMetricValue(
                  getPropertySafe(hoveredFeature, "value", 0),
                  getPropertySafe(hoveredFeature, "filter", "") as FilterType,
                )}
              </span>
            </div>
          )}
          <div className="mt-1.5 text-[10px] text-gray-300">
            Click for more details
          </div>
        </div>
      )}

      {/* Legend */}
      {showLegend && selectedFilter && (
        <div className="absolute bottom-24 left-4 z-10 w-60 rounded-md bg-gray-800/90 p-3 text-xs text-white shadow-lg">
          <div className="mb-2 font-medium">{filterNames[selectedFilter]}</div>
          <div className="space-y-1">
            {generateLegend(selectedFilter).map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div
                  className="h-3 w-6"
                  style={{ backgroundColor: item.color }}
                ></div>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
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
                  <li
                    key={layer}
                    className="flex cursor-pointer items-center gap-1.5 hover:text-orange-300"
                    onClick={() => {
                      setSelectedFilter(layer as FilterType);
                      setShowLegend(true);
                    }}
                  >
                    <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                    <span>{filterNames[layer as FilterType]}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 text-[10px] text-gray-300">
                Click on a layer to view its legend
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
