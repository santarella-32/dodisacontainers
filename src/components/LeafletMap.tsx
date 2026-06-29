import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Real coordinates for each city
const CITY_COORDS: Record<string, [number, number]> = {
  "Santa Rosa":      [-27.872, -54.481],
  "Porto Alegre":    [-30.035, -51.218],
  "Ijuí":            [-28.388, -53.915],
  "Passo Fundo":     [-28.262, -52.407],
  "Chapecó":         [-27.098, -52.616],
  "Florianópolis":   [-27.595, -48.548],
  "Joinville":       [-26.304, -48.846],
  "Curitiba":        [-25.429, -49.267],
  "Londrina":        [-23.310, -51.153],
  "Maringá":         [-23.425, -51.938],
  "São Paulo":       [-23.550, -46.633],
  "Campinas":        [-22.905, -47.061],
  "Rio de Janeiro":  [-22.907, -43.173],
  "Belo Horizonte":  [-19.917, -43.935],
  "Uberlândia":      [-18.918, -48.276],
  "Campo Grande":    [-20.443, -54.647],
  "Goiânia":         [-16.687, -49.265],
  "Brasília":        [-15.780, -47.929],
  "Salvador":        [-12.971, -38.501],
  "Recife":           [-8.054, -34.881],
  "Fortaleza":        [-3.717, -38.543],
};

// Route coordinate sequences (lat/lng)
const ROUTE_COORDS: Record<string, [number, number][]> = {
  "sul-fronteira": [
    CITY_COORDS["Santa Rosa"],
    CITY_COORDS["Ijuí"],
    CITY_COORDS["Passo Fundo"],
    CITY_COORDS["Porto Alegre"],
  ],
  "sc-corredor": [
    CITY_COORDS["Santa Rosa"],
    CITY_COORDS["Chapecó"],
    CITY_COORDS["Florianópolis"],
    CITY_COORDS["Joinville"],
  ],
  "pr-eixo": [
    CITY_COORDS["Santa Rosa"],
    CITY_COORDS["Chapecó"],
    CITY_COORDS["Curitiba"],
    CITY_COORDS["Londrina"],
    CITY_COORDS["Maringá"],
  ],
  "sudeste-sp": [
    CITY_COORDS["Santa Rosa"],
    CITY_COORDS["Curitiba"],
    CITY_COORDS["Campinas"],
    CITY_COORDS["São Paulo"],
  ],
  "sudeste-rio": [
    CITY_COORDS["Santa Rosa"],
    CITY_COORDS["São Paulo"],
    CITY_COORDS["Rio de Janeiro"],
  ],
  "sudeste-mg": [
    CITY_COORDS["Santa Rosa"],
    CITY_COORDS["São Paulo"],
    CITY_COORDS["Belo Horizonte"],
    CITY_COORDS["Uberlândia"],
  ],
  "centro-oeste": [
    CITY_COORDS["Santa Rosa"],
    CITY_COORDS["Campo Grande"],
    CITY_COORDS["Goiânia"],
    CITY_COORDS["Brasília"],
  ],
};

interface LeafletMapProps {
  selectedRouteId: string;
  onCityClick?: (routeId: string) => void;
}

const ROUTE_CITY_MAP: Record<string, string> = {
  "Porto Alegre":   "sul-fronteira",
  "Florianópolis":  "sc-corredor",
  "Curitiba":       "pr-eixo",
  "São Paulo":      "sudeste-sp",
  "Rio de Janeiro": "sudeste-rio",
  "Belo Horizonte": "sudeste-mg",
  "Brasília":       "centro-oeste",
};

