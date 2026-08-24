import React, { useState, useEffect, useRef, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Building2, Package, Home, Droplets, Sparkles,
  MapPin, MessageSquare, ChevronRight, ChevronLeft, Check, RotateCcw,
  Minus, Plus, Snowflake, Zap, Layers, AppWindow, Box,
} from "lucide-react";
import { useAppContext } from "../context/AppContext";

const ContainerVisualizer3D = lazy(() => import("./ContainerVisualizer3D"));

// ── Constants ────────────────────────────────────────────────────────────────

const STEPS = ["Tamanho", "Finalidade", "Piso", "Pintura", "Extras", "Contato"] as const;

const TAMANHO_OPTIONS = [
  { value: "10 pés (3m)",  label: "10 pés",   sub: "~ 3 metros",        badge: "Compacto"  },
  { value: "20 pés (6m)",  label: "20 pés",   sub: "~ 6 metros",        badge: "Padrão"    },
  { value: "40 pés (12m)", label: "40 pés",   sub: "~ 12 metros",       badge: "Grande"    },
  { value: "Acoplado",     label: "Acoplado", sub: "Múltiplos módulos", badge: "Sob medida"},
];

const USO_OPTIONS = [
  { value: "Escritório / Comercial",  label: "Escritório",    sub: "Comercial / Administrativo", icon: Building2 },
  { value: "Depósito / Almoxarifado", label: "Depósito",      sub: "Almoxarifado / Estoque",     icon: Package   },
  { value: "Habitacional / Studio",   label: "Habitacional",  sub: "Studio / Moradia",           icon: Home      },
  { value: "Sanitário / Banheiro",    label: "Sanitário",     sub: "Banheiro / Vestiário",       icon: Droplets  },
  { value: "Projeto Personalizado",   label: "Personalizado", sub: "Projeto sob medida",         icon: Sparkles  },
];

const PISO_OPTIONS = [
  { value: "Madeira Compensada", sub: "Rústico e resistente", color: "#7c3a10" },
  { value: "Epóxi Industrial",   sub: "Industrial e lavável",  color: "#1e3a8a" },
  { value: "Porcelanato",        sub: "Acabamento premium",    color: "#b0b8c8" },
  { value: "Cimento Queimado",   sub: "Moderno e durável",     color: "#52525b" },
  { value: "Sem revestimento",   sub: "Estrutura de aço nua",  color: "#1c1c1e" },
];

const ACABAMENTO_OPTIONS = [
  { value: "Cinza Industrial",  color: "#4B5563", text: "#fff" },
  { value: "Branco Pérola",     color: "#E5E7EB", text: "#111" },
  { value: "Amarelo Dodisa",    color: "#FFD400", text: "#111" },
  { value: "Verde Militar",     color: "#2d4a1e", text: "#fff" },
  { value: "Cor Personalizada", color: null,      text: "#fff" },
];

// ── Toggle Switch ─────────────────────────────────────────────────────────────

