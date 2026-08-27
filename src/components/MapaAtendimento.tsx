import React, { useState, useEffect, lazy, Suspense } from "react";
const LeafletMap = lazy(() => import("./LeafletMap"));
import { geocodeAddress } from "./LeafletMap";
import { motion, AnimatePresence } from "motion/react";
import { 
  MapPin, 
  Navigation, 
  ShieldCheck, 
  Check, 
  Sparkles, 
  Building, 
  PhoneCall, 
  ArrowRight, 
  Loader2, 
  Layers, 
  RefreshCw,
  Clock,
  Compass,
  AlertCircle,
  Truck,
  Map,
  Info,
  ExternalLink,
  Milestone,
  Settings,
  Sliders,
  Maximize2,
  Box,
  TrendingUp,
  Activity,
  Package
} from "lucide-react";
import { useAppContext } from "../context/AppContext";

// Define strict typing for our Brazilian logistics routes
interface LogisticsRoute {
  id: string;
  name: string;
  origin: string;
  destination: string;
  distance: string;
  time: string;
  type: "Expresso" | "Integrado" | "Rodo-Fluvial" | "Especial";
  status: "Saídas Diárias" | "Operando" | "Alta Demanda" | "Sob Consulta";
  description: string;
  pathPoints: { x: number; y: number }[];
  citiesCovered: string[];
  vibe: string;
  highway: string;
}

// Coordinate system mapped onto high-fidelity custom Brazil SVG container (vbox 0 0 500 500)
// Central Hub of Dodisa: Santa Rosa, RS (x: 180, y: 430)
const ROUTE_DATA: LogisticsRoute[] = [
  {
    id: "sul-fronteira",
    name: "Rota Sul-Fronteira (RS)",
    origin: "Santa Rosa (Base Dodisa)",
    destination: "Porto Alegre & Litoral RS",
    distance: "490 km",
    time: "24h a 48h",
    type: "Expresso",
    status: "Saídas Diárias",
    highway: "BR-386 / BR-116",
    vibe: "Eixo troncal de alta velocidade pelo Rio Grande do Sul",
    description: "Conexão direta unindo nossa fábrica aos polos metropolitanos e litorâneos gaúchos. Logística operada 100% por frotas da Dodisa com caminhões Munck e pranchas rebaixadas prontas para entrega técnica.",
    pathPoints: [
      { x: 180, y: 430 }, // Santa Rosa
      { x: 195, y: 445 }, // Passo Fundo/Ijuí
      { x: 210, y: 455 }  // Porto Alegre
    ],
    citiesCovered: ["Santa Rosa", "Ijuí", "Passo Fundo", "Porto Alegre", "Caxias do Sul", "Erechim", "Uruguaiana", "Pelotas", "Rio Grande"]
  },
  {
    id: "sc-corredor",
    name: "Corredor Catarinense (SC)",
    origin: "Santa Rosa (Base Dodisa)",
    destination: "Chapecó, Joinville & Florianópolis",
    distance: "680 km",
    time: "48h a 72h",
    type: "Expresso",
    status: "Saídas Diárias",
    highway: "BR-282 / BR-101",
    vibe: "Eixo logístico integrando o grande polo industrial de SC",
    description: "Atendimento ágil pelo oeste e litoral de Santa Catarina. Despacho frequente para construtoras, indústrias alimentícias e projetos comerciais de alto padrão em containers higienizados.",
    pathPoints: [
      { x: 180, y: 430 }, // Santa Rosa
      { x: 195, y: 405 }, // Chapecó
      { x: 235, y: 410 }  // Florianópolis
    ],
    citiesCovered: ["Chapecó", "Lages", "Florianópolis", "Joinville", "Blumenau", "Criciúma", "Itajaí", "Balneário Camboriú", "Tubarão"]
  },
  {
    id: "pr-eixo",
    name: "Eixo Metropolitano Paraná (PR)",
    origin: "Santa Rosa (Base Dodisa)",
    destination: "Curitiba, Maringá & Londrina",
    distance: "790 km",
    time: "2 a 3 dias",
    type: "Integrado",
    status: "Operando",
    highway: "BR-153 / BR-376",
    vibe: "Conexão interestadual com isenção simplificada de ICMS",
    description: "Linha de suprimento ligada às grandes distribuidoras e canteiros do Paraná. Despacho sob demanda com faturamento direto e agenciamento simplificado de seguros de carga.",
    pathPoints: [
      { x: 180, y: 430 }, // Santa Rosa
      { x: 195, y: 405 }, // Chapecó
      { x: 245, y: 375 }  // Curitiba
    ],
    citiesCovered: ["Curitiba", "Ponta Grossa", "Londrina", "Maringá", "Cascavel", "Foz do Iguaçu", "Pato Branco", "Guarapuava"]
  },
  {
    id: "sudeste-sp",
    name: "Corredor Industrial (SP)",
    origin: "Santa Rosa (Base Dodisa)",
    destination: "São Paulo Capital & Campinas",
    distance: "1.220 km",
    time: "3 a 4 dias",
    type: "Integrado",
    status: "Alta Demanda",
    highway: "BR-116 / Régis Bittencourt",
    vibe: "Maior rota mercante com escolta ativa e faturamento facilitado",
    description: "Transporte contínuo para o estado paulista. Ideal para fornecimento em escala de módulos habitacionais, almoxarifados blindados e containers Dry adaptados de 20 e 40 pés.",
    pathPoints: [
      { x: 180, y: 430 }, // Santa Rosa
      { x: 245, y: 375 }, // Curitiba
      { x: 285, y: 350 }  // São Paulo
    ],
    citiesCovered: ["São Paulo", "Campinas", "Santos", "Guarulhos", "São José dos Campos", "Sorocaba", "Ribeirão Preto", "Piracicaba"]
  },
  {
    id: "sudeste-rio",
    name: "Conexão Fluminense (RJ)",
    origin: "Santa Rosa (Base Dodisa)",
    destination: "Rio de Janeiro & Macaé (Portos)",
    distance: "1.650 km",
    time: "4 a 5 dias",
    type: "Integrado",
    status: "Operando",
    highway: "BR-116 / Rod. Pres. Dutra",
    vibe: "Logística especializada direcionada a projetos de óleo e gás",
    description: "Eixo focado em demandas industriais severas, projetos marítimos e armazenamentos temporários de alta resistência. Custo otimizado via fretes de retorno estratégicos.",
    pathPoints: [
      { x: 180, y: 430 }, // Santa Rosa
      { x: 285, y: 350 }, // São Paulo
      { x: 325, y: 340 }  // Rio de Janeiro
    ],
    citiesCovered: ["Rio de Janeiro", "Niterói", "Duque de Caxias", "Macaé", "Campos dos Goytacazes", "Volta Redonda", "Angra dos Reis"]
  },
  {
    id: "sudeste-mg",
    name: "Eixo Central de Minas (MG)",
    origin: "Santa Rosa (Base Dodisa)",
    destination: "Belo Horizonte & Triângulo Mineiro",
    distance: "1.810 km",
    time: "4 a 6 dias",
    type: "Especial",
    status: "Sob Consulta",
    highway: "BR-381 / Rod. Fernão Dias",
    vibe: "Linha customizada para mineradoras, fazendas e indústrias",
    description: "Envio sob encomenda para polos industriais e propriedades rurais mineiras. Fornecimento de depósitos, sanitários ecológicos e escritórios estruturados prontos para uso.",
    pathPoints: [
      { x: 180, y: 430 }, // Santa Rosa
      { x: 285, y: 350 }, // São Paulo
      { x: 310, y: 300 }  // Belo Horizonte
    ],
    citiesCovered: ["Belo Horizonte", "Uberlândia", "Contagem", "Juiz de Fora", "Betim", "Ipatinga", "Uberaba", "Montes Claros"]
  },
  {
    id: "centro-oeste",
    name: "Rota do Agronegócio (Centro-Oeste)",
    origin: "Santa Rosa (Base Dodisa)",
    destination: "Brasília, Goiânia & Campo Grande",
    distance: "2.150 km",
    time: "5 a 7 dias",
    type: "Especial",
    status: "Sob Consulta",
    highway: "BR-163 / BR-060",
    vibe: "Suporte logístico para o cinturão produtivo nacional",
    description: "Soluções modulares para sedes de fazendas, alojamentos de safristas e guaritas de segurança. Logística planejada para trafegar em rodovias rurais e áreas de difícil acesso.",
    pathPoints: [
      { x: 180, y: 430 }, // Santa Rosa
      { x: 205, y: 310 }, // Campo Grande
      { x: 250, y: 260 }, // Goiânia
      { x: 270, y: 250 }  // Brasília
    ],
    citiesCovered: ["Brasília", "Goiânia", "Campo Grande", "Cuiabá", "Rondonópolis", "Anápolis", "Dourados", "Três Lagoas"]
  }
];

