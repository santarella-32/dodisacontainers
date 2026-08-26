import React, { useState, useEffect, useRef, lazy, Suspense } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, CheckCircle2, ShieldAlert, Award, Sparkles, Play, X, Zap, Cpu, Settings, MapPin, Tag, MessageCircle, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAppContext } from "../context/AppContext";
import type { ProntaEntregaItem } from "../context/AppContext";

const ThreeContainerVisualizer = lazy(() => import("./ThreeContainerVisualizer"));

// Count-down-to-lock: starts high, rapidly drops, snaps into final value (easeOutQuart)
// Drives all three Hero metrics (Projetos/Clientes/Experiência) from ONE shared rAF loop
// and ONE IntersectionObserver, instead of three independent loops each triggering its
// own setState every frame. This halves render overhead during the animation and — more
// importantly — the start is deferred one tick past mount so it doesn't fight the heavy
// synchronous Three.js scene/texture setup (ThreeContainerVisualizer) for the same frame
// budget, which is what was causing the stutter/freeze-then-jump look.
function useHeroMetricsCountUp(
  targets: readonly [number, number, number],
  starts: readonly [number, number, number],
  duration = 3800
) {
  const [values, setValues] = useState<[number, number, number]>(starts as [number, number, number]);
  const cardRef = useRef<HTMLDivElement>(null);
  const [triggered, setTriggered] = useState(false);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setTriggered(true); },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!triggered) return;
    let cancelled = false;
    let idleId: number | undefined;
    let timeoutId: number | undefined;

    const run = () => {
      if (cancelled) return;
      const t0 = performance.now();
      // Numbers don't need 60fps precision — the eye can't tell a counter apart from
      // one updating ~15x/sec, but each React setState here competes with the Three.js
      // visualizer's own render loop for the same frame budget. Throttling the *state
      // updates* (not the underlying elapsed-time math, which stays frame-accurate)
      // cuts that contention for the animation's whole duration, not just its start.
      let lastUpdate = 0;
      const minInterval = 65;
      const tick = (now: number) => {
        const t = Math.min((now - t0) / duration, 1);
        const isDone = t >= 1;
        if (isDone || now - lastUpdate >= minInterval) {
          lastUpdate = now;
          const eased = 1 - Math.pow(1 - t, 4); // easeOutQuart → hard lock at end
          setValues(targets.map((end, i) => Math.round(starts[i] - (starts[i] - end) * eased)) as [number, number, number]);
        }
        if (!isDone) {
          rafRef.current = requestAnimationFrame(tick);
        }
      };
      rafRef.current = requestAnimationFrame(tick);
    };

    // Give the browser one short beat to clear any pending heavy work (e.g. the Three.js
    // scene mount) before kicking off the animation. This used to wait up to 600ms — long
    // enough that the numbers just sat motionless at their start value, which itself reads
    // as "frozen" if a user's eye lands on the card during that window. Now that the 3D
    // visualizer's mount and per-frame cost are both much lighter (see
    // ThreeContainerVisualizer.tsx), a much shorter yield is enough to avoid contention
    // while no longer looking stuck.
    const w = window as typeof window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout?: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    if (typeof w.requestIdleCallback === "function") {
      idleId = w.requestIdleCallback(run, { timeout: 120 });
    } else {
      timeoutId = window.setTimeout(run, 50);
    }

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
      if (idleId !== undefined) w.cancelIdleCallback?.(idleId);
      if (timeoutId !== undefined) clearTimeout(timeoutId);
    };
    // targets/starts are static per call site — only triggered/duration matter
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggered, duration]);

  return { values, cardRef };
}

