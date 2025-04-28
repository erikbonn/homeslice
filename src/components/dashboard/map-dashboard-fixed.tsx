"use client";

import { useEffect, useRef, useState } from "react";
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

  // Fetch the most recent date when component mounts
  useEffect(() => {
    const fetchLatestDate = async () => {
      try {
        const date = await getLatestDate();
        setCurrentDate(date);
      } catch (error) {
        console.error("Error fetching latest date:", error);
        setError("Failed to load market data");
      }
    };

    void fetchLatestDate();
  }, []);

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

    // Set up map interactions
    if (map.current) {
      // Mouse events for features
      map.current.on("mousemove", (e) => {
        if (!map.current) return;

        // Only query layers that actually exist in the map
        const existingLayers = activeLayers.filter((layer) =>
          map.current?.getLayer(layer),
        );

        if (existingLayers.length === 0) return;

        // Find features at mouse position
        const features = map.current.queryRenderedFeatures(e.point, {
          layers: existingLayers,
        });

        // Update cursor style and hovered feature
        if (features.length > 0) {
          map.current.getCanvas().style.cursor = "pointer";
          setHoveredFeature(features[0] ?? null);
        } else {
          map.current.getCanvas().style.cursor = "";
          setHoveredFeature(null);
        }
      });

      map.current.on("mouseleave", () => {
        if (!map.current) return;
        map.current.getCanvas().style.cursor = "";
        setHoveredFeature(null);
      });

      // Click event for features
      map.current.on("click", (e) => {
        if (!map.current) return;

        // Only query layers that actually exist in the map
        const existingLayers = activeLayers.filter((layer) =>
          map.current?.getLayer(layer),
        );

        if (existingLayers.length === 0) return;

        // Find features at click position
        const features = map.current.queryRenderedFeatures(e.point, {
          layers: existingLayers,
        });

        if (features.length > 0 && features[0]) {
          const feature = features[0];
          // Do something with the clicked feature
          console.log("Clicked feature:", feature);

          // Fly to the clicked feature
          if (
            feature.geometry?.type === "Polygon" &&
            feature.geometry.coordinates?.[0]
          ) {
            // Calculate the center of the polygon
            const coordinates = feature.geometry.coordinates[0];
            if (coordinates && coordinates.length > 0) {
              // Safe type checking for coordinates
              const typedCoordinates = coordinates as Array<[number, number]>;
              const bounds = typedCoordinates.reduce<
                [[number, number], [number, number]]
              >(
                (bounds, coord) => {
                  return [
                    [
                      Math.min(bounds[0][0], coord[0]),
                      Math.min(bounds[0][1], coord[1]),
                    ],
                    [
                      Math.max(bounds[1][0], coord[0]),
                      Math.max(bounds[1][1], coord[1]),
                    ],
                  ];
                },
                [
                  [Infinity, Infinity],
                  [-Infinity, -Infinity],
                ],
              );

              map.current.fitBounds(bounds, {
                padding: 50,
                duration: 1000,
              });
            }
          }
        }
      });
    }

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

  // Handle filter changes
  useEffect(() => {
    if (!map.current || !mapLoaded || !currentDate) return;

    setLoading(true);
    setError(null);

    const updateActiveLayers = async () => {
      try {
        // Remove old layers no longer active
        activeLayers.forEach((layerId) => {
          if (
            !activeFilters.includes(layerId as FilterType) &&
            map.current?.getLayer(layerId)
          ) {
            // Also remove line layers if they exist
            if (map.current.getLayer(`${layerId}-line`)) {
              map.current.removeLayer(`${layerId}-line`);
            }

            if (map.current.getLayer(layerId)) {
              map.current.removeLayer(layerId);
            }
            if (map.current.getSource(`source-${layerId}`)) {
              map.current.removeSource(`source-${layerId}`);
            }
          }
        });

        // Set to track new active layers
        const newActiveLayers: string[] = [];

        // Process each filter one by one to avoid race conditions
        for (const filter of activeFilters) {
          try {
            // Skip if this layer is already loaded correctly
            if (
              map.current?.getLayer(filter) &&
              activeLayers.includes(filter)
            ) {
              newActiveLayers.push(filter);
              continue;
            }

            // Get GeoJSON data for this filter
            // Pass the current geographic scope to get the right level of detail
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

            // Check if source exists
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

            // Wait a brief moment to ensure source is ready
            await new Promise((resolve) => setTimeout(resolve, 50));

            // Check if layer exists
            if (map.current?.getLayer(filter)) {
              // Layer exists, no need to recreate
            } else {
              // Create fill layer - adjust the layer settings based on geographic scope
              map.current?.addLayer({
                id: filter,
                type: "fill",
                source: sourceId,
                paint: {
                  "fill-color": getColorScaleExpression(
                    filter,
                    currentGeographicScope.type,
                  ) as maplibregl.PropertyValueSpecification<string>,
                  "fill-opacity": 0.7,
                  "fill-outline-color": "rgba(0, 0, 0, 0.5)",
                },
              });

              // Wait a brief moment to ensure layer is ready
              await new Promise((resolve) => setTimeout(resolve, 50));

              // Create line layer for outlines - make lines more prominent for smaller areas
              const lineWidth =
                currentGeographicScope.type === "zipcode"
                  ? 2
                  : currentGeographicScope.type === "city"
                    ? 1.5
                    : currentGeographicScope.type === "county"
                      ? 1
                      : 0.5;

              map.current?.addLayer({
                id: `${filter}-line`,
                type: "line",
                source: sourceId,
                paint: {
                  "line-color": "rgba(0, 0, 0, 0.5)",
                  "line-width": lineWidth,
                },
              });
            }

            // Wait for layer to be ready
            await new Promise((resolve) => setTimeout(resolve, 50));

            // Verify the layer was added successfully
            if (map.current?.getLayer(filter)) {
              // Add to active layers
              newActiveLayers.push(filter);
            } else {
              console.warn(`Failed to add layer: ${filter}`);
            }
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
        console.error("Error updating map layers:", err);
        setError("Failed to update map data");
      } finally {
        setLoading(false);
      }
    };

    void updateActiveLayers();
  }, [activeFilters, mapLoaded, currentDate, currentGeographicScope]);

  const changeMapStyle = async (style: MapStyle) => {
    if (!map.current) {
      console.error("Map instance not found");
      return;
    }

    try {
      // Store current view state
      const center = map.current.getCenter();
      const zoom = map.current.getZoom();
      const currentActiveLayers = [...activeLayers];

      // Remove previous style load handler if it exists
      if (styleLoadHandlerRef.current) {
        map.current.off("style.load", styleLoadHandlerRef.current);
        styleLoadHandlerRef.current = null;
      }

      // Clear active layers temporarily
      setActiveLayers([]);

      // Create new style load handler
      const styleLoadHandler = () => {
        if (map.current) {
          map.current.setCenter(center);
          map.current.setZoom(zoom);
          setCurrentStyle(style);

          // Re-add active layers after style change
          // This will trigger the useEffect for activeFilters
          setActiveLayers(currentActiveLayers);
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
    <div className="relative h-[600px] w-full overflow-hidden rounded-lg">
      <div ref={mapContainer} className="absolute top-0 left-0 h-full w-full" />

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
        <div className="absolute top-20 right-0 left-0 mx-auto w-max rounded-lg bg-red-900/80 px-4 py-2 text-white shadow-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            <span>{error}</span>
          </div>
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

      {/* Current Date Display */}
      {currentDate && (
        <div className="absolute top-16 right-4 z-10 flex items-center gap-1.5 rounded-md bg-gray-800/80 px-3 py-1.5 text-sm text-white">
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
        <div className="absolute right-4 bottom-24 z-20 w-64 rounded-md bg-gray-800/90 p-3 text-xs text-white shadow-xl">
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