export default function LeafletMap({ selectedRouteId, onCityClick }: LeafletMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const glowLayerRef = useRef<L.Polyline | null>(null);
  const markersRef = useRef<L.CircleMarker[]>([]);

  // Initialize map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [-20, -50],
      zoom: 4,
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: false,
    });

    // CartoDB Dark Matter - free, no API key, matches site theme
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      { subdomains: "abcd", maxZoom: 19 }
    ).addTo(map);

    // Subtle attribution
    L.control.attribution({ position: "bottomright", prefix: "" })
      .addAttribution('<span style="opacity:0.3;font-size:9px">© CartoDB</span>')
      .addTo(map);

    // Zoom control top-right
    L.control.zoom({ position: "topright" }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update route and markers when selection changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove old route lines
    routeLayerRef.current?.remove();
    glowLayerRef.current?.remove();

    // Remove old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const coords = ROUTE_COORDS[selectedRouteId];
    if (!coords) return;

    // Glow effect (thick blurred yellow line underneath)
    glowLayerRef.current = L.polyline(coords, {
      color: "#FFD400",
      weight: 10,
      opacity: 0.12,
      smoothFactor: 2,
    }).addTo(map);

    // Main route line
    routeLayerRef.current = L.polyline(coords, {
      color: "#FFD400",
      weight: 2.5,
      opacity: 0.9,
      smoothFactor: 2,
      dashArray: "6, 4",
    }).addTo(map);

    // Passive city dots for all other cities
    Object.entries(CITY_COORDS).forEach(([name, latlng]) => {
      if (name === "Santa Rosa") return;
      const isOnRoute = coords.some(
        (c) => Math.abs(c[0] - latlng[0]) < 0.1 && Math.abs(c[1] - latlng[1]) < 0.1
      );

      const marker = L.circleMarker(latlng, {
        radius: isOnRoute ? 6 : 3,
        fillColor: isOnRoute ? "#FFFFFF" : "#888",
        color: isOnRoute ? "#FFD400" : "transparent",
        weight: isOnRoute ? 1.5 : 0,
        fillOpacity: isOnRoute ? 1 : 0.4,
      }).addTo(map);

      if (isOnRoute) {
        marker.bindTooltip(`<span style="font-family:monospace;font-size:11px;font-weight:bold">${name}</span>`, {
          permanent: false,
          direction: "top",
          className: "dodisa-tooltip",
        });
      }

      const routeId = ROUTE_CITY_MAP[name];
      if (routeId && onCityClick) {
        marker.on("click", () => onCityClick(routeId));
        marker.getElement()?.style.setProperty("cursor", "pointer");
      }

      markersRef.current.push(marker);
    });

    // Hub marker (Santa Rosa) — always visible, prominent
    const hub = L.circleMarker(CITY_COORDS["Santa Rosa"], {
      radius: 9,
      fillColor: "#FFD400",
      color: "#111827",
      weight: 2.5,
      fillOpacity: 1,
    }).addTo(map);

    hub.bindTooltip(
      '<span style="font-family:monospace;font-size:11px;font-weight:bold;color:#FFD400">⬟ Santa Rosa — Hub Dodisa</span>',
      { permanent: true, direction: "right", className: "dodisa-tooltip" }
    );

    markersRef.current.push(hub);

    // Fit map to show the route with padding
    const bounds = L.latLngBounds([CITY_COORDS["Santa Rosa"], ...coords]);
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 7 });
  }, [selectedRouteId, onCityClick]);

  return (
    <>
      <style>{`
        .leaflet-container { background: #07090D !important; }
        .dodisa-tooltip {
          background: rgba(7,9,13,0.95) !important;
          border: 1px solid rgba(255,212,0,0.25) !important;
          border-radius: 6px !important;
          padding: 4px 10px !important;
          box-shadow: 0 4px 20px rgba(0,0,0,0.5) !important;
          color: #fff !important;
        }
        .dodisa-tooltip::before { display: none !important; }
        .leaflet-control-zoom a {
          background: #111827 !important;
          color: #FFD400 !important;
          border-color: rgba(255,255,255,0.08) !important;
        }
        .leaflet-control-zoom a:hover { background: #1f2937 !important; }
        .leaflet-control-attribution { background: transparent !important; }
      `}</style>
      <div
        ref={containerRef}
        className="w-full h-full rounded-xl overflow-hidden"
        style={{ minHeight: "340px" }}
      />
    </>
  );
}