function Toggle({ on }: { on: boolean }) {
  return (
    <div className={`relative w-10 h-5 rounded-full border transition-colors ${
      on ? "bg-brand-yellow border-brand-yellow" : "bg-zinc-800 border-zinc-700"
    }`}>
      <motion.div
        animate={{ x: on ? 19 : 2 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        className={`absolute top-0.5 w-4 h-4 rounded-full ${on ? "bg-zinc-950" : "bg-zinc-500"}`}
      />
    </div>
  );
}

// ── Color helper ─────────────────────────────────────────────────────────────

function adj(hex: string, amt: number): string {
  const c = (v: number) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, "0");
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `#${c(r + amt)}${c(g + amt)}${c(b + amt)}`;
}

// ── Container 3D SVG Preview ──────────────────────────────────────────────────

function ContainerPreview({ uso, tamanho, piso, acabamento, janelas, temAC }: {
  uso: string; tamanho: string; piso: string; acabamento: string;
  janelas: number; temAC: boolean;
}) {
  // Base color per paint choice
  const base =
    acabamento === "Amarelo Dodisa"    ? "#C89A00" :
    acabamento === "Verde Militar"     ? "#2d5a1e" :
    acabamento === "Branco Pérola"     ? "#B8C0CC" :
    acabamento === "Cor Personalizada" ? "#5B21B6" : "#374151";

  // Derived shades for each face + corrugation
  const wall     = base;
  const wallRib  = adj(base, -32);   // corrugation shadow strip
  const wallHigh = adj(base, +48);   // corrugation highlight strip
  const wallSide = adj(base, -55);   // long-side face (darker)
  const wallSR   = adj(base, -80);   // side corrugation shadow
  const wallTop  = adj(base, +28);   // roof face (lighter)
  const wallTR   = adj(base, +8);    // roof corrugation
  const frame    = adj(base, -90);   // door frame / border

  const floor =
    piso === "Madeira Compensada" ? "#7c3a10" :
    piso === "Epóxi Industrial"   ? "#1e3a8a" :
    piso === "Porcelanato"        ? "#9ca3b0" :
    piso === "Cimento Queimado"   ? "#52525b" : "#1c1c1e";

  const depthX =
    tamanho.includes("10") ? 30 :
    tamanho.includes("40") ? 88 :
    tamanho.includes("Acoplado") ? 100 : 58;
  const depthY = -Math.round(depthX * 0.66);

  // Front face constants
  const FX = 68, FY = 58, FW = 162, FH = 118;
  const T = (x: number, y: number) => `${x},${y}`;
  const topPts  = [T(FX,FY), T(FX+FW,FY), T(FX+FW+depthX,FY+depthY), T(FX+depthX,FY+depthY)].join(" ");
  const sidePts = [T(FX+FW,FY), T(FX+FW+depthX,FY+depthY), T(FX+FW+depthX,FY+depthY+FH), T(FX+FW,FY+FH)].join(" ");

  // Corrugation cycle
  const RC = 11; // px per rib cycle
  const ribN = Math.floor(FH / RC);

  const hasVents = uso.includes("Sanitário");
  const autoWin  = uso.includes("Escritório") || uso.includes("Habitacional");
  const winCount = janelas > 0 ? Math.min(janelas, 2) : (autoWin ? 1 : 0);
  const label    = tamanho ? tamanho.split("(")[0].trim().toUpperCase() : "";

  const vbW = FX + FW + depthX + 22;
  const vbH = FY + FH + 26;

  return (
    <motion.svg
      key={`${tamanho}-${acabamento}-${piso}-${uso}-${janelas}-${temAC}`}
      viewBox={`0 0 ${vbW} ${vbH}`}
      className="w-full max-w-sm mx-auto"
      fill="none"
      initial={{ opacity: 0, scale: 0.93 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35 }}
    >
      <defs>
        <filter id="cp-blur"><feGaussianBlur stdDeviation="5" /></filter>
        {/* Metallic paint sheen */}
        <radialGradient id="cp-sheen" cx="28%" cy="22%" r="75%">
          <stop offset="0%"   stopColor="white" stopOpacity="0.14" />
          <stop offset="55%"  stopColor="white" stopOpacity="0.01" />
          <stop offset="100%" stopColor="black" stopOpacity="0.12" />
        </radialGradient>
        <radialGradient id="cp-sheen-side" cx="30%" cy="30%" r="70%">
          <stop offset="0%"   stopColor="white" stopOpacity="0.07" />
          <stop offset="100%" stopColor="black" stopOpacity="0.18" />
        </radialGradient>
        <clipPath id="cp-front-clip">
          <rect x={FX} y={FY} width={FW} height={FH} />
        </clipPath>
        <clipPath id="cp-side-clip">
          <polygon points={sidePts} />
        </clipPath>
        <clipPath id="cp-top-clip">
          <polygon points={topPts} />
        </clipPath>
      </defs>

      {/* Ground shadow */}
      <ellipse cx={FX+FW*0.48+depthX*0.3} cy={vbH-3}
        rx={FW*0.52+depthX*0.2} ry={7.5}
        fill="black" opacity="0.38" filter="url(#cp-blur)" />

      {/* ══ TOP FACE ══ */}
      <polygon points={topPts} fill={wallTop} />
      {/* Roof corrugation — ribs running across width */}
      {Array.from({length: 8}, (_, i) => {
        const f = (i + 0.5) / 9;
        const px = FX + depthX * f, py = FY + depthY * f;
        return (
          <React.Fragment key={i}>
            <line x1={px} y1={py} x2={px+FW} y2={py} stroke={wallTR} strokeWidth="1.8" />
            <line x1={px} y1={py+1.8} x2={px+FW} y2={py+1.8} stroke={wallTop} strokeWidth="0.6" opacity="0.7" />
          </React.Fragment>
        );
      })}
      <polygon points={topPts} fill="none" stroke={frame} strokeWidth="1" opacity="0.6" />

      {/* ══ SIDE FACE (long wall) ══ */}
      {/* Corrugation as colored parallelogram strips */}
      {Array.from({length: ribN+1}, (_, i) => {
        const y0 = FY + i * RC;
        const y1 = Math.min(FY+FH, y0 + RC * 0.70);
        const y2 = Math.min(FY+FH, y0 + RC * 0.85);
        const y3 = Math.min(FY+FH, y0 + RC);
        const sp = (y: number) =>
          `${FX+FW},${y} ${FX+FW+depthX},${FY+depthY+(y-FY)} ${FX+FW+depthX},${FY+depthY+(Math.min(FY+FH,y3)-FY)} ${FX+FW},${Math.min(FY+FH,y3)}`;
        const s1 = `${FX+FW},${y0} ${FX+FW+depthX},${FY+depthY+(y0-FY)} ${FX+FW+depthX},${FY+depthY+(y1-FY)} ${FX+FW},${y1}`;
        const s2 = `${FX+FW},${y1} ${FX+FW+depthX},${FY+depthY+(y1-FY)} ${FX+FW+depthX},${FY+depthY+(y2-FY)} ${FX+FW},${y2}`;
        const s3 = `${FX+FW},${y2} ${FX+FW+depthX},${FY+depthY+(y2-FY)} ${FX+FW+depthX},${FY+depthY+(y3-FY)} ${FX+FW},${y3}`;
        void sp;
        return (
          <React.Fragment key={i}>
            <polygon points={s1} fill={wallSide} />
            <polygon points={s2} fill={wallSR} />
            <polygon points={s3} fill={adj(wallSide, +12)} />
          </React.Fragment>
        );
      })}
      {/* Metallic sheen on side */}
      <polygon points={sidePts} fill="url(#cp-sheen-side)" />
      {/* AC unit */}
      {temAC && depthX > 32 && (() => {
        const ax = FX+FW + depthX*0.30, ay = FY + depthY*0.30 + FH*0.18;
        const aw = depthX*0.30, ah = FH*0.24;
        return (
          <g clipPath="url(#cp-side-clip)">
            <rect x={ax} y={ay} width={aw} height={ah} rx="2" fill="#0a1520" />
            <rect x={ax+1.5} y={ay+1.5} width={aw-3} height={4} rx="0.5" fill="#3B82F6" opacity="0.6" />
            {[6,10,14,18].map(dy => (
              <rect key={dy} x={ax+2} y={ay+dy} width={aw-4} height={2.5} rx="0.5" fill="#1e3a5f" />
            ))}
          </g>
        );
      })()}
      <polygon points={sidePts} fill="none" stroke={frame} strokeWidth="1" opacity="0.55" />

      {/* ══ FRONT FACE (door end) — corrugation via real colored strips ══ */}
      {Array.from({length: ribN+1}, (_, i) => {
        const y0 = FY + i * RC;
        const y1 = Math.min(FY+FH, y0 + RC * 0.70);
        const y2 = Math.min(FY+FH, y0 + RC * 0.86);
        const y3 = Math.min(FY+FH, y0 + RC);
        return (
          <React.Fragment key={i}>
            <rect x={FX} y={y0} width={FW} height={y1-y0} fill={wall}    />  {/* flat */}
            <rect x={FX} y={y1} width={FW} height={y2-y1} fill={wallRib} />  {/* shadow at bend */}
            <rect x={FX} y={y2} width={FW} height={y3-y2} fill={wallHigh}/>  {/* highlight on top of next ridge */}
          </React.Fragment>
        );
      })}

      {/* Door frame border */}
      <rect x={FX}       y={FY} width={8}  height={FH} fill={frame} />
      <rect x={FX+FW-8}  y={FY} width={8}  height={FH} fill={frame} />
      <rect x={FX}       y={FY} width={FW} height={8}  fill={adj(frame, +14)} />
      <rect x={FX}       y={FY+FH-9} width={FW} height={9} fill={frame} />
      {/* Door center split */}
      <rect x={FX+FW/2-2.5} y={FY} width={5}   height={FH} fill={frame} />
      <rect x={FX+FW/2-0.8} y={FY+6} width={1.6} height={FH-12} fill={adj(frame, +22)} opacity="0.45" />

      {/* Windows */}
      {winCount > 0 && Array.from({length: winCount}, (_, wi) => {
        const pw = FW/2 - 10;
        const wx = wi === 0 ? FX+10 : FX+FW/2+5;
        const wy = FY + FH * 0.2;
        const ww = pw * 0.70, wh = FH * 0.30;
        return (
          <g key={wi} clipPath="url(#cp-front-clip)">
            {/* Frame */}
            <rect x={wx-3} y={wy-3} width={ww+6} height={wh+6} rx="2.5" fill={adj(frame, +18)} />
            {/* Glass */}
            <rect x={wx} y={wy} width={ww} height={wh} rx="1.5" fill="#0c2040" />
            <rect x={wx} y={wy} width={ww} height={wh} rx="1.5" fill="#2563EB" opacity="0.25" />
            {/* Cross frame */}
            <rect x={wx+ww/2-1.2} y={wy} width={2.4} height={wh} fill={adj(frame, +18)} />
            <rect x={wx} y={wy+wh/2-1.2} width={ww} height={2.4} fill={adj(frame, +18)} />
            {/* Reflection highlight */}
            <rect x={wx+3} y={wy+3} width={ww*0.38} height={wh*0.3} rx="1" fill="white" opacity="0.10" />
          </g>
        );
      })}

      {/* Vent slats (Sanitário) */}
      {hasVents && Array.from({length:4}, (_,i) => {
        const vy = FY + FH*0.26 + i*7;
        return (
          <React.Fragment key={i}>
            <rect x={FX+10} y={vy}   width={FW*0.22} height={5}   rx="1" fill={wallRib} />
            <rect x={FX+10} y={vy+4} width={FW*0.22} height={1.2} rx="0.5" fill={wallHigh} opacity="0.5" />
          </React.Fragment>
        );
      })}

      {/* Floor strip */}
      <rect x={FX+9}   y={FY+FH-13} width={FW-18} height={10} rx="1" fill={floor} />
      <rect x={FX+9}   y={FY+FH-13} width={FW-18} height={2.5} fill="white" opacity="0.09" />

      {/* Metallic sheen on front */}
      <rect x={FX} y={FY} width={FW} height={FH} fill="url(#cp-sheen)" />

      {/* Cam lock bars — detailed */}
      {[FX+FW*0.275, FX+FW*0.725].map((cx, i) => (
        <React.Fragment key={i}>
          {/* Shadow behind bar */}
          <rect x={cx-4} y={FY+11} width={8} height={FH-22} rx="4" fill="black" opacity="0.18" />
          {/* Bar body */}
          <rect x={cx-3} y={FY+13} width={6} height={FH-26} rx="3" fill={adj(frame, +35)} />
          <rect x={cx-1.5} y={FY+15} width={3} height={FH-30} rx="1.5" fill={adj(frame, +55)} opacity="0.5" />
          {/* Cam discs — top and bottom */}
          {[FY+23, FY+FH-19].map(cy => (
            <React.Fragment key={cy}>
              <circle cx={cx}   cy={cy} r={7.5} fill="black"          opacity="0.3"  />
              <circle cx={cx}   cy={cy} r={6.5} fill={adj(frame,+20)} />
              <circle cx={cx}   cy={cy} r={4.5} fill={adj(frame,-10)} />
              <circle cx={cx}   cy={cy} r={2.5} fill={adj(frame,+50)} opacity="0.7"  />
              <circle cx={cx}   cy={cy} r={1.2} fill="black"          opacity="0.9"  />
              <circle cx={cx-2} cy={cy-2} r={1} fill="white"          opacity="0.18" />
            </React.Fragment>
          ))}
        </React.Fragment>
      ))}

      {/* Border line on front face */}
      <rect x={FX} y={FY} width={FW} height={FH} fill="none" stroke={frame} strokeWidth="1" opacity="0.6" />

      {/* Corner castings */}
      {([[FX-5,FY-5],[FX+FW-7,FY-5],[FX-5,FY+FH-9],[FX+FW-7,FY+FH-9]] as [number,number][]).map(([cx,cy],i) => (
        <React.Fragment key={i}>
          <rect x={cx}   y={cy}   width={12} height={14} rx="2.5" fill="#0a0a0a" />
          <rect x={cx+1} y={cy+1} width={10} height={4}  rx="1"   fill="white"   opacity="0.09" />
          <rect x={cx+2} y={cy+6} width={8}  height={6}  rx="1.5" fill="#080808" />
          <circle cx={cx+6} cy={cy+9} r={2.2} fill="#1a1a1a" />
        </React.Fragment>
      ))}

      {/* Size label */}
      {label && (
        <text x={FX+FW/2} y={FY-15} textAnchor="middle"
          fontSize="8" fontFamily="monospace" fontWeight="bold" letterSpacing="2.5"
          fill="rgba(255,255,255,0.32)">
          {label}
        </text>
      )}
    </motion.svg>
  );
}

// ── Config Summary ────────────────────────────────────────────────────────────

function ConfigSummary({ uso, tamanho, modalidade, piso, acabamento, janelas, temAC, temEletrica, temIsolamento }: {
  uso: string; tamanho: string; modalidade: string; piso: string; acabamento: string;
  janelas: number; temAC: boolean; temEletrica: boolean; temIsolamento: boolean;
}) {
  const pisoOpt = PISO_OPTIONS.find(p => p.value === piso);
  const acabOpt = ACABAMENTO_OPTIONS.find(a => a.value === acabamento);

  const rows = [
    { label: "Tamanho",    value: tamanho ? tamanho.split("(")[0].trim() : "", chip: null as React.ReactNode },
    { label: "Modalidade", value: modalidade, chip: null as React.ReactNode },
    { label: "Finalidade", value: uso, chip: null as React.ReactNode },
    {
      label: "Piso",
      value: piso,
      chip: pisoOpt ? <span className="w-3 h-3 rounded-sm flex-shrink-0 inline-block border border-white/10" style={{ backgroundColor: pisoOpt.color }} /> : null,
    },
    {
      label: "Pintura",
      value: acabamento,
      chip: acabOpt?.color
        ? <span className="w-3 h-3 rounded-sm flex-shrink-0 inline-block border border-white/10" style={{ backgroundColor: acabOpt.color }} />
        : acabamento === "Cor Personalizada"
        ? <span className="w-3 h-3 rounded-sm flex-shrink-0 inline-block bg-gradient-to-br from-pink-500 via-yellow-400 to-cyan-400" />
        : null,
    },
  ];

  const extras = [
    janelas > 0 && `${janelas} janela${janelas > 1 ? "s" : ""}`,
    temAC && "Ar-condicionado",
    temEletrica && "Inst. elétrica",
    temIsolamento && "Isolamento térmico",
  ].filter(Boolean) as string[];

  return (
    <div className="divide-y divide-zinc-800/50">
      {rows.map(({ label, value, chip }) => (
        <div key={label} className="flex items-center justify-between gap-3 py-2">
          <span className="text-[9px] font-mono font-bold text-zinc-600 uppercase tracking-widest shrink-0">{label}</span>
          <AnimatePresence mode="wait">
            <motion.span
              key={value || "empty"}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -3 }}
              transition={{ duration: 0.12 }}
              className={`flex items-center gap-1.5 text-[10px] font-black text-right max-w-[150px] ${value ? "text-white" : "text-zinc-700"}`}
            >
              {chip}
              <span className="truncate">{value || "—"}</span>
            </motion.span>
          </AnimatePresence>
        </div>
      ))}
      {extras.length > 0 && (
        <div className="flex items-start justify-between gap-3 py-2">
          <span className="text-[9px] font-mono font-bold text-zinc-600 uppercase tracking-widest shrink-0 mt-0.5">Extras</span>
          <div className="flex flex-wrap gap-1 justify-end">
            {extras.map((e) => (
              <span key={e} className="text-[8px] font-bold bg-brand-yellow/10 text-brand-yellow px-1.5 py-0.5 rounded border border-brand-yellow/20 whitespace-nowrap">
                {e}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function SimuladorOrcamento() {
  const { whatsapp: systemWhatsapp } = useAppContext();

  const [step, setStep]               = useState(0);
  const [dir, setDir]                 = useState(1);
  const [tamanho, setTamanho]         = useState("");
  const [modalidade, setModalidade]   = useState("Compra");
  const [uso, setUso]                 = useState("");
  const [piso, setPiso]               = useState("");
  const [acabamento, setAcabamento]   = useState("");
  const [janelas, setJanelas]         = useState(0);
  const [temAC, setTemAC]             = useState(false);
  const [temEletrica, setTemEletrica] = useState(false);
  const [temIsolamento, setTemIsolamento] = useState(false);
  const [name, setName]               = useState("");
  const [phone, setPhone]             = useState("");
  const [cityState, setCityState]     = useState("");
  const [isDetected, setIsDetected]   = useState(false);

  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const ev = e as CustomEvent<{ city: string; state: string }>;
      if (ev.detail?.city) {
        setCityState(`${ev.detail.city} - ${ev.detail.state}`);
        setIsDetected(true);
      }
    };
    window.addEventListener("location-detected", handler);
    return () => window.removeEventListener("location-detected", handler);
  }, []);

  const go = (next: number) => { setDir(next > step ? 1 : -1); setStep(next); };

  const autoAdvance = (fn: () => void) => {
    fn();
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    advanceTimer.current = setTimeout(() => go(step + 1), 360);
  };

  const canProceed = [
    !!tamanho,
    !!uso,
    !!piso,
    !!acabamento,
    true,
    !!(name.trim() && phone.trim()),
  ][step] ?? false;

  const reset = () => {
    setStep(0); setDir(1);
    setTamanho(""); setModalidade("Compra");
    setUso(""); setPiso(""); setAcabamento("");
    setJanelas(0); setTemAC(false); setTemEletrica(false); setTemIsolamento(false);
    setName(""); setPhone(""); setCityState(""); setIsDetected(false);
  };

  const handleSubmit = () => {
    const extrasList = [
      janelas > 0 && `${janelas} janela${janelas > 1 ? "s" : ""}`,
      temAC && "Ar-condicionado",
      temEletrica && "Instalação elétrica",
      temIsolamento && "Isolamento térmico",
    ].filter(Boolean).join(", ");

    const msg = `Olá! Configurei meu container pelo site da Dodisa Containers:

• Tamanho: ${tamanho}
• Modalidade: ${modalidade}
• Finalidade: ${uso}
• Piso: ${piso}
• Acabamento externo: ${acabamento}
• Extras: ${extrasList || "Nenhum"}
• Local de entrega: ${cityState || "A informar"}

Nome: ${name}
WhatsApp: ${phone}

Gostaria de receber um orçamento!`;
    window.open(`https://wa.me/${systemWhatsapp.number}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  // ── The live preview panel (shared between mobile top and desktop right)
  const Preview = (
    <>
      {/* Badge */}
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/8 text-[8px] font-black text-zinc-500 uppercase tracking-widest font-mono w-fit">
        <Box className="w-3 h-3" /> Visualização 3D em tempo real
      </div>

      {/* 3D viewer card */}
      <div className="relative bg-gradient-to-b from-zinc-900/50 to-zinc-950 rounded-2xl border border-white/6 overflow-hidden" style={{ height: 320 }}>
        <Suspense fallback={
          <div className="flex items-center justify-center h-full">
            <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest animate-pulse">
              Carregando visualizador 3D...
            </span>
          </div>
        }>
          <ContainerVisualizer3D
            acabamento={acabamento} piso={piso}
            janelas={janelas} temAC={temAC} temEletrica={temEletrica}
            step={step}
          />
        </Suspense>
      </div>

      {/* Summary */}
      <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-xl p-4">
        <p className="text-[8px] font-mono font-bold text-zinc-600 uppercase tracking-widest mb-3">Sua configuração</p>
        <ConfigSummary
          uso={uso} tamanho={tamanho} modalidade={modalidade}
          piso={piso} acabamento={acabamento}
          janelas={janelas} temAC={temAC}
          temEletrica={temEletrica} temIsolamento={temIsolamento}
        />
      </div>

      <p className="text-[8px] font-mono text-zinc-700 text-center">
        {step < STEPS.length - 1
          ? `${STEPS.length - 1 - step} etapa${STEPS.length - 1 - step !== 1 ? "s" : ""} restante${STEPS.length - 1 - step !== 1 ? "s" : ""}`
          : "✓ Configuração completa — pronto para orçamento!"}
      </p>
    </>
  );

  // ── Step content
  const StepContent = (
    <AnimatePresence mode="wait" custom={dir}>
      <motion.div
        key={step}
        custom={dir}
        initial={{ opacity: 0, x: dir * 28 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: dir * -28 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >

        {/* 0 — TAMANHO */}
        {step === 0 && (
          <div>
            <h3 className="text-white font-black text-xl uppercase tracking-tight mb-1">Qual o tamanho?</h3>
            <p className="text-zinc-500 text-xs mb-6">Escolha as dimensões e a modalidade de contrato</p>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {TAMANHO_OPTIONS.map((opt) => {
                const sel = tamanho === opt.value;
                return (
                  <motion.button key={opt.value} type="button" whileTap={{ scale: 0.97 }}
                    onClick={() => setTamanho(opt.value)}
                    className={`relative p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-2 ${
                      sel ? "border-brand-yellow bg-brand-yellow/10 shadow-md shadow-brand-yellow/10"
                          : "border-zinc-800 bg-zinc-950 hover:border-zinc-700 hover:bg-zinc-900"
                    }`}
                  >
                    {sel && (
                      <span className="absolute top-2.5 right-2.5 w-4 h-4 bg-brand-yellow rounded-full flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-zinc-950" />
                      </span>
                    )}
                    <p className={`text-2xl font-black leading-none ${sel ? "text-brand-yellow" : "text-white"}`}>{opt.label}</p>
                    <p className="text-xs text-zinc-500">{opt.sub}</p>
                    <span className={`self-start text-[8px] font-mono font-black uppercase px-2 py-0.5 rounded ${
                      sel ? "bg-brand-yellow/15 text-brand-yellow" : "bg-zinc-800 text-zinc-500"
                    }`}>{opt.badge}</span>
                  </motion.button>
                );
              })}
            </div>
            <p className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest mb-3">Modalidade</p>
            <div className="grid grid-cols-2 gap-3">
              {["Compra", "Aluguel"].map((m) => (
                <button key={m} type="button" onClick={() => setModalidade(m)}
                  className={`py-3 min-h-[44px] rounded-xl border font-black text-xs uppercase tracking-widest text-center transition-all cursor-pointer ${
                    modalidade === m
                      ? "bg-brand-yellow border-brand-yellow text-zinc-950"
                      : "border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-800"
                  }`}
                >{m}</button>
              ))}
            </div>
          </div>
        )}

        {/* 1 — FINALIDADE */}
        {step === 1 && (
          <div>
            <h3 className="text-white font-black text-xl uppercase tracking-tight mb-1">Qual a finalidade?</h3>
            <p className="text-zinc-500 text-xs mb-6">Selecione o uso principal do container</p>
            <div className="grid grid-cols-2 gap-3">
              {USO_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const sel = uso === opt.value;
                return (
                  <motion.button key={opt.value} type="button" whileTap={{ scale: 0.97 }}
                    onClick={() => autoAdvance(() => setUso(opt.value))}
                    className={`relative p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-3 min-h-[108px] ${
                      sel ? "border-brand-yellow bg-brand-yellow/10"
                          : "border-zinc-800 bg-zinc-950 hover:border-zinc-700 hover:bg-zinc-900"
                    }`}
                  >
                    {sel && (
                      <span className="absolute top-2.5 right-2.5 w-4 h-4 bg-brand-yellow rounded-full flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-zinc-950" />
                      </span>
                    )}
                    <Icon className={`w-5 h-5 ${sel ? "text-brand-yellow" : "text-zinc-500"}`} />
                    <div>
                      <p className={`text-xs font-black uppercase tracking-tight ${sel ? "text-white" : "text-zinc-300"}`}>{opt.label}</p>
                      <p className="text-[10px] text-zinc-600 mt-0.5 leading-tight">{opt.sub}</p>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        )}

        {/* 2 — PISO */}
        {step === 2 && (
          <div>
            <h3 className="text-white font-black text-xl uppercase tracking-tight mb-1">Tipo de piso?</h3>
            <p className="text-zinc-500 text-xs mb-6">Escolha o revestimento do piso interno</p>
            <div className="space-y-2.5">
              {PISO_OPTIONS.map((opt) => {
                const sel = piso === opt.value;
                return (
                  <motion.button key={opt.value} type="button" whileTap={{ scale: 0.99 }}
                    onClick={() => autoAdvance(() => setPiso(opt.value))}
                    className={`w-full rounded-xl border text-left transition-all cursor-pointer flex items-stretch overflow-hidden ${
                      sel ? "border-brand-yellow shadow-sm shadow-brand-yellow/10"
                          : "border-zinc-800 hover:border-zinc-700"
                    }`}
                  >
                    <div className="w-12 flex-shrink-0" style={{ backgroundColor: opt.color }} />
                    <div className={`flex-1 px-4 py-3.5 flex items-center justify-between gap-3 transition-colors ${
                      sel ? "bg-brand-yellow/10" : "bg-zinc-950 hover:bg-zinc-900"
                    }`}>
                      <div>
                        <p className={`text-sm font-black uppercase tracking-tight ${sel ? "text-white" : "text-zinc-300"}`}>{opt.value}</p>
                        <p className="text-[10px] text-zinc-600 mt-0.5">{opt.sub}</p>
                      </div>
                      {sel && <Check className="w-4 h-4 text-brand-yellow flex-shrink-0" />}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        )}

        {/* 3 — PINTURA */}
        {step === 3 && (
          <div>
            <h3 className="text-white font-black text-xl uppercase tracking-tight mb-1">Pintura externa?</h3>
            <p className="text-zinc-500 text-xs mb-6">Escolha a cor da pintura do container</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {ACABAMENTO_OPTIONS.map((opt) => {
                const sel = acabamento === opt.value;
                return (
                  <motion.button key={opt.value} type="button" whileTap={{ scale: 0.97 }}
                    onClick={() => autoAdvance(() => setAcabamento(opt.value))}
                    className={`rounded-xl border overflow-hidden cursor-pointer transition-all ${
                      sel ? "border-brand-yellow shadow-sm shadow-brand-yellow/10"
                          : "border-zinc-800 hover:border-zinc-700"
                    }`}
                  >
                    <div
                      className="h-16 w-full relative flex items-center justify-center"
                      style={opt.color ? { backgroundColor: opt.color } : { background: "linear-gradient(135deg,#ec4899,#FFD400,#22d3ee)" }}
                    >
                      {sel && (
                        <div className="w-6 h-6 rounded-full bg-white/25 backdrop-blur-sm flex items-center justify-center">
                          <Check className="w-3.5 h-3.5" style={{ color: opt.color && opt.color !== "#E5E7EB" && opt.color !== "#FFD400" ? "#fff" : "#111" }} />
                        </div>
                      )}
                    </div>
                    <div className={`p-2.5 transition-colors ${sel ? "bg-brand-yellow/10" : "bg-zinc-950"}`}>
                      <p className={`text-[9px] font-black uppercase tracking-tight leading-tight ${sel ? "text-white" : "text-zinc-400"}`}>{opt.value}</p>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        )}

        {/* 4 — EXTRAS */}
        {step === 4 && (
          <div>
            <h3 className="text-white font-black text-xl uppercase tracking-tight mb-1">Opcionais e extras</h3>
            <p className="text-zinc-500 text-xs mb-6">Adicione recursos ao seu container (todos opcionais)</p>
            <div className="space-y-3">

              {/* Janelas — counter */}
              <div className={`rounded-xl border p-4 transition-all ${
                janelas > 0 ? "border-brand-yellow/40 bg-brand-yellow/5" : "border-zinc-800 bg-zinc-950"
              }`}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${
                      janelas > 0 ? "bg-brand-yellow/10 border-brand-yellow/20 text-brand-yellow"
                                  : "bg-zinc-900 border-zinc-800 text-zinc-500"
                    }`}>
                      <AppWindow className="w-4 h-4" />
                    </div>
                    <div>
                      <p className={`text-sm font-black uppercase tracking-tight ${janelas > 0 ? "text-white" : "text-zinc-400"}`}>Janelas</p>
                      <p className="text-[10px] text-zinc-600">Ventilação e iluminação natural</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button type="button" onClick={() => setJanelas(Math.max(0, janelas - 1))}
                      className="w-8 h-8 rounded-lg border border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                    ><Minus className="w-3.5 h-3.5" /></button>
                    <span className={`w-6 text-center font-black text-sm ${janelas > 0 ? "text-brand-yellow" : "text-zinc-600"}`}>{janelas}</span>
                    <button type="button" onClick={() => setJanelas(Math.min(4, janelas + 1))}
                      className="w-8 h-8 rounded-lg border border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                    ><Plus className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              </div>

              {/* Toggle items */}
              {([
                { key: "ac",         label: "Ar-condicionado",    sub: "Climatização interna",         icon: Snowflake, on: temAC,         set: setTemAC         },
                { key: "ele",        label: "Instalação Elétrica", sub: "Tomadas, quadro e fiação",     icon: Zap,       on: temEletrica,    set: setTemEletrica   },
                { key: "iso",        label: "Isolamento Térmico",  sub: "EPS ou lã de vidro nas paredes", icon: Layers, on: temIsolamento,  set: setTemIsolamento },
              ] as { key: string; label: string; sub: string; icon: React.ElementType; on: boolean; set: (v: boolean) => void }[]).map(({ key, label, sub, icon: Icon, on, set }) => (
                <button key={key} type="button" onClick={() => set(!on)}
                  className={`w-full rounded-xl border p-4 text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    on ? "border-brand-yellow/40 bg-brand-yellow/5" : "border-zinc-800 bg-zinc-950 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${
                      on ? "bg-brand-yellow/10 border-brand-yellow/20 text-brand-yellow"
                         : "bg-zinc-900 border-zinc-800 text-zinc-500"
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className={`text-sm font-black uppercase tracking-tight ${on ? "text-white" : "text-zinc-400"}`}>{label}</p>
                      <p className="text-[10px] text-zinc-600">{sub}</p>
                    </div>
                  </div>
                  <Toggle on={on} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 5 — CONTATO */}
        {step === 5 && (
          <div>
            <h3 className="text-white font-black text-xl uppercase tracking-tight mb-1">Seus dados</h3>
            <p className="text-zinc-500 text-xs mb-4">Para enviarmos o orçamento completo pelo WhatsApp</p>
            <p className="text-[10px] font-mono text-zinc-600 mb-6 flex items-center gap-1.5">
              🔒 Seus dados não são compartilhados · Resposta em até 15 min
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-[9px] font-mono font-bold uppercase tracking-wider text-zinc-500 mb-2">Nome / Empresa</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: João Silva" autoFocus
                  className="w-full py-3.5 px-4 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-brand-yellow text-white text-sm placeholder-zinc-700 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-[9px] font-mono font-bold uppercase tracking-wider text-zinc-500 mb-2">WhatsApp</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                  placeholder="(51) 99999-9999"
                  className="w-full py-3.5 px-4 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-brand-yellow text-white text-sm placeholder-zinc-700 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-[9px] font-mono font-bold uppercase tracking-wider text-zinc-500 mb-2">
                  Local de entrega <span className="text-zinc-700 normal-case font-normal">(opcional)</span>
                </label>
                <div className="relative">
                  <input type="text" value={cityState} onChange={(e) => setCityState(e.target.value)}
                    placeholder="Ex: Porto Alegre - RS"
                    className="w-full py-3.5 pl-10 pr-12 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-brand-yellow text-white text-sm placeholder-zinc-700 focus:outline-none transition-colors"
                  />
                  <MapPin className="absolute left-3 top-4 w-4 h-4 text-zinc-600" />
                  {isDetected && (
                    <span className="absolute right-3 top-3 text-[8px] bg-brand-yellow/10 text-brand-yellow font-mono font-black px-1.5 py-0.5 rounded border border-brand-yellow/20 uppercase">
                      GPS
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      </motion.div>
    </AnimatePresence>
  );

  return (
    <section
      id="simulador-orcamento"
      className="relative bg-[#07090D] border-b border-zinc-800/60 scroll-mt-20 overflow-hidden"
    >
      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
        className="relative z-10 pt-14 sm:pt-20 pb-8 text-center px-4"
      >
        <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
          Monte seu <span className="text-brand-yellow">Container</span>
        </h2>
        <div className="w-12 h-0.5 bg-brand-yellow mx-auto mt-4 mb-4" />
        <p className="text-stone-400 text-xs sm:text-sm leading-relaxed max-w-xl mx-auto">
          Personalize cada detalhe e acompanhe seu projeto em tempo real.
        </p>
      </motion.div>

      {/* Mobile: preview at top */}
      <div className="lg:hidden px-4 mb-6">
        <div className="flex flex-col gap-4">
          {Preview}
        </div>
      </div>

      {/* Main layout */}
      <div className="relative z-10 flex flex-col lg:flex-row max-w-screen-xl mx-auto">

        {/* LEFT — Wizard */}
        <div className="lg:w-[42%] lg:border-r border-zinc-800/50">
          <div className="px-5 sm:px-8 lg:px-10 pb-10 flex flex-col">

            {/* Progress */}
            <div className="mb-7">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[9px] font-mono font-bold text-zinc-600 uppercase tracking-widest">
                  Passo {step + 1} de {STEPS.length}
                </span>
                <button onClick={reset}
                  className="flex items-center gap-1 text-[9px] font-mono text-zinc-700 hover:text-zinc-400 transition-colors cursor-pointer uppercase tracking-widest"
                >
                  <RotateCcw className="w-3 h-3" /> Recomeçar
                </button>
              </div>
              {/* Bar */}
              <div className="h-0.5 bg-zinc-800 rounded-full overflow-hidden mb-5">
                <motion.div
                  className="h-full bg-brand-yellow rounded-full"
                  animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
              </div>
              {/* Step pills */}
              <div className="flex items-center">
                {STEPS.map((s, i) => (
                  <React.Fragment key={s}>
                    <button
                      onClick={() => { if (i < step) go(i); }}
                      className={`flex flex-col items-center gap-1 ${i < step ? "cursor-pointer" : "cursor-default"}`}
                    >
                      <motion.div
                        animate={{
                          backgroundColor: i < step ? "#FFD400" : i === step ? "transparent" : "#18181b",
                          borderColor: i <= step ? "#FFD400" : "#3f3f46",
                        }}
                        transition={{ duration: 0.2 }}
                        className="w-6 h-6 rounded-full border flex items-center justify-center text-[8px] font-black"
                        style={{ color: i < step ? "#111" : i === step ? "#FFD400" : "#52525b" }}
                      >
                        {i < step ? <Check className="w-3 h-3" /> : i + 1}
                      </motion.div>
                      <span className={`text-[7px] font-mono uppercase hidden sm:block ${
                        i === step ? "text-brand-yellow" : i < step ? "text-zinc-500" : "text-zinc-700"
                      }`}>{s}</span>
                    </button>
                    {i < STEPS.length - 1 && (
                      <div className="flex-1 h-px mx-1 mb-3 sm:mb-4 transition-colors"
                        style={{ background: i < step ? "#FFD400" : "#27272a" }} />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Step content */}
            <div className="min-h-[300px]">
              {StepContent}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-zinc-800/50">
              <button type="button" onClick={() => go(Math.max(0, step - 1))} disabled={step === 0}
                className="flex items-center gap-2 text-zinc-500 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> Voltar
              </button>

              {step < STEPS.length - 1 ? (
                <button type="button" onClick={() => { if (canProceed) go(step + 1); }} disabled={!canProceed}
                  className="flex items-center gap-2 bg-brand-yellow text-zinc-950 font-black text-xs uppercase tracking-widest px-6 py-3 min-h-[44px] rounded-xl hover:bg-amber-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  Continuar <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button type="button" onClick={() => { if (canProceed) handleSubmit(); }} disabled={!canProceed}
                  className="flex items-center gap-2 bg-brand-yellow text-zinc-950 font-black text-xs uppercase tracking-widest px-6 py-3 min-h-[44px] rounded-xl hover:bg-amber-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" /> Solicitar orçamento
                </button>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT — Preview (desktop only) */}
        <div className="hidden lg:flex flex-1 flex-col">
          <div className="sticky top-20 overflow-y-auto" style={{ maxHeight: "calc(100vh - 5rem)" }}>
            <div className="p-10 flex flex-col gap-5">
              {Preview}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
