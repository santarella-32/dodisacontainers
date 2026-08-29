import React, { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { BaseLocation } from "../context/AppContext";

// ─── Predefined showcase routes ──────────────────────────────────────────────
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
  "sul-fronteira":  [CITY_COORDS["Santa Rosa"], CITY_COORDS["Ijuí"], CITY_COORDS["Passo Fundo"], CITY_COORDS["Porto Alegre"], CITY_COORDS["Pelotas"]],
  "sc-corredor":    [CITY_COORDS["Santa Rosa"], CITY_COORDS["Chapecó"], CITY_COORDS["Blumenau"], CITY_COORDS["Joinville"], CITY_COORDS["Florianópolis"]],
  "pr-eixo":        [CITY_COORDS["Santa Rosa"], CITY_COORDS["Chapecó"], CITY_COORDS["Cascavel"], CITY_COORDS["Curitiba"], CITY_COORDS["Londrina"], CITY_COORDS["Maringá"]],
  "sudeste-sp":     [CITY_COORDS["Santa Rosa"], CITY_COORDS["Curitiba"], CITY_COORDS["Campinas"], CITY_COORDS["São Paulo"], CITY_COORDS["Santos"]],
  "sudeste-rio":    [CITY_COORDS["Santa Rosa"], CITY_COORDS["São Paulo"], CITY_COORDS["Rio de Janeiro"], CITY_COORDS["Niterói"]],
  "sudeste-mg":     [CITY_COORDS["Santa Rosa"], CITY_COORDS["São Paulo"], CITY_COORDS["Juiz de Fora"], CITY_COORDS["Belo Horizonte"], CITY_COORDS["Uberlândia"]],
  "centro-oeste":   [CITY_COORDS["Santa Rosa"], CITY_COORDS["Dourados"], CITY_COORDS["Campo Grande"], CITY_COORDS["Anápolis"], CITY_COORDS["Goiânia"], CITY_COORDS["Brasília"]],
};

const ROUTE_CITY_MAP: Record<string, string> = {
  "Porto Alegre": "sul-fronteira", "Florianópolis": "sc-corredor",
  "Curitiba": "pr-eixo", "São Paulo": "sudeste-sp",
  "Rio de Janeiro": "sudeste-rio", "Belo Horizonte": "sudeste-mg", "Brasília": "centro-oeste",
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface RouteResult {
  distanceKm: number;
  durationMin: number;
  geometry: [number, number][];
}

// Falls back to the Santa Rosa hub whenever the stored base location has an
// invalid (non-finite) lat/lng — e.g. a failed geocode saved through the admin
// editor — so Leaflet never gets handed NaN and crashes flyToBounds/fitBounds.
function safeBaseCoords(loc: BaseLocation): [number, number] {
  if (Number.isFinite(loc.lat) && Number.isFinite(loc.lng)) return [loc.lat, loc.lng];
  return [-27.872, -54.481];
}

export interface LeafletMapProps {
  selectedRouteId: string;
  onCityClick?: (routeId: string) => void;
  baseLocation: BaseLocation;
  // When provided, shows real routing mode instead of predefined routes
  customDestination?: { lat: number; lng: number; label: string } | null;
}

// ─── Geocoding via Nominatim (global, no API key) ─────────────────────────────
export async function geocodeAddress(query: string): Promise<{ lat: number; lng: number; display: string } | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&addressdetails=1`;
    const res = await fetch(url, { headers: { "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8" } });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.length) return null;
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), display: data[0].display_name };
  } catch { return null; }
}

// ─── Routing via OSRM (global, no API key) ────────────────────────────────────
async function fetchOsrmRoute(from: [number, number], to: [number, number]): Promise<RouteResult | null> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${from[1]},${from[0]};${to[1]},${to[0]}?geometries=geojson&overview=full`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.code !== "Ok" || !data.routes?.length) return null;
    const route = data.routes[0];
    const coords: [number, number][] = route.geometry.coordinates.map(([lng, lat]: number[]) => [lat, lng]);
    return {
      distanceKm: Math.round(route.distance / 100) / 10,
      durationMin: Math.round(route.duration / 60),
      geometry: coords,
    };
  } catch { return null; }
}

