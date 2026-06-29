import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const CITY_COORDS: Record<string, [number, number]> = {
  "Santa Rosa":      [-27.872, -54.481],
  "Porto Alegre":    [-30.035, -51.218],
  "Ijuí":            [-28.388, -53.915],
  "Passo Fundo":     [-28.262, -52.407],
  "Pelotas":         [-31.772, -52.342],
  "Chapecó":         [-27.098, -52.616],
  "Florianópolis":   [-27.595, -48.548],
  "Joinville":       [-26.304, -48.846],
  "Blumenau":        [-26.919, -49.066],
  "Curitiba":        [-25.429, -49.267],
  "Londrina":        [-23.310, -51.153],
  "Maringá":         [-23.425, -51.938],
  "Cascavel":        [-24.957, -53.455],
  "São Paulo":       [-23.550, -46.633],
  "Campinas":        [-22.905, -47.061],
  "Santos":          [-23.961, -46.333],
  "Rio de Janeiro":  [-22.907, -43.173],
  "Niterói":         [-22.884, -43.104],
  "Belo Horizonte":  [-19.917, -43.935],
  "Uberlândia":      [-18.918, -48.276],
  "Juiz de Fora":    [-21.764, -43.349],
  "Campo Grande":    [-20.443, -54.647],
  "Dourados":        [-22.221, -54.805],
  "Goiânia":         [-16.687, -49.265],
  "Brasília":        [-15.780, -47.929],
  "Anápolis":        [-16.328, -48.953],
};

const ROUTE_COORDS: Record<string, [number, number][]> = {
  "sul-fronteira": [
    CITY_COORDS["Santa Rosa"],
    CITY_COORDS["Ijuí"],
    CITY_COORDS["Passo Fundo"],
    CITY_COORDS["Porto Alegre"],
    CITY_COORDS["Pelotas"],
  ],
  "sc-corredor": [
    CITY_COORDS["Santa Rosa"],
    CITY_COORDS["Chapecó"],
    CITY_COORDS["Blumenau"],
    CITY_COORDS["Joinville"],
    CITY_COORDS["Florianópolis"],
  ],
  "pr-eixo": [
    CITY_COORDS["Santa Rosa"],
    CITY_COORDS["Chapecó"],
    CITY_COORDS["Cascavel"],
    CITY_COORDS["Curitiba"],
    CITY_COORDS["Londrina"],
    CITY_COORDS["Maringá"],
  ],
  "sudeste-sp": [
    CITY_COORDS["Santa Rosa"],
    CITY_COORDS["Curitiba"],
    CITY_COORDS["Campinas"],
    CITY_COORDS["São Paulo"],
    CITY_COORDS["Santos"],
  ],
  "sudeste-rio": [
    CITY_COORDS["Santa Rosa"],
    CITY_COORDS["São Paulo"],
    CITY_COORDS["Rio de Janeiro"],
    CITY_COORDS["Niterói"],
  ],
  "sudeste-mg": [
    CITY_COORDS["Santa Rosa"],
    CITY_COORDS["São Paulo"],
    CITY_COORDS["Juiz de Fora"],
    CITY_COORDS["Belo Horizonte"],
    CITY_COORDS["Uberlândia"],
  ],
  "centro-oeste": [
    CITY_COORDS["Santa Rosa"],
    CITY_COORDS["Dourados"],
    CITY_COORDS["Campo Grande"],
    CITY_COORDS["Anápolis"],
    CITY_COORDS["Goiânia"],
    CITY_COORDS["Brasília"],
  ],
};

const ROUTE_CITY_MAP: Record<string, string> = {
  "Porto Alegre":   "sul-fronteira",
  "Florianópolis":  "sc-corredor",
  "Curitiba":       "pr-eixo",
  "São Paulo":      "sudeste-sp",
  "Rio de Janeiro": "sudeste-rio",
  "Belo Horizonte": "sudeste-mg",
  "Brasília":       "centro-oeste",
};