function StockModal({ items, whatsappNumber, onClose }: { items: ProntaEntregaItem[]; whatsappNumber: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose]);

  const handleWhatsapp = (item: ProntaEntregaItem) => {
    const msg = encodeURIComponent(`Olá! Tenho interesse no ${item.title} (${item.type}) localizado em ${item.city}/${item.state}. Gostaria de mais informações.`);
    window.open(`https://wa.me/${whatsappNumber}?text=${msg}`, "_blank");
  };

  const active = items.filter((i) => i.active);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div className="absolute inset-0 bg-brand-black/90 backdrop-blur-xl" />

        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="relative w-full max-w-6xl max-h-[90vh] flex flex-col bg-[#0B0F14] border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800 flex-shrink-0">
            <div>
              <h2 className="text-white font-black text-lg uppercase tracking-widest font-display">ESTOQUE DISPONÍVEL</h2>
              <p className="text-zinc-500 text-[10px] font-mono mt-0.5">{active.length} unidade{active.length !== 1 ? "s" : ""} · Pronta Entrega</p>
            </div>
            <button onClick={onClose} className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Grid */}
          <div className="overflow-y-auto flex-1 p-6">
            {active.length === 0 ? (
              <div className="text-center py-20 text-zinc-600 font-mono text-sm">Nenhum item em estoque no momento.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {active.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.06 }}
                    className="group flex flex-col rounded-xl overflow-hidden border border-zinc-800 hover:border-brand-yellow/40 transition-all bg-zinc-900/40"
                  >
                    {/* Image */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-zinc-900">
                      {item.images?.[0] ? (
                        <img
                          src={item.images[0]}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-700 text-xs font-mono">Sem imagem</div>
                      )}
                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                        {item.availableForSale && (
                          <span className="px-2 py-0.5 rounded-full bg-brand-yellow text-brand-black text-[9px] font-black uppercase tracking-widest">Venda</span>
                        )}
                        {item.availableForRent && (
                          <span className="px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-white text-[9px] font-black uppercase tracking-widest">Locação</span>
                        )}
                      </div>
                      <div className="absolute top-3 right-3">
                        <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-zinc-300 text-[9px] font-mono">{item.condition}</span>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-4 flex flex-col gap-3 flex-1">
                      <div>
                        <span className="text-[9px] font-black font-mono text-brand-yellow uppercase tracking-widest">{item.type}</span>
                        <h3 className="text-white font-black text-sm leading-tight mt-1">{item.title}</h3>
                      </div>
                      <div className="flex flex-col gap-1.5 text-[10px] font-mono text-zinc-500">
                        <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3 flex-shrink-0" />{item.city}, {item.state}</span>
                        <span className="flex items-center gap-1.5"><Tag className="w-3 h-3 flex-shrink-0" />{item.measurements}</span>
                      </div>
                      <button
                        onClick={() => handleWhatsapp(item)}
                        className="mt-auto w-full py-2.5 rounded-lg bg-brand-yellow hover:bg-brand-orange text-brand-black font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-colors cursor-pointer"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        Consultar
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Footer CTA */}
          <div className="flex-shrink-0 px-6 py-4 border-t border-zinc-800 bg-zinc-950/60 flex items-center justify-between gap-4">
            <p className="text-zinc-500 text-[10px] font-mono">Não encontrou o que precisa? Fabricamos sob medida.</p>
            <button
              onClick={() => { const msg = encodeURIComponent("Olá! Gostaria de solicitar um container sob medida."); window.open(`https://wa.me/${whatsappNumber}?text=${msg}`, "_blank"); }}
              className="flex-shrink-0 px-5 py-2.5 rounded-lg bg-zinc-900 border border-zinc-700 hover:border-brand-yellow text-white hover:text-brand-yellow font-black text-[10px] uppercase tracking-widest transition-colors cursor-pointer"
            >
              Pedir Sob Medida
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function Hero() {
  const { hero, whatsapp, prontaEntrega } = useAppContext();
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const { values: metricValues, cardRef: metricsCardRef } = useHeroMetricsCountUp([65, 27, 3], [2340, 200, 200]);
  const [projetosCount, clientesCount, experienciaCount] = metricValues;

  // Auto-helper to detect if the URL is direct MP4 or from YouTube
  const isDirectVideo = (url: string) => {
    if (!url) return false;
    const lower = url.toLowerCase();
    return lower.endsWith(".mp4") || lower.endsWith(".webm") || lower.endsWith(".mov") || lower.includes("/mov_");
  };

  const getEmbedUrl = (url: string) => {
    if (!url) return "";
    if (url.includes("youtube.com/embed/") || url.includes("player.vimeo.com")) {
      return url;
    }
    // Convert YouTube regular link to embed link
    let regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    let match = url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}?autoplay=1&rel=0`;
    }
    return url;
  };

  const handleBudgetClick = () => {
    if (hero.primaryBtnUrl && hero.primaryBtnUrl.startsWith("#")) {
      const target = document.querySelector(hero.primaryBtnUrl);
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
        return;
      }
    }
    const msg = encodeURIComponent("Olá! Quero solicitar um orçamento imediato para containers.");
    window.open(`https://wa.me/${whatsapp.number}?text=${msg}`, "_blank");
  };

  const handleScrollToProjects = (e: React.MouseEvent) => {
    e.preventDefault();
    if (hero.secondaryBtnUrl && hero.secondaryBtnUrl.startsWith("#")) {
      const target = document.querySelector(hero.secondaryBtnUrl);
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
        return;
      }
    }
    const target = document.querySelector("#projetos");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  const formatTitle = (titleStr: string) => {
    if (!titleStr) return "";
    let t = titleStr.replace(/\\n/g, "\n");
    // Normalize any old title variant to the current one
    const clean = t.replace(/\s/g, "").toUpperCase();
    if (!clean.includes("ASOLUCAOMAISRAPIDA")) {
      t = "A Solução Mais Rápida e Segura em Containers para sua Empresa ou Obra.";
    }
    const regex = /(Empresa|Obra)/g;
    const parts = t.split(regex);
    return (
      <span>
        {parts.map((part, i) => {
          if (part === "Empresa" || part === "Obra") {
            return (
              <span key={i} className="text-brand-yellow relative inline-block pb-0.5 sm:pb-1">
                {part}
                <span className="absolute bottom-0 left-0 w-full h-[3px] bg-brand-orange rounded-full" />
              </span>
            );
          }
          return <span key={i}>{part}</span>;
        })}
      </span>
    );
  };

  return (
    <>
    <section
      id="inicio"
      className="relative min-h-screen flex items-center justify-center bg-[#07090D] overflow-hidden pt-28 pb-16"
    >
      {/* Background photo, dimmed */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-40">
          <img
            src={hero.image}
            alt="Pátio Industrial de Containers Dodisa"
            className="w-full h-full object-cover object-center brightness-110"
            loading="eager"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="absolute inset-0 bg-[#07090D]/65" />
      </div>

      {/* Main Structural Grid Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 lg:gap-16 items-center">
          
          {/* Column 1: Typography + Headline Actions */}
          <div className="lg:col-span-6 flex flex-col items-start text-left space-y-6 sm:space-y-8">
            
            {/* Live Indicator: Heavy Industrial Engineering Hub */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-lg bg-brand-yellow/10 border border-brand-yellow/20 text-brand-yellow text-[10px] font-black uppercase tracking-wider font-mono"
            >
              <Cpu className="w-3.5 h-3.5 text-brand-yellow" />
              SOLUÇÕES MODULARES DE ALTÍSSIMO PADRÃO
            </motion.div>

            {/* Title Block with premium display font */}
            <div className="space-y-4">
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="text-3xl min-[360px]:text-4xl min-[480px]:text-5xl lg:text-5xl xl:text-6xl font-black tracking-tighter text-white leading-[1.05] uppercase font-display"
              >
                {formatTitle(hero.title)}
              </motion.h1>

              {/* Subtext with descriptive structural focus */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="text-sm sm:text-base text-stone-300 max-w-xl leading-relaxed font-sans font-light"
              >
                {hero.subtitle}
              </motion.p>
            </div>

            {/* Custom CTA Actions Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto pt-2"
            >
              <button
                onClick={handleBudgetClick}
                className="group w-full sm:w-auto px-8 py-4 min-h-[44px] bg-brand-yellow hover:bg-brand-orange text-brand-black font-black text-xs uppercase tracking-widest rounded-lg transition-colors flex items-center justify-center gap-3 cursor-pointer font-display"
              >
                {hero.primaryBtnText}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform stroke-[3]" />
              </button>

              <div className="relative w-full sm:w-auto">
                <span className="absolute inset-0 rounded-lg border border-white/40 animate-ping opacity-50 pointer-events-none" />
                <button
                  onClick={() => setIsStockModalOpen(true)}
                  className="relative w-full px-8 py-4 min-h-[44px] bg-transparent border border-white/40 text-white hover:border-brand-yellow hover:text-brand-yellow hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 font-bold text-xs uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer font-mono"
                >
                  {hero.secondaryBtnText}
                </button>
              </div>

              {hero.videoUrl && (
                <button
                  onClick={() => setIsVideoModalOpen(true)}
                  className="w-full sm:w-auto px-5 py-4 min-h-[44px] bg-transparent border border-white/30 text-white/80 hover:border-white hover:text-white hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 font-black text-[10px] uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer font-mono"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Assistir Tour
                </button>
              )}
            </motion.div>

            {/* Regulatory and Authority stamp highlights */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="flex flex-row gap-2 pt-4 text-white text-[9px] font-bold tracking-wide font-mono uppercase flex-wrap"
            >
              <a href="#faq-inteligente" className="flex items-center gap-1.5 bg-[#111827]/70 px-2.5 py-2 rounded-lg border border-white/20 hover:border-brand-yellow/50 transition-colors cursor-pointer flex-shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-yellow flex-shrink-0 drop-shadow-[0_0_8px_rgba(255,212,0,0.9)]" />
                <span>NR-18 e NR-24</span>
              </a>
              <a href="#faq-inteligente" className="flex items-center gap-1.5 bg-[#111827]/70 px-2.5 py-2 rounded-lg border border-white/20 hover:border-brand-yellow/50 transition-colors cursor-pointer flex-shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-yellow flex-shrink-0 drop-shadow-[0_0_8px_rgba(255,212,0,0.9)]" />
                <span>Laudo Descontaminação</span>
              </a>
              <a href="#faq-inteligente" className="flex items-center gap-1.5 bg-[#111827]/70 px-2.5 py-2 rounded-lg border border-white/20 hover:border-brand-yellow/50 transition-colors cursor-pointer flex-shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-yellow flex-shrink-0 drop-shadow-[0_0_8px_rgba(255,212,0,0.9)]" />
                <span>Frota Munck Própria</span>
              </a>
            </motion.div>

          </div>

          {/* Column 2: Cinematographic 3D Container Scene + Performance Stats Card */}
          <div className="lg:col-span-6 flex flex-col space-y-8 relative">
            
            {/* Realist Cinematic Container Viewport - Floating Transparent 3D Container with no square border */}
            <div className="relative w-full h-[260px] sm:h-[450px] flex items-center justify-center overflow-hidden">
              <div className="w-full h-full relative">
                <Suspense fallback={<div className="w-full h-full bg-stone-900 animate-pulse rounded-lg" />}>
                  <ThreeContainerVisualizer />
                </Suspense>
              </div>
            </div>

            {/* Metrics and Interactive Performance Bento Panel */}
            <motion.div
              ref={metricsCardRef}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative p-6 px-6 sm:p-7 rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden"
            >
              <h3 className="text-xs font-black text-stone-200 uppercase tracking-widest border-b border-white/5 pb-3 mb-6 flex items-center justify-between font-mono">
                <span className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-brand-yellow" />
                  Métricas Industriais & Reputação
                </span>
                <span className="text-[10px] text-brand-yellow">PÁTIO DODISA</span>
              </h3>

              <div className="grid grid-cols-3 gap-3 sm:gap-6">

                {/* Metric Item 1 */}
                <div className="flex flex-col items-start gap-1 p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800 hover:border-zinc-700 transition-colors">
                  <span className="text-brand-yellow text-[10px] font-bold font-mono tracking-widest uppercase">PROJETOS</span>
                  <div className="text-2xl sm:text-3xl font-black text-white leading-none font-display flex items-baseline">
                    <span className="tabular-nums">{projetosCount}+</span>
                  </div>
                  <span className="text-[9px] font-semibold text-stone-400 mt-1 uppercase tracking-wider leading-snug">
                    Módulos Entregues
                  </span>
                </div>

                {/* Metric Item 2 */}
                <div className="flex flex-col items-start gap-1 p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800 hover:border-zinc-700 transition-colors">
                  <span className="text-brand-yellow text-[10px] font-bold font-mono tracking-widest uppercase">CLIENTES</span>
                  <div className="text-2xl sm:text-3xl font-black text-white leading-none font-display flex items-baseline">
                    <span className="tabular-nums">{clientesCount}+</span>
                  </div>
                  <span className="text-[9px] font-semibold text-stone-400 mt-1 uppercase tracking-wider leading-snug">
                    Empresas Atendidas
                  </span>
                </div>

                {/* Metric Item 3 */}
                <div className="flex flex-col items-start gap-1 p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800 hover:border-zinc-700 transition-colors">
                  <span className="text-brand-orange text-[10px] font-bold font-mono tracking-widest uppercase">EXPERIÊNCIA</span>
                  <div className="text-2xl sm:text-3xl font-black text-white leading-none font-display flex items-baseline">
                    <span className="tabular-nums">{experienciaCount}</span>
                    <span className="text-sm font-sans font-light text-stone-400 ml-1">Anos</span>
                  </div>
                  <span className="text-[9px] font-semibold text-stone-400 mt-1 uppercase tracking-wider leading-snug">
                    Força & Engenharia
                  </span>
                </div>

              </div>

              {/* Safety banner inside stats */}
              <div className="mt-5 p-3 rounded-lg bg-white/[0.02] border border-white/5 flex items-center gap-3">
                <ShieldAlert className="w-5 h-5 text-brand-orange flex-shrink-0" />
                <p className="text-[10px] text-stone-300 leading-normal font-sans font-medium">
                  Testado e aprovado por engenheiro responsável.
                </p>
              </div>

            </motion.div>

          </div>

        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-brand-black to-transparent pointer-events-none z-10" />

      {/* CINEMATIC LIGHTBOX VIDEO OVERLAY */}
      <AnimatePresence>
        {isVideoModalOpen && hero.videoUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-md z-[9999] flex items-center justify-center p-4 sm:p-6"
            onClick={() => setIsVideoModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative bg-[#111827] border border-white/10 w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl text-left"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header Bar */}
              <div className="bg-[#0B0F14] px-5 py-4 border-b border-white/5 flex items-center justify-between text-white">
                <div className="font-mono font-bold uppercase tracking-wider text-xs flex items-center gap-2">
                  <Play className="w-3.5 h-3.5 fill-current text-brand-yellow" />
                  <span className="text-stone-300">Tour Virtual & Linha de Produção Dodisa</span>
                </div>
                <button
                  onClick={() => setIsVideoModalOpen(false)}
                  className="p-1 px-1.5 rounded-lg bg-white/5 text-stone-400 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Video Frame */}
              <div className="aspect-video w-full bg-black relative">
                {isDirectVideo(hero.videoUrl) ? (
                  <video
                    src={hero.videoUrl}
                    controls
                    autoPlay
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <iframe
                    src={getEmbedUrl(hero.videoUrl)}
                    title="Vídeo Institucional Dodisa"
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                )}
              </div>

              {/* Detail Footer */}
              <div className="p-4 sm:p-5 bg-[#0B0F14] text-stone-400 text-xs text-center font-sans tracking-wide">
                Pátio Industrial Santa Rosa - RS.
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </section>

      {isStockModalOpen && createPortal(
        <StockModal
          items={prontaEntrega || []}
          whatsappNumber={whatsapp.number}
          onClose={() => setIsStockModalOpen(false)}
        />,
        document.body
      )}
    </>
  );
}
