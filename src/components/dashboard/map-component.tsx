"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

interface MapData {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    geometry: {
      type: "Polygon";
      coordinates: number[][][];
    };
    properties: {
      id: string;
      name: string;
      value: number;
    };
  }>;
}

interface MapComponentProps {
  data: MapData;
  filter: string | null;
}

type HoveredFeature = {
  properties: {
    name: string;
    value: number;
  };
} | null;

export function MapComponent({ data, filter }: MapComponentProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [hoveredFeature, setHoveredFeature] = useState<HoveredFeature>(null);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://demotiles.maplibre.org/style.json",
      center: [-98.5795, 39.8283],
      zoom: 3.5,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");

    map.on("load", () => {
      map.addSource("market-data", {
        type: "geojson",
        data,
      });

      map.addLayer({
        id: "market-data-fill",
        type: "fill",
        source: "market-data",
        paint: {
          "fill-color": [
            "interpolate",
            ["linear"],
            ["get", "value"],
            0,
            "#f7fbff",
            100000,
            "#deebf7",
            200000,
            "#c6dbef",
            300000,
            "#9ecae1",
            400000,
            "#6baed6",
            500000,
            "#4292c6",
            600000,
            "#2171b5",
            700000,
            "#08519c",
            800000,
            "#08306b",
          ],
          "fill-opacity": 0.7,
        },
      });

      map.addLayer({
        id: "market-data-line",
        type: "line",
        source: "market-data",
        paint: {
          "line-color": "rgba(0, 0, 0, 0.5)",
          "line-width": 1,
        },
      });

      map.on("mousemove", "market-data-fill", (e) => {
        if (e.features?.[0]) {
          map.getCanvas().style.cursor = "pointer";
          const feature = e.features[0];
          setHoveredFeature({
            properties: {
              name: String(feature.properties?.name ?? ""),
              value: Number(feature.properties?.value ?? 0),
            },
          });
        }
      });

      map.on("mouseleave", "market-data-fill", () => {
        map.getCanvas().style.cursor = "";
        setHoveredFeature(null);
      });
    });

    mapRef.current = map;

    return () => {
      map.remove();
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !data) return;

    const source = mapRef.current.getSource("market-data");
    if (source) {
      (source as maplibregl.GeoJSONSource).setData(data);
    }
  }, [data]);

  return (
    <div className="relative h-full w-full">
      <div ref={mapContainer} className="absolute left-0 top-0 h-full w-full" />

      {hoveredFeature && (
        <div className="absolute bottom-24 right-4 z-20 w-64 rounded-md bg-gray-800/90 p-3 text-xs text-white shadow-xl">
          <div className="mb-1 font-medium">
            {hoveredFeature.properties.name}
          </div>
          <div className="flex items-center justify-between">
            <span>{filter}:</span>
            <span className="font-medium">
              ${hoveredFeature.properties.value.toLocaleString()}
            </span>
          </div>
        </div>
      )}

      <div className="absolute bottom-24 left-4 z-10 w-60 rounded-md bg-gray-800/90 p-3 text-xs text-white shadow-lg">
        <div className="mb-2 font-medium">{filter}</div>
        <div className="space-y-1">
          {[
            { color: "#f7fbff", label: "$0" },
            { color: "#deebf7", label: "$100k" },
            { color: "#c6dbef", label: "$200k" },
            { color: "#9ecae1", label: "$300k" },
            { color: "#6baed6", label: "$400k" },
            { color: "#4292c6", label: "$500k" },
            { color: "#2171b5", label: "$600k" },
            { color: "#08519c", label: "$700k" },
            { color: "#08306b", label: "$800k+" },
          ].map((item, i) => (
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
    </div>
  );
}