interface BrazilNode {
  name: string;
  acronym: string;
  x: number;
  y: number;
  isHub: boolean;
  region: "Sul" | "Sudeste" | "Centro-Oeste" | "Nordeste" | "Norte";
}

const BRAZIL_NODES: BrazilNode[] = [
  { name: "Santa Rosa (Central)", acronym: "RS", x: 180, y: 430, isHub: true, region: "Sul" },
  { name: "Porto Alegre", acronym: "RS", x: 210, y: 455, isHub: false, region: "Sul" },
  { name: "Chapecó", acronym: "SC", x: 195, y: 405, isHub: false, region: "Sul" },
  { name: "Florianópolis", acronym: "SC", x: 235, y: 410, isHub: false, region: "Sul" },
  { name: "Curitiba", acronym: "PR", x: 245, y: 375, isHub: false, region: "Sul" },
  { name: "São Paulo", acronym: "SP", x: 285, y: 350, isHub: true, region: "Sudeste" },
  { name: "Rio de Janeiro", acronym: "RJ", x: 325, y: 340, isHub: false, region: "Sudeste" },
  { name: "Belo Horizonte", acronym: "MG", x: 310, y: 300, isHub: false, region: "Sudeste" },
  { name: "Campo Grande", acronym: "MS", x: 205, y: 310, isHub: false, region: "Centro-Oeste" },
  { name: "Goiânia", acronym: "GO", x: 250, y: 260, isHub: false, region: "Centro-Oeste" },
  { name: "Brasília", acronym: "DF", x: 270, y: 250, isHub: false, region: "Centro-Oeste" },
  { name: "Cuiabá", acronym: "MT", x: 160, y: 240, isHub: false, region: "Centro-Oeste" },
  { name: "Salvador", acronym: "BA", x: 390, y: 200, isHub: false, region: "Nordeste" },
  { name: "Recife", acronym: "PE", x: 435, y: 150, isHub: false, region: "Nordeste" },
  { name: "Fortaleza", acronym: "CE", x: 405, y: 100, isHub: false, region: "Nordeste" }
];

// High fidelity state paths approximating a beautifully detailed modern Brazil vector graphic map
interface StateBoundary {
  id: string;
  name: string;
  path: string;
}

const STATE_BOUNDARIES: StateBoundary[] = [
  {
    id: "RS",
    name: "Rio Grande do Sul",
    path: "M 150,420 C 160,400 170,400 180,410 C 190,410 195,415 210,425 C 220,430 225,435 230,440 C 235,445 230,460 215,475 C 200,485 180,480 170,485 C 160,490 155,475 150,460 Z"
  },
  {
    id: "SC",
    name: "Santa Catarina",
    path: "M 180,410 C 190,400 210,400 220,405 C 230,405 240,410 245,415 C 240,425 230,435 220,430 C 210,425 195,415 180,410 Z"
  },
  {
    id: "PR",
    name: "Paraná",
    path: "M 195,380 C 215,360 230,365 245,360 C 255,365 260,375 255,395 C 245,405 220,405 210,400 C 195,380 195,380 195,380 Z"
  },
  {
    id: "SP",
    name: "São Paulo",
    path: "M 240,345 C 255,335 270,335 285,330 C 295,335 300,345 295,360 C 285,365 270,370 260,365 C 245,360 240,345 240,345 Z"
  },
  {
    id: "RJ",
    name: "Rio de Janeiro",
    path: "M 295,340 C 305,335 315,335 325,338 C 330,342 325,348 315,350 C 305,350 295,345 295,340 Z"
  },
  {
    id: "MG",
    name: "Minas Gerais",
    path: "M 255,310 C 275,290 290,290 315,280 C 335,295 330,315 325,330 C 300,335 285,330 255,310 Z"
  },
  {
    id: "ES",
    name: "Espírito Santo",
    path: "M 325,315 C 330,310 335,315 338,325 C 335,332 330,330 325,315 Z"
  },
  {
    id: "MS",
    name: "Mato Grosso do Sul",
    path: "M 175,325 C 195,315 215,315 235,320 C 240,335 235,350 220,360 C 205,355 185,345 175,325 Z"
  },
  {
    id: "GO",
    name: "Goiás & DF",
    path: "M 225,260 C 245,240 265,245 280,250 C 285,270 275,290 255,290 C 235,280 225,260 225,260 Z"
  },
  {
    id: "MT",
    name: "Mato Grosso",
    path: "M 120,240 C 150,220 180,230 195,250 C 185,280 175,300 155,290 C 130,270 120,240 120,240 Z"
  }
];