interface LeafletMapProps {
  selectedRouteId: string;
  onCityClick?: (routeId: string) => void;
}

export default function LeafletMap({ selectedRouteId, onCityClick }: LeafletMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layersRef = useRef<L.Layer[]>([]);
  const isFirstRender = useRef(true);

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

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      { subdomains: "abcd", maxZoom: 19 }
    ).addTo(map);

    L.control.attribution({ position: "bottomright", prefix: "" })
      .addAttribution('<span style="opacity:0.25;font-size:9px">© CartoDB © OSM</span>')
      .addTo(map);

    L.control.zoom({ position: "topright" }).addTo(map);

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update layers when route changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear previous layers
    layersRef.current.forEach((l) => l.remove());
    layersRef.current = [];

    const coords = ROUTE_COORDS[selectedRouteId];
    if (!coords) return;

    // 1. Thick glow base
    const glow = L.polyline(coords, {
      color: "#FFD400",
      weight: 16,
      opacity: 0.07,
      smoothFactor: 2,
      lineCap: "round",
    }).addTo(map);

    // 2. Mid glow
    const glow2 = L.polyline(coords, {
      color: "#FFD400",
      weight: 6,
      opacity: 0.18,
      smoothFactor: 2,
      lineCap: "round",
    }).addTo(map);

    // 3. Solid base route line
    const solidLine = L.polyline(coords, {
      color: "#FFD400",
      weight: 2,
      opacity: 0.55,
      smoothFactor: 2,
      lineCap: "round",
    }).addTo(map);

    // 4. Animated dashed overlay — simulates truck movement
    const animLine = L.polyline(coords, {
      color: "#FFFFFF",
      weight: 2,
      opacity: 0.9,
      dashArray: "10, 18",
      className: "dodisa-route-anim",
      lineCap: "round",
    } as any).addTo(map);

    layersRef.current.push(glow, glow2, solidLine, animLine);

    // 5. Route city markers + labels
    coords.forEach((latlng, i) => {
      const isOrigin = i === 0;
      const isDestination = i === coords.length - 1;

      if (isOrigin) {
        // Custom pulsing hub marker (Santa Rosa)
        const hubIcon = L.divIcon({
          className: "",
          html: `
            <div class="dodisa-hub-wrapper">
              <div class="dodisa-hub-pulse"></div>
              <div class="dodisa-hub-pulse dodisa-hub-pulse-2"></div>
              <div class="dodisa-hub-dot"></div>
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const hubMarker = L.marker(latlng, { icon: hubIcon, zIndexOffset: 1000 }).addTo(map);
        hubMarker.bindTooltip(
          `<span class="dodisa-tip-hub">⬟ Hub Dodisa — Santa Rosa</span>`,
          { permanent: true, direction: "right", className: "dodisa-tooltip dodisa-tooltip-hub" }
        );
        layersRef.current.push(hubMarker);
      } else {
        // Find city name for this coordinate
        const cityName = Object.entries(CITY_COORDS).find(
          ([, c]) => Math.abs(c[0] - latlng[0]) < 0.01 && Math.abs(c[1] - latlng[1]) < 0.01
        )?.[0];

        const cityIcon = L.divIcon({
          className: "",
          html: `<div class="${isDestination ? "dodisa-city-dest" : "dodisa-city-dot"}"></div>`,
          iconSize: isDestination ? [14, 14] : [10, 10],
          iconAnchor: isDestination ? [7, 7] : [5, 5],
        });

        const cityMarker = L.marker(latlng, { icon: cityIcon }).addTo(map);

        if (cityName) {
          cityMarker.bindTooltip(
            `<span class="dodisa-tip-city">${cityName}</span>`,
            {
              permanent: isDestination,
              direction: "top",
              className: `dodisa-tooltip ${isDestination ? "dodisa-tooltip-dest" : ""}`,
            }
          );

          const routeId = ROUTE_CITY_MAP[cityName];
          if (routeId && onCityClick) {
            cityMarker.on("click", () => onCityClick(routeId));
          }
        }

        layersRef.current.push(cityMarker);
      }
    });

    // 6. Fly/fit to route with smooth animation
    const bounds = L.latLngBounds([CITY_COORDS["Santa Rosa"], ...coords]);
    if (isFirstRender.current) {
      map.fitBounds(bounds, { padding: [52, 52], maxZoom: 7 });
      isFirstRender.current = false;
    } else {
      map.flyToBounds(bounds, { padding: [52, 52], maxZoom: 7, duration: 1.2 });
    }
  }, [selectedRouteId, onCityClick]);

  return (
    <>
      <style>{`
        /* Map background */
        .leaflet-container { background: #07090D !important; }

        /* Animated dashed route line */
        .dodisa-route-anim {
          animation: dodisaDash 1.8s linear infinite;
        }
        @keyframes dodisaDash {
          from { stroke-dashoffset: 28; }
          to   { stroke-dashoffset: 0; }
        }

        /* Hub pulsing wrapper */
        .dodisa-hub-wrapper {
          position: relative;
          width: 28px;
          height: 28px;
        }
        .dodisa-hub-dot {
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          width: 12px; height: 12px;
          border-radius: 50%;
          background: #FFD400;
          border: 2px solid #111827;
          z-index: 3;
          box-shadow: 0 0 8px #FFD400aa;
        }
        .dodisa-hub-pulse {
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          width: 28px; height: 28px;
          border-radius: 50%;
          border: 2px solid #FFD400;
          animation: hubPulse 2s ease-out infinite;
          opacity: 0;
        }
        .dodisa-hub-pulse-2 {
          animation-delay: 1s;
        }
        @keyframes hubPulse {
          0%   { transform: translate(-50%,-50%) scale(0.4); opacity: 0.8; }
          100% { transform: translate(-50%,-50%) scale(1.6); opacity: 0; }
        }

        /* City dots */
        .dodisa-city-dot {
          width: 10px; height: 10px;
          border-radius: 50%;
          background: #fff;
          border: 1.5px solid #FFD400;
          box-shadow: 0 0 5px #FFD40066;
        }
        .dodisa-city-dest {
          width: 14px; height: 14px;
          border-radius: 50%;
          background: #FFD400;
          border: 2px solid #111827;
          box-shadow: 0 0 10px #FFD400aa;
        }

        /* Tooltips */
        .dodisa-tooltip {
          background: rgba(7,9,13,0.92) !important;
          border: 1px solid rgba(255,212,0,0.2) !important;
          border-radius: 6px !important;
          padding: 3px 9px !important;
          box-shadow: 0 4px 24px rgba(0,0,0,0.6) !important;
          color: #d4d4d8 !important;
          font-family: monospace;
          font-size: 11px;
          white-space: nowrap;
        }
        .dodisa-tooltip::before,
        .dodisa-tooltip::after { display: none !important; }
        .dodisa-tooltip-hub {
          border-color: rgba(255,212,0,0.45) !important;
        }
        .dodisa-tooltip-dest {
          border-color: rgba(255,212,0,0.35) !important;
        }
        .dodisa-tip-hub {
          color: #FFD400;
          font-weight: bold;
          font-size: 11px;
        }
        .dodisa-tip-city {
          color: #e5e7eb;
          font-size: 11px;
        }

        /* Zoom controls */
        .leaflet-control-zoom a {
          background: rgba(17,24,39,0.95) !important;
          color: #FFD400 !important;
          border-color: rgba(255,255,255,0.08) !important;
          backdrop-filter: blur(8px);
        }
        .leaflet-control-zoom a:hover {
          background: #1f2937 !important;
          color: #fff !important;
        }
        .leaflet-control-zoom {
          border: 1px solid rgba(255,255,255,0.06) !important;
          border-radius: 8px !important;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,0,0,0.4) !important;
        }
        .leaflet-control-attribution {
          background: transparent !important;
        }
      `}</style>
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{ minHeight: "340px" }}
      />
    </>
  );
}