// ─── Hub icon ────────────────────────────────────────────────────────────────
function makeHubIcon() {
  return L.divIcon({
    className: "",
    html: `<div class="dodisa-hub-wrapper"><div class="dodisa-hub-pulse"></div><div class="dodisa-hub-pulse dodisa-hub-pulse-2"></div><div class="dodisa-hub-dot"></div></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

function makeDestIcon(label: string) {
  return L.divIcon({
    className: "",
    html: `<div class="dodisa-dest-icon"><div class="dodisa-dest-pin"></div><div class="dodisa-dest-label">${label}</div></div>`,
    iconSize: [140, 48],
    iconAnchor: [14, 40],
  });
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function LeafletMap({ selectedRouteId, onCityClick, baseLocation, customDestination }: LeafletMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layersRef = useRef<L.Layer[]>([]);
  const isFirstRender = useRef(true);
  const [routeInfo, setRouteInfo] = useState<RouteResult | null>(null);
  const [routeError, setRouteError] = useState(false);

  // Init map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      center: [-20, -50], zoom: 4,
      zoomControl: false, attributionControl: false, scrollWheelZoom: false,
    });
    // CartoDB's free anonymous dark_all tiles now require an API key (their
    // basemaps.cartocdn.com endpoint started returning a watermarked "API KEY
    // REQUIRED" placeholder instead of real tiles). Standard OpenStreetMap
    // tiles are still free/keyless and reliable — inverted via CSS below
    // (.leaflet-tile-pane filter) to get the same dark aesthetic.
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { subdomains: "abc", maxZoom: 19 }).addTo(map);
    L.control.attribution({ position: "bottomright", prefix: "" })
      .addAttribution('<span style="opacity:.25;font-size:9px">© OpenStreetMap</span>').addTo(map);
    L.control.zoom({ position: "topright" }).addTo(map);
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  const clearLayers = useCallback(() => {
    layersRef.current.forEach((l) => l.remove());
    layersRef.current = [];
  }, []);

  // ── MODE A: Custom real route ─────────────────────────────────────────────
  useEffect(() => {
    if (!customDestination || !mapRef.current) return;
    const map = mapRef.current;
    clearLayers();
    setRouteInfo(null);
    setRouteError(false);

    const base: [number, number] = safeBaseCoords(baseLocation);
    const dest: [number, number] = [customDestination.lat, customDestination.lng];

    // Draw hub marker
    const hubMarker = L.marker(base, { icon: makeHubIcon(), zIndexOffset: 1000 }).addTo(map);
    hubMarker.bindTooltip(
      `<span class="dodisa-tip-hub">⬟ Hub Dodisa</span>`,
      { permanent: true, direction: "right", className: "dodisa-tooltip dodisa-tooltip-hub" }
    );

    // Draw destination marker
    const destMarker = L.marker(dest, { icon: makeDestIcon(customDestination.label), zIndexOffset: 900 }).addTo(map);

    layersRef.current.push(hubMarker, destMarker);

    // Straight line while loading
    const tempLine = L.polyline([base, dest], { color: "#FFD400", weight: 2, dashArray: "6,6", opacity: 0.4 }).addTo(map);
    layersRef.current.push(tempLine);

    map.fitBounds(L.latLngBounds([base, dest]), { padding: [60, 60], maxZoom: 10 });

    // Fetch real route
    fetchOsrmRoute(base, dest).then((result) => {
      tempLine.remove();
      layersRef.current = layersRef.current.filter((l) => l !== tempLine);

      if (!result) { setRouteError(true); return; }

      const glow = L.polyline(result.geometry, { color: "#FFD400", weight: 14, opacity: 0.08 }).addTo(map);
      const glow2 = L.polyline(result.geometry, { color: "#FFD400", weight: 5, opacity: 0.2 }).addTo(map);
      const solid = L.polyline(result.geometry, { color: "#FFD400", weight: 2.5, opacity: 0.7 }).addTo(map);
      const anim = L.polyline(result.geometry, { color: "#fff", weight: 2, opacity: 0.85, dashArray: "10,18", className: "dodisa-route-anim" } as any).addTo(map);
      layersRef.current.push(glow, glow2, solid, anim);

      map.fitBounds(L.latLngBounds(result.geometry), { padding: [60, 60], maxZoom: 10 });
      setRouteInfo(result);
    });
  }, [customDestination, baseLocation, clearLayers]);

  // ── MODE B: Predefined showcase routes ────────────────────────────────────
  useEffect(() => {
    if (customDestination || !mapRef.current) return;
    const map = mapRef.current;
    clearLayers();
    setRouteInfo(null);
    setRouteError(false);

    const coords = ROUTE_COORDS[selectedRouteId];
    if (!coords) return;

    const glow  = L.polyline(coords, { color: "#FFD400", weight: 16, opacity: 0.07, smoothFactor: 2, lineCap: "round" }).addTo(map);
    const glow2 = L.polyline(coords, { color: "#FFD400", weight: 6,  opacity: 0.18, smoothFactor: 2, lineCap: "round" }).addTo(map);
    const solid = L.polyline(coords, { color: "#FFD400", weight: 2,  opacity: 0.55, smoothFactor: 2, lineCap: "round" }).addTo(map);
    const anim  = L.polyline(coords, { color: "#fff",   weight: 2,  opacity: 0.9,  dashArray: "10,18", className: "dodisa-route-anim", lineCap: "round" } as any).addTo(map);
    layersRef.current.push(glow, glow2, solid, anim);

    coords.forEach((latlng, i) => {
      const isOrigin = i === 0;
      const isEnd = i === coords.length - 1;
      if (isOrigin) {
        const m = L.marker(latlng, { icon: makeHubIcon(), zIndexOffset: 1000 }).addTo(map);
        m.bindTooltip('<span class="dodisa-tip-hub">⬟ Hub Dodisa — Santa Rosa</span>', { permanent: true, direction: "right", className: "dodisa-tooltip dodisa-tooltip-hub" });
        layersRef.current.push(m);
      } else {
        const cityName = Object.entries(CITY_COORDS).find(([, c]) => Math.abs(c[0] - latlng[0]) < 0.01 && Math.abs(c[1] - latlng[1]) < 0.01)?.[0];
        const icon = L.divIcon({ className: "", html: `<div class="${isEnd ? "dodisa-city-dest" : "dodisa-city-dot"}"></div>`, iconSize: isEnd ? [14,14] : [10,10], iconAnchor: isEnd ? [7,7] : [5,5] });
        const m = L.marker(latlng, { icon }).addTo(map);
        if (cityName) {
          m.bindTooltip(`<span class="dodisa-tip-city">${cityName}</span>`, { permanent: isEnd, direction: "top", className: `dodisa-tooltip${isEnd ? " dodisa-tooltip-dest" : ""}` });
          const routeId = ROUTE_CITY_MAP[cityName];
          if (routeId && onCityClick) m.on("click", () => onCityClick(routeId));
        }
        layersRef.current.push(m);
      }
    });

    const base: [number, number] = safeBaseCoords(baseLocation);
    const bounds = L.latLngBounds([base, ...coords]);
    if (isFirstRender.current) { map.fitBounds(bounds, { padding: [52,52], maxZoom: 7 }); isFirstRender.current = false; }
    else map.flyToBounds(bounds, { padding: [52,52], maxZoom: 7, duration: 1.2 });
  }, [selectedRouteId, customDestination, baseLocation, clearLayers, onCityClick]);

  return (
    <>
      <style>{`
        .leaflet-container { background: #07090D !important; }
        /* Standard OSM tiles are light by default — invert then hue-rotate
           back to restore natural-looking colors at inverted (dark)
           lightness, giving a free dark map without a paid tile provider. */
        .leaflet-tile-pane { filter: invert(1) hue-rotate(180deg) brightness(0.92) contrast(0.88) saturate(0.7); }
        .dodisa-route-anim { animation: dodisaDash 1.8s linear infinite; }
        @keyframes dodisaDash { from { stroke-dashoffset: 28; } to { stroke-dashoffset: 0; } }

        .dodisa-hub-wrapper { position:relative; width:28px; height:28px; }
        .dodisa-hub-dot { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); width:12px; height:12px; border-radius:50%; background:#FFD400; border:2px solid #111827; z-index:3; box-shadow:0 0 8px #FFD400aa; }
        .dodisa-hub-pulse { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); width:28px; height:28px; border-radius:50%; border:2px solid #FFD400; animation:hubPulse 2s ease-out infinite; opacity:0; }
        .dodisa-hub-pulse-2 { animation-delay:1s; }
        @keyframes hubPulse { 0%{transform:translate(-50%,-50%) scale(.4);opacity:.8} 100%{transform:translate(-50%,-50%) scale(1.6);opacity:0} }

        .dodisa-city-dot { width:10px;height:10px;border-radius:50%;background:#fff;border:1.5px solid #FFD400;box-shadow:0 0 5px #FFD40066; }
        .dodisa-city-dest { width:14px;height:14px;border-radius:50%;background:#FFD400;border:2px solid #111827;box-shadow:0 0 10px #FFD400aa; }

        .dodisa-dest-icon { position:relative; }
        .dodisa-dest-pin { width:14px;height:14px;border-radius:50%;background:#FF4444;border:2px solid #fff;box-shadow:0 0 10px #FF444488; }
        .dodisa-dest-label { position:absolute; top:-28px; left:18px; background:rgba(7,9,13,.93); border:1px solid rgba(255,68,68,.35); color:#fff; font-size:11px; font-family:monospace; padding:3px 9px; border-radius:6px; white-space:nowrap; }

        .dodisa-tooltip { background:rgba(7,9,13,.92)!important; border:1px solid rgba(255,212,0,.2)!important; border-radius:6px!important; padding:3px 9px!important; box-shadow:0 4px 24px rgba(0,0,0,.6)!important; color:#d4d4d8!important; font-family:monospace; font-size:11px; white-space:nowrap; }
        .dodisa-tooltip::before,.dodisa-tooltip::after { display:none!important; }
        .dodisa-tooltip-hub { border-color:rgba(255,212,0,.45)!important; }
        .dodisa-tooltip-dest { border-color:rgba(255,212,0,.35)!important; }
        .dodisa-tip-hub { color:#FFD400; font-weight:bold; font-size:11px; }
        .dodisa-tip-city { color:#e5e7eb; font-size:11px; }

        .leaflet-control-zoom a { background:rgba(17,24,39,.95)!important; color:#FFD400!important; border-color:rgba(255,255,255,.08)!important; }
        .leaflet-control-zoom a:hover { background:#1f2937!important; color:#fff!important; }
        .leaflet-control-zoom { border:1px solid rgba(255,255,255,.06)!important; border-radius:8px!important; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,.4)!important; }
        .leaflet-control-attribution { background:transparent!important; }
      `}</style>

      <div ref={containerRef} className="w-full h-full" style={{ minHeight: "340px" }} />

      {/* Route info overlay */}
      {routeInfo && (
        <div className="absolute bottom-14 right-3 z-[1000] bg-black/90 backdrop-blur-md border border-[#FFD400]/25 rounded-xl px-4 py-3 text-xs font-mono space-y-1 pointer-events-none">
          <p className="text-[#FFD400] font-bold uppercase tracking-wider text-[9px]">Rota calculada</p>
          <p className="text-white font-bold">{routeInfo.distanceKm} km</p>
          <p className="text-stone-400">{routeInfo.durationMin >= 60 ? `~${Math.round(routeInfo.durationMin / 60)}h ${routeInfo.durationMin % 60}min` : `~${routeInfo.durationMin} min`} de viagem</p>
        </div>
      )}

      {routeError && (
        <div className="absolute bottom-14 right-3 z-[1000] bg-black/90 backdrop-blur-md border border-red-500/25 rounded-xl px-4 py-3 text-xs font-mono pointer-events-none">
          <p className="text-red-400">Não foi possível calcular a rota.</p>
          <p className="text-stone-500">Verifique o endereço e tente novamente.</p>
        </div>
      )}
    </>
  );
}