export default function MapaAtendimento() {
  const { regions, whatsapp: systemWhatsapp, baseLocation } = useAppContext();
  
  // Navigation & Interactive states
  const [selectedRouteId, setSelectedRouteId] = useState<string>("sul-fronteira");
  const [city, setCity] = useState("Porto Alegre");
  const [state, setState] = useState("RS");
  const [inCoverage, setInCoverage] = useState(true);
  const [regionStatus, setRegionStatus] = useState<"idle" | "loading" | "detected" | "error" | "manual">("idle");

  const SERVICED_STATES = ["RS", "SC", "PR", "SP", "RJ", "MG", "MS", "GO", "DF", "BA", "PE"];
  const [manualInput, setManualInput] = useState("");
  
  // Custom route mode
  const [addressInput, setAddressInput] = useState("");
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodeError, setGeocodeError] = useState("");
  const [customDestination, setCustomDestination] = useState<{ lat: number; lng: number; label: string } | null>(null);

  const handleAddressSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressInput.trim()) return;
    setIsGeocoding(true);
    setGeocodeError("");
    setCustomDestination(null);
    const result = await geocodeAddress(addressInput.trim());
    setIsGeocoding(false);
    if (!result) {
      setGeocodeError("Endereço não encontrado. Tente ser mais específico.");
      return;
    }
    const label = result.display.split(",").slice(0, 2).join(",").trim();
    setCustomDestination({ lat: result.lat, lng: result.lng, label });
  };

  const handleClearRoute = () => {
    setCustomDestination(null);
    setAddressInput("");
    setGeocodeError("");
  };

  // High-fidelity View tabs
  const [activeTab, setActiveTab] = useState<"mapa" | "frota" | "simulador">("mapa");

  // Simulator State
  const [simContainerType, setSimContainerType] = useState<"20_dry" | "40_dry" | "20_reefer" | "40_hc_office">("20_dry");
  const [simDistance, setSimDistance] = useState<number>(350);
  const [showSimResult, setShowSimResult] = useState<boolean>(true);
  const [simLocalSantaRosa, setSimLocalSantaRosa] = useState<boolean>(false);

  // Fetch contextual values from local AppContext (fully customizable by administrators)
  const contextStates = regions?.states || ["Rio Grande do Sul", "Santa Catarina", "Paraná", "São Paulo", "Minas Gerais"];
  const contextRegions = regions?.regions || ["Noroeste Gaúcho", "Serra Gaúcha", "Litoral Catarinense", "Grande Curitiba", "Região Metropolitana de SP", "Triângulo Mineiro"];

  // Run initial reverse IP check to automatically welcome users
  const handleRequestGeolocation = () => {
    setRegionStatus("loading");
    
    if (!navigator.geolocation) {
      setTimeout(() => fetchIpFallback(), 1500);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=pt`);
          if (res.ok) {
            const data = await res.json();
            const detectedCity = data.city || data.locality || "Sua Cidade";
            const detectedState = data.principalSubdivisionCode
              ? data.principalSubdivisionCode.replace("BR-", "")
              : "";
            const covered = SERVICED_STATES.includes(detectedState);

            setCity(detectedCity);
            setState(detectedState);
            setInCoverage(covered);
            setRegionStatus("detected");
            dispatchLocationToSimulator(detectedCity, detectedState);
            autoSelectRouteForState(detectedState);
          } else {
            fetchIpFallback();
          }
        } catch {
          fetchIpFallback();
        }
      },
      () => {
        fetchIpFallback();
      },
      { timeout: 8000 }
    );
  };

  const fetchIpFallback = async () => {
    try {
      const res = await fetch("https://ipapi.co/json/");
      if (res.ok) {
        const data = await res.json();
        const detectedCity = data.city || "—";
        const detectedState = data.region_code || "";
        const covered = SERVICED_STATES.includes(detectedState);

        setCity(detectedCity);
        setState(detectedState);
        setInCoverage(covered);
        setRegionStatus("detected");
        dispatchLocationToSimulator(detectedCity, detectedState);
        autoSelectRouteForState(detectedState);
      } else {
        setRegionStatus("manual");
      }
    } catch {
      setRegionStatus("manual");
    }
  };

  const autoSelectRouteForState = (stateCode: string) => {
    if (stateCode === "RS") setSelectedRouteId("sul-fronteira");
    else if (stateCode === "SC") setSelectedRouteId("sc-corredor");
    else if (stateCode === "PR") setSelectedRouteId("pr-eixo");
    else if (stateCode === "SP") setSelectedRouteId("sudeste-sp");
    else if (stateCode === "RJ") setSelectedRouteId("sudeste-rio");
    else if (stateCode === "MG") setSelectedRouteId("sudeste-mg");
    else if (["MS", "GO", "DF"].includes(stateCode)) setSelectedRouteId("centro-oeste");
  };

  const dispatchLocationToSimulator = (detectedCity: string, detectedState: string) => {
    const event = new CustomEvent("location-detected", {
      detail: { city: detectedCity, state: detectedState }
    });
    window.dispatchEvent(event);
  };

  useEffect(() => {
    handleRequestGeolocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput) return;
    
    const parts = manualInput.split("-");
    const manualCity = parts[0]?.trim() || manualInput;
    let manualState = parts[1]?.trim().toUpperCase() || "RS";
    
    setCity(manualCity);
    setState(manualState);
    setRegionStatus("detected");
    dispatchLocationToSimulator(manualCity, manualState);
    autoSelectRouteForState(manualState);
    setManualInput("");
  };

  const handleWhatsAppConsult = (customRoute?: LogisticsRoute) => {
    const routeObj = customRoute || activeRoute;
    const locationStr = city ? `${city} - ${state}` : routeObj.destination;
    const message = `Olá, verifiquei a rota logística detalhada do pátio no mapa da Dodisa (${routeObj.name}). Gostaria de obter uma cotação de frete e prazos específicos para container em minha localidade (${locationStr}).`;
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${systemWhatsapp.number}?text=${encoded}`, "_blank");
  };

  const handleWhatsAppSimulate = () => {
    const cType = simContainerType === "20_dry" ? "Container 20 Pés Dry" :
                  simContainerType === "40_dry" ? "Container 40 Pés Dry" :
                  simContainerType === "20_reefer" ? "Container 20 Pés Reefer" : "Módulo Escritório 40 Pés HC";
    
    const locationStr = simLocalSantaRosa ? "dentro de Santa Rosa (RS)" : `a uma distância aproximada de [${simDistance} km] a partir de Santa Rosa (RS)`;
    const message = `Olá, usei o Simulador Logístico Dodisa para projetar frete. Pretendo carregar um [${cType}] ${locationStr}. Poderiam formalizar esta cotação para minha região?`;
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${systemWhatsapp.number}?text=${encoded}`, "_blank");
  };

  // Find active selected route or fallback to Sul
  const activeRoute = ROUTE_DATA.find(r => r.id === selectedRouteId) || ROUTE_DATA[0];

  // Convert route points to smooth bezier curves for perfect UI detailing
  const makePathString = (points: { x: number; y: number }[]) => {
    if (points.length === 0) return "";
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const midX = (prev.x + curr.x) / 2;
      const midY = (prev.y + curr.y) / 2;
      const cp1x = midX;
      const cp1y = prev.y;
      const cp2x = midX;
      const cp2y = curr.y;
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
    }
    return d;
  };

  // Compute live simulated pricing based on simple logistics rules
  const getSimulatedPricing = () => {
    const requiredTruck = simContainerType.includes("40") ? "Carreta Prancha de 12 metros rebaixada" : "Caminhão Truck equipado com Guincho Munck Hidráulico";

    // Fixed local rates: Santa Rosa/RS (sede) e regiao proxima (ate 80km) tem preco
    // fechado, independente do tipo de container -- fora dessa faixa, mantem o
    // calculo por km + taxa de mobilizacao que ja existia.
    if (simLocalSantaRosa) {
      return {
        cost: 1500,
        time: "Mesmo dia útil",
        insuranceCovered: Math.round(1500 * 150),
        requiredTruck
      };
    }
    if (simDistance <= 80) {
      return {
        cost: 3000,
        time: "1 dia útil",
        insuranceCovered: Math.round(3000 * 150),
        requiredTruck
      };
    }

    const baseFreightRate = simContainerType.includes("40") ? 6.5 : 4.8; // Per km
    const mobilizationFee = simContainerType.includes("reefer") ? 750 : 350; // Special mobilization fee
    const estimatedCost = Math.round(simDistance * baseFreightRate + mobilizationFee);
    const minDays = Math.max(1, Math.ceil(simDistance / 400));
    const maxDays = minDays + 1;

    return {
      cost: estimatedCost,
      time: `${minDays} a ${maxDays} dias úteis`,
      insuranceCovered: Math.round(estimatedCost * 150),
      requiredTruck
    };
  };

  const simResult = getSimulatedPricing();

  return (
    <section id="mapa-atendimento" className="relative bg-[#07090D] py-24 border-b border-white/5 scroll-mt-20 overflow-hidden">
      
      {/* Visual background atmospheric elements */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#FFD400]/2 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] bg-[#FFD400]/3 rounded-full blur-[120px] pointer-events-none" />
      
      {/* High-fidelity architectural dot background */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] bg-[size:24px_24px] opacity-80" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        
        {/* Section Header */}
        <div className="text-left md:text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFD400]/10 border border-[#FFD400]/20 text-[10px] font-mono font-bold text-[#FFD400] uppercase tracking-widest mb-4">
            ● Logística Rodoviária Avançada
          </div>
          <h2 className="text-3xl sm:text-4xl font-black font-display uppercase tracking-tight text-white leading-none">
            RASTREAMENTO & REDE DE <span className="text-[#FFD400]">COBERTURA</span>
          </h2>
          <p className="mt-4 text-stone-400 font-sans text-xs sm:text-sm leading-relaxed">
            Consulte nossas principais rotas comerciais terrestres integradas diretamente ao pátio Dodisa em Santa Rosa (RS). Despachamos containers de alta performance e projetos modulares personalizados para todo o território nacional através de frotas credenciadas e monitoramento satelital ininterrupto.
          </p>
        </div>

        {/* Dynamic Navigation Tabs inside section to organize information cleanly */}
        <div className="flex justify-center mb-10 px-4">
          <div className="bg-[#111827]/60 p-1.5 rounded-2xl border border-white/5 flex gap-1 w-full sm:w-auto sm:inline-flex sm:gap-1.5">
            <button
              onClick={() => setActiveTab("mapa")}
              className={`flex-1 sm:flex-none px-3 sm:px-5 py-2.5 rounded-xl text-[10px] sm:text-xs uppercase font-black tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 ${
                activeTab === "mapa"
                  ? "bg-[#FFD400] text-[#07090D] shadow-lg shadow-[#FFD400]/10"
                  : "text-stone-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Map className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Mapa Interativo de Rotas</span>
              <span className="sm:hidden">Mapa</span>
            </button>
            <button
              onClick={() => setActiveTab("frota")}
              className={`flex-1 sm:flex-none px-3 sm:px-5 py-2.5 rounded-xl text-[10px] sm:text-xs uppercase font-black tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 ${
                activeTab === "frota"
                  ? "bg-[#FFD400] text-[#07090D] shadow-lg shadow-[#FFD400]/10"
                  : "text-stone-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Truck className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Frotas & Equipamentos</span>
              <span className="sm:hidden">Frotas</span>
            </button>
            <button
              onClick={() => setActiveTab("simulador")}
              className={`flex-1 sm:flex-none px-3 sm:px-5 py-2.5 rounded-xl text-[10px] sm:text-xs uppercase font-black tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 ${
                activeTab === "simulador"
                  ? "bg-[#FFD400] text-[#07090D] shadow-lg shadow-[#FFD400]/10"
                  : "text-stone-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Sliders className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Simulador de Carga</span>
              <span className="sm:hidden">Simulador</span>
            </button>
          </div>
        </div>

        {/* View render switcher */}
        <AnimatePresence mode="wait">
          
          {/* TAB 1: HIGH FIDELITY GEOGRAPHICAL MAP */}
          {activeTab === "mapa" && (
            <motion.div
              key="tab-mapa"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch max-w-6xl mx-auto"
            >
              
              {/* Left Column: Locator & Route Index */}
              <div className="lg:col-span-5 flex flex-col gap-6 justify-between">
                
                {/* Geolocation Detector Module */}
                <div className="bg-[#111827]/40 border border-white/5 p-6 rounded-2xl backdrop-blur-md relative overflow-hidden shadow-xl">
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#FFD400]" />
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-[#FFD400] animate-spin" style={{ animationDuration: "8s" }} />
                      Rastreamento por IP / Geodetecção
                    </span>
                    <span className="text-[9px] font-mono font-bold bg-green-500/10 text-green-400 border border-green-500/25 px-2 py-0.5 rounded-full uppercase">
                      Sistema Online
                    </span>
                  </div>

                  <AnimatePresence mode="wait">
                    {regionStatus === "loading" && (
                      <motion.div
                        key="loading-geo"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="py-6 text-center space-y-3"
                      >
                        <Loader2 className="w-7 h-7 text-[#FFD400] animate-spin mx-auto" />
                        <p className="text-xs text-stone-400 font-mono">
                          Mapeando pontos de apoio de logística próximos...
                        </p>
                      </motion.div>
                    )}

                    {(regionStatus === "detected" || regionStatus === "manual") && (
                      <motion.div
                        key="resolved-geo"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                      >
                        <div className="flex items-center gap-3 bg-black/40 p-4 rounded-xl border border-white/5">
                          <div className="w-10 h-10 rounded-lg bg-[#FFD400]/10 border border-[#FFD400]/20 flex items-center justify-center text-[#FFD400]">
                            <MapPin className="w-5 h-5 text-[#FFD400]" />
                          </div>
                          <div>
                            <p className="text-[9px] font-mono text-stone-500 uppercase tracking-widest leading-none">SUA LOCALIDADE IDENTIFICADA</p>
                            <p className="text-white text-base font-extrabold font-display uppercase tracking-tight mt-1.5">
                              {city}{state && inCoverage ? ` (${state})` : state ? ` — ${state}` : ""}
                            </p>
                          </div>
                        </div>

                        {inCoverage ? (
                          <div className="p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/10 text-xs text-stone-300 leading-relaxed flex gap-2.5 items-start">
                            <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-white font-bold mb-1">Rota Comercial Homologada</p>
                              <p className="text-stone-400">Atendimento ativo com frete assegurado e frota com rastreamento via satélite disponível para sua região.</p>
                            </div>
                          </div>
                        ) : (
                          <div className="p-4 bg-amber-500/5 rounded-xl border border-amber-500/15 text-xs text-stone-300 leading-relaxed flex gap-2.5 items-start">
                            <span className="text-amber-400 shrink-0 mt-0.5 text-sm leading-none">⚠</span>
                            <div>
                              <p className="text-white font-bold mb-1">Fora da área de cobertura padrão</p>
                              <p className="text-stone-400">Sua região não está em nossa rota regular, mas atendemos sob consulta. Entre em contato para verificarmos viabilidade logística.</p>
                            </div>
                          </div>
                        )}

                        <div className="pt-1 flex gap-2">
                          <button
                            onClick={() => handleWhatsAppConsult()}
                            className="flex-grow py-3 px-4 bg-[#FFD400] hover:bg-[#FFD400]/90 text-[#0F1115] font-black text-xs uppercase tracking-wider rounded-xl transition-all font-display flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#FFD400]/5"
                          >
                            <PhoneCall className="w-4 h-4" />
                            Consultar Rota Direta
                          </button>
                          
                          <button
                            onClick={() => setRegionStatus("manual")}
                            className="py-3 px-3.5 bg-white/5 hover:bg-white/10 border border-white/5 text-stone-300 text-xs font-bold uppercase rounded-xl transition-all cursor-pointer"
                            title="Digitar outra cidade manualmente"
                          >
                            Alterar
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {regionStatus === "manual" && (
                    <form onSubmit={handleManualSubmit} className="mt-4 pt-4 border-t border-white/5 space-y-3">
                      <label className="block text-[9px] font-mono font-bold text-stone-500 uppercase tracking-wider">
                        Escreva sua cidade e estado (Ex: Joinville - SC):
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          required
                          className="flex-grow py-2.5 px-3.5 rounded-xl bg-[#0F1115] border border-white/10 text-white text-xs placeholder-stone-600 focus:outline-none focus:border-[#FFD400]/40 transition-colors"
                          placeholder="Ex: Joinville - SC"
                          value={manualInput}
                          onChange={(e) => setManualInput(e.target.value)}
                        />
                        <button
                          type="submit"
                          className="py-2.5 px-4 bg-[#FFD400] hover:bg-[#FFD400]/90 text-[#0F1115] font-bold text-xs uppercase rounded-xl transition-all cursor-pointer font-display"
                        >
                          Ok
                        </button>
                      </div>
                      <button
                        onClick={() => setRegionStatus("detected")}
                        type="button"
                        className="text-[9px] font-mono text-stone-500 hover:text-stone-300 transition-colors flex items-center gap-1.5 mt-2"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Usar geodetecção automática por IP
                      </button>
                    </form>
                  )}

                </div>

                {/* ── Ver minha rota até a Dodisa ── */}
                <div className="bg-[#111827]/40 border border-[#FFD400]/10 p-5 rounded-2xl backdrop-blur-md relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#FFD400] to-[#FF9A00]" />
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#FFD400] flex items-center gap-1.5 mb-3">
                    <Navigation className="w-3.5 h-3.5" /> Calcular Rota até Nós
                  </span>
                  <p className="text-[11px] text-stone-400 mb-3 leading-relaxed">
                    Digite seu endereço e veja no mapa a rota real de entrega do container até você.
                  </p>

                  <form onSubmit={handleAddressSearch} className="flex gap-2">
                    <input
                      type="text"
                      value={addressInput}
                      onChange={(e) => setAddressInput(e.target.value)}
                      placeholder="Ex: Av. Paulista 1000, São Paulo..."
                      className="flex-1 py-2.5 px-3 rounded-xl bg-[#0F1115] border border-white/10 text-white text-xs placeholder-stone-600 focus:outline-none focus:border-[#FFD400]/40 transition-colors"
                    />
                    <button
                      type="submit"
                      disabled={isGeocoding}
                      className="py-2.5 px-3.5 bg-[#FFD400] hover:bg-[#FFE14D] disabled:opacity-50 text-stone-950 font-black text-[10px] uppercase rounded-xl transition-all cursor-pointer shrink-0"
                    >
                      {isGeocoding ? "..." : "Ver"}
                    </button>
                  </form>

                  {geocodeError && (
                    <p className="text-red-400 text-[10px] font-mono mt-2">{geocodeError}</p>
                  )}

                  {customDestination && (
                    <div className="mt-3 p-3 bg-emerald-500/5 border border-emerald-500/15 rounded-xl flex items-start justify-between gap-2">
                      <div>
                        <p className="text-emerald-400 text-[9px] font-mono uppercase font-bold mb-0.5">Rota calculada</p>
                        <p className="text-white text-[11px] font-bold leading-tight">{customDestination.label}</p>
                      </div>
                      <button
                        onClick={handleClearRoute}
                        className="text-stone-500 hover:text-white text-[10px] font-mono mt-0.5 shrink-0 cursor-pointer"
                      >
                        ✕ Limpar
                      </button>
                    </div>
                  )}
                </div>

                {/* Interactive Route Selection List with Status Details */}
                <div className={`bg-[#111827]/30 border border-white/5 p-6 rounded-2xl backdrop-blur-md flex-1 flex flex-col justify-between ${customDestination ? "opacity-40 pointer-events-none" : ""}`}>
                  <div>
                    <span className="block text-[10px] font-mono font-bold uppercase text-stone-400 tracking-wider mb-3.5 flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-[#FFD400]" />
                      Escolha uma Rota Ativa no Território:
                    </span>

                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
                      {ROUTE_DATA.map((route) => {
                        const isSelected = selectedRouteId === route.id;
                        return (
                          <button
                            key={route.id}
                            onClick={() => setSelectedRouteId(route.id)}
                            className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer flex justify-between items-center ${
                              isSelected 
                                ? "bg-[#FFD400]/10 border-[#FFD400]/40 text-white shadow-sm" 
                                : "bg-black/20 border-white/[0.03] hover:border-white/10 text-stone-400 hover:text-stone-200"
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <Milestone className={`w-3.5 h-3.5 shrink-0 ${isSelected ? "text-[#FFD400]" : "text-stone-500"}`} />
                              <div>
                                <span className="text-xs font-bold uppercase block leading-tight">{route.name}</span>
                                <span className="text-[10px] text-stone-500 block font-mono mt-0.5">{route.distance} • {route.time}</span>
                              </div>
                            </div>
                            <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
                              route.status === "Alta Demanda" 
                                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" 
                                : route.status === "Saídas Diárias"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-stone-500/10 text-stone-400 border border-white/5"
                            }`}>
                              {route.status}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Context boundaries defined in admin builder */}
                  <div className="pt-4 border-t border-white/5 mt-4">
                    <span className="text-[9px] font-mono text-stone-500 block uppercase mb-2">Pátio e Limites de Fornecimento</span>
                    <div className="flex flex-wrap gap-1.5">
                      {contextStates.slice(0, 4).map((st, i) => (
                        <span key={i} className="text-[9px] font-bold text-stone-300 bg-white/[0.02] border border-white/5 py-0.5 px-2 rounded-md">
                          {st}
                        </span>
                      ))}
                      <span className="text-[9px] font-bold text-stone-500 bg-white/[0.02] border border-white/5 py-0.5 px-2 rounded-md">
                        + Outros estados sob consulta
                      </span>
                    </div>
                  </div>

                </div>

              </div>

              {/* Right Column: High Fidelity SVG Map with Border Lines and Custom Pins */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                
                {/* Real Leaflet Map Container */}
                <div className="bg-[#111827]/20 border border-white/5 rounded-2xl overflow-hidden shadow-xl relative" style={{ minHeight: "440px" }}>

                  {/* Status overlay */}
                  <div className="absolute top-3 left-3 z-[1000] text-[9px] font-mono text-stone-400 space-y-0.5 pointer-events-none">
                    <div className="flex items-center gap-1.5 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-lg border border-white/5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>MAPA INTERATIVO — BASE: SANTA ROSA (RS)</span>
                    </div>
                  </div>

                  {/* Legend overlay */}
                  <div className="absolute bottom-3 left-3 z-[1000] bg-black/80 backdrop-blur-md px-3 py-2 rounded-xl border border-white/5 text-[9px] font-mono text-stone-400 space-y-1 pointer-events-none">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#FFD400]" />
                      <span>Hub Central Dodisa</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-white border border-[#FFD400]/50" />
                      <span>Cidade da Rota</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-4 border-t border-dashed border-[#FFD400]/60 inline-block" />
                      <span>Eixo Logístico</span>
                    </div>
                  </div>

                  {/* Leaflet Map */}
                  <Suspense fallback={
                    <div className="w-full h-full flex items-center justify-center bg-[#07090D]" style={{ minHeight: "440px" }}>
                      <div className="text-[#FFD400] text-xs font-mono animate-pulse">Carregando mapa...</div>
                    </div>
                  }>
                    <div style={{ height: "440px" }}>
                      <LeafletMap
                        selectedRouteId={selectedRouteId}
                        onCityClick={(routeId) => { setSelectedRouteId(routeId); handleClearRoute(); }}
                        baseLocation={baseLocation}
                        customDestination={customDestination}
                      />
                    </div>
                  </Suspense>

                  {/* Insurance strip */}
                  <div className="absolute bottom-3 right-3 z-[1000]">
                    <div className="bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/5 flex items-center gap-2 text-[9px] text-stone-400 font-mono">
                      <ShieldCheck className="w-3 h-3 text-[#FFD400] shrink-0" />
                      <span>Cobertura contra sinistros 100%</span>
                    </div>
                  </div>

                </div>

                {/* Live Specifications Panel for Selected Roda */}
                <div className="bg-[#111827]/40 border border-white/5 p-6 rounded-2xl relative shadow-xl overflow-hidden">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-[#FFD400]/10 text-[#FFD400] rounded-xl border border-[#FFD400]/20">
                        <Building className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[9px] font-mono font-bold text-[#FFD400] uppercase tracking-wider block">
                          DIRETRIZ DA ROTA EXPEDIDA
                        </span>
                        <h3 className="text-white text-base font-black uppercase tracking-tight font-display mt-0.5">
                          {activeRoute.destination}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 bg-[#FFD400]/10 border border-[#FFD400]/20 text-[#FFD400] font-mono text-[10px] font-bold px-3 py-1 rounded-full uppercase shrink-0">
                      <Clock className="w-3.5 h-3.5" />
                      Prazo: {activeRoute.time}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs mb-4">
                    <div className="bg-black/30 p-3.5 rounded-xl border border-white/[0.03]">
                      <span className="text-[9px] font-mono text-stone-500 block uppercase mb-1">DISTÂNCIA TOTAL</span>
                      <p className="text-white font-extrabold text-sm">{activeRoute.distance}</p>
                    </div>

                    <div className="bg-black/30 p-3.5 rounded-xl border border-white/[0.03]">
                      <span className="text-[9px] font-mono text-stone-500 block uppercase mb-1">RODOVIA PRINCIPAL</span>
                      <p className="text-stone-300 font-medium">{activeRoute.highway}</p>
                    </div>

                    <div className="bg-black/30 p-3.5 rounded-xl border border-white/[0.03]">
                      <span className="text-[9px] font-mono text-stone-500 block uppercase mb-1">CLASSIFICAÇÃO</span>
                      <p className="text-[#FFD400] font-bold uppercase">{activeRoute.type}</p>
                    </div>
                  </div>

                  <div className="p-4 bg-black/40 rounded-xl border border-white/5 text-xs text-stone-300 leading-relaxed mb-4">
                    <span className="text-[9px] font-mono text-stone-500 uppercase font-black block mb-1">VISÃO GERAL DO TRAJETO</span>
                    <p className="text-stone-300 font-semibold mb-1 italic text-[11px] text-[#FFD400]/90">"{activeRoute.vibe}"</p>
                    <p className="text-stone-400 font-medium leading-relaxed">{activeRoute.description}</p>
                  </div>

                  <div className="p-4 bg-[#FFD400]/5 border border-[#FFD400]/10 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <span className="text-[9px] font-mono text-[#FFD400] font-black uppercase tracking-wider block mb-1">Cidades Homologadas no Trajeto:</span>
                      <p className="text-[11px] text-stone-300 leading-normal font-medium">
                        {activeRoute.citiesCovered.join(" • ")}
                      </p>
                    </div>
                    <button
                      onClick={() => handleWhatsAppConsult()}
                      className="w-full sm:w-auto shrink-0 py-2.5 px-4 bg-white/5 hover:bg-[#FFD400]/10 border border-white/10 hover:border-[#FFD400]/30 text-white hover:text-[#FFD400] rounded-xl text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <PhoneCall className="w-3.5 h-3.5" /> Cotar Frete
                    </button>
                  </div>

                </div>

              </div>

            </motion.div>
          )}

          {/* TAB 2: TRANSPORTATION VEHICLES AND LOGISTICS MACHINERY */}
          {activeTab === "frota" && (
            <motion.div
              key="tab-frota"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-4xl mx-auto space-y-6"
            >
              <div className="bg-[#111827]/40 border border-white/5 p-5 sm:p-8 rounded-3xl relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#FFD400]" />
                
                <h3 className="text-xl font-black font-display text-white uppercase tracking-tight mb-4 flex items-center gap-2.5">
                  <Truck className="text-[#FFD400] w-6 h-6" /> FROTA DE CARREGAMENTO & EQUIPAMENTOS TÉCNICOS
                </h3>
                
                <p className="text-stone-400 text-xs sm:text-sm leading-relaxed mb-6 font-sans">
                  A entrega de um contêiner exige frotas projetadas especificamente para vencer os limites de peso e manobras extremas. A Dodisa possui caminhões modernos e maquinário articulado, garantindo descarga precisa, rápida e segura em qualquer canteiro, terreno arenoso ou propriedade urbana.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Equipment card 1 */}
                  <div className="bg-black/30 border border-white/5 p-5 rounded-2xl relative">
                    <span className="absolute top-4 right-4 bg-emerald-500/10 text-emerald-400 text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase">Alta Disponibilidade</span>
                    <h4 className="text-white text-sm font-black uppercase mb-1">Caminhão Munck Articulado</h4>
                    <p className="text-stone-500 text-[10px] font-mono mb-3 uppercase">Capacidade de elevação: até 12 toneladas</p>
                    <p className="text-stone-400 text-xs leading-relaxed mb-4">
                      Equipamento indispensável para entrega de containers de 20 pés. Possibilita levantar, transpor muros e realizar o posicionamento preciso sobre sapatas de concreto no terreno sem necessidade de guindaste externo.
                    </p>
                    <div className="text-[10px] font-mono text-stone-500">Recomendado para: Módulos habitacionais individuais, Almoxarifados e Obras urbanas.</div>
                  </div>

                  {/* Equipment card 2 */}
                  <div className="bg-black/30 border border-white/5 p-5 rounded-2xl relative">
                    <span className="absolute top-4 right-4 bg-emerald-500/10 text-emerald-400 text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase">Alta Disponibilidade</span>
                    <h4 className="text-white text-sm font-black uppercase mb-1">Carretas Prancha Rebaixada</h4>
                    <p className="text-stone-500 text-[10px] font-mono mb-3 uppercase">Capacidade de tração: até 40 toneladas</p>
                    <p className="text-stone-400 text-xs leading-relaxed mb-4">
                      Utilizadas para o escoamento de containers de 40 pés ou múltiplos módulos acoplados. O chassi rebaixado assegura estabilidade total nas rodovias e facilidade no trânsito urbano dentro da lei de balança.
                    </p>
                    <div className="text-[10px] font-mono text-stone-500">Recomendado para: Projetos de containers de 40 pés Dry/HC e faturamentos industriais.</div>
                  </div>

                  {/* Equipment card 3 */}
                  <div className="bg-black/30 border border-white/5 p-5 rounded-2xl relative">
                    <span className="absolute top-4 right-4 bg-amber-500/10 text-amber-400 text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase">Agendamento prévio</span>
                    <h4 className="text-white text-sm font-black uppercase mb-1">Guinchos Prancha Asa Delta</h4>
                    <p className="text-stone-500 text-[10px] font-mono mb-3 uppercase">Rápida mobilização regional</p>
                    <p className="text-stone-400 text-xs leading-relaxed mb-4">
                      Veículos versáteis para faturamentos rápidos no raio de 200 km da fábrica. Proporcionam agilidade e excelente custo-benefício de frete para compras à pronta entrega.
                    </p>
                    <div className="text-[10px] font-mono text-stone-500">Recomendado para: Unidades leves de 10 e 20 pés em distâncias regionais curtas.</div>
                  </div>

                  {/* Safety compliance note */}
                  <div className="bg-[#FFD400]/5 border border-[#FFD400]/10 p-5 rounded-2xl flex flex-col justify-between">
                    <div>
                      <h4 className="text-[#FFD400] text-sm font-black uppercase mb-1 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4" /> REGRAS DE SEGURANÇA E DESCARGA
                      </h4>
                      <p className="text-stone-300 text-xs leading-normal mt-2">
                        • Certifique-se de que o local possui rede elétrica aérea desimpedida.<br />
                        • O solo deve ser plano e firme para patolamento do caminhão Munck.<br />
                        • Nossos motoristas possuem certificação NR-11 para operações de içamento técnico profissional.
                      </p>
                    </div>
                    <button
                      onClick={() => handleWhatsAppConsult()}
                      className="w-full mt-4 py-2.5 bg-[#FFD400] hover:bg-[#FFD400]/90 text-[#0F1115] text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer font-display"
                    >
                      Falar com Supervisor de Operações
                    </button>
                  </div>

                </div>

              </div>
            </motion.div>
          )}

          {/* TAB 3: LOGISTICS COST AND TIME SIMULATOR */}
          {activeTab === "simulador" && (
            <motion.div
              key="tab-simulador"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-3xl mx-auto"
            >
              <div className="bg-[#111827]/40 border border-white/5 p-6 sm:p-8 rounded-3xl relative overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#FFD400]" />

                {/* Form column */}
                <div className="md:col-span-5 space-y-5">
                  <span className="block text-[10px] font-mono font-bold text-[#FFD400] uppercase tracking-wider">
                    PARÂMETROS DE LOGÍSTICA
                  </span>

                  {/* Input 1 */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] uppercase font-bold text-stone-400">Tipo de Container:</label>
                    <select
                      value={simContainerType}
                      onChange={(e) => setSimContainerType(e.target.value as any)}
                      className="w-full bg-[#0F1115] border border-white/10 rounded-xl p-3 text-xs text-white focus:border-[#FFD400] outline-none font-bold"
                    >
                      <option value="20_dry">20 Pés Dry (6 Metros)</option>
                      <option value="40_dry">40 Pés Dry (12 Metros)</option>
                      <option value="20_reefer">20 Pés Refrigerado (Reefer)</option>
                      <option value="40_hc_office">Módulo Escritório 40 Pés HC</option>
                    </select>
                  </div>

                  {/* Local Santa Rosa toggle */}
                  <label className="flex items-center gap-2.5 p-3 rounded-xl bg-[#0F1115] border border-white/10 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={simLocalSantaRosa}
                      onChange={(e) => setSimLocalSantaRosa(e.target.checked)}
                      className="w-4 h-4 accent-[#FFD400] cursor-pointer"
                    />
                    <span className="text-[11px] font-bold text-white uppercase tracking-wide">Entrega dentro de Santa Rosa/RS</span>
                  </label>

                  {/* Input 2 */}
                  <div className={`space-y-1.5 transition-opacity ${simLocalSantaRosa ? "opacity-40 pointer-events-none" : ""}`}>
                    <div className="flex justify-between text-[10px] font-bold uppercase text-stone-400">
                      <span>Distância aproximada:</span>
                      <span className="text-[#FFD400] font-mono">{simDistance} km</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="1500"
                      step="25"
                      value={simDistance}
                      onChange={(e) => setSimDistance(Number(e.target.value))}
                      disabled={simLocalSantaRosa}
                      className="w-full accent-[#FFD400] cursor-pointer"
                    />
                    <div className="flex justify-between text-[9px] font-mono text-stone-600">
                      <span>50 km</span>
                      <span>750 km</span>
                      <span>1500 km</span>
                    </div>
                    {!simLocalSantaRosa && simDistance <= 80 && (
                      <p className="text-[9px] font-mono text-[#FFD400]/80 pt-0.5">Frete fechado até 80km: R$ 3.000</p>
                    )}
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={handleWhatsAppSimulate}
                      className="w-full py-3 bg-[#FFD400] hover:bg-[#FFD400]/90 text-[#0F1115] text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer font-display flex items-center justify-center gap-2"
                    >
                      <PhoneCall className="w-4 h-4" /> Solicitar Cotação Oficial
                    </button>
                  </div>
                </div>

                {/* Live result column */}
                <div className="md:col-span-7 bg-black/40 border border-white/5 p-6 rounded-2xl relative space-y-5">
                  <span className="block text-[10px] font-mono font-bold text-stone-500 uppercase tracking-widest">
                    PROJEÇÃO ESTIMATIVA DE TRÂNSITO
                  </span>

                  {(simLocalSantaRosa || simDistance <= 80) && (
                    <div className="bg-[#FFD400]/10 border border-[#FFD400]/30 p-3.5 rounded-xl">
                      <span className="text-[9px] font-mono text-[#FFD400] block uppercase mb-0.5">
                        {simLocalSantaRosa ? "FRETE FECHADO — SANTA ROSA/RS" : "FRETE FECHADO — ATÉ 80KM"}
                      </span>
                      <p className="text-white text-xl font-black font-display">
                        R$ {simResult.cost.toLocaleString("pt-BR")}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/[0.01] p-3.5 border border-white/[0.02] rounded-xl">
                      <span className="text-[9px] font-mono text-stone-500 block uppercase mb-0.5">PRAZO DE TRANSPORTE</span>
                      <p className="text-white text-sm font-black font-display uppercase tracking-tight">{simResult.time}</p>
                    </div>

                    <div className="bg-white/[0.01] p-3.5 border border-white/[0.02] rounded-xl">
                      <span className="text-[9px] font-mono text-stone-500 block uppercase mb-0.5">MODAL DE VEÍCULO</span>
                      <p className="text-stone-300 text-xs font-bold leading-tight">{simResult.requiredTruck}</p>
                    </div>
                  </div>

                  <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-xs text-stone-400 leading-relaxed">
                    <span className="text-[#FFD400] font-black uppercase text-[9px] tracking-wider block mb-1">✓ SEGURO DE CARGA INCLUSO</span>
                    <p className="text-stone-300 font-medium">Esta projeção inclui apólice de seguro contra sinistros rodoviários com cobertura total de danos avaliada em 100% do valor da nota fiscal.</p>
                  </div>

                  <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl text-[10px] text-stone-500 flex gap-2 items-start leading-normal">
                    <Info className="w-3.5 h-3.5 text-[#FFD400] shrink-0 mt-0.5" />
                    <span>Os valores e prazos acima são meras projeções logísticas referenciais baseadas em quilometragem linear rodoviária. Fatores sazonais de pedágios ou restrições especiais de trânsito em algumas capitais podem alterar as condições reais.</span>
                  </div>

                </div>

              </div>
            </motion.div>
          )}

        </AnimatePresence>

      </div>

      {/* Embedded CSS keyframes for custom SVG delivery pulse flow animation */}
      <style>{`
        @keyframes moveCargoFlow {
          0% {
            stroke-dashoffset: 120;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }
      `}</style>

    </section>
  );
}
