import React, { useState, useEffect, useRef, lazy, Suspense } from "react";
import { ArrowRight, CheckCircle2, ShieldAlert, Award, Sparkles, Play, X, Zap, Cpu, Settings } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAppContext } from "../context/AppContext";

const ThreeContainerVisualizer = lazy(() => import("./ThreeContainerVisualizer"));

// Smooth real-time count-up component for premium metrics
function CountUp({ target, duration = 2000, suffix = "" }: { target: string; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isIntersecting) return;

    const end = parseInt(target.replace(/\D/g, ""), 10) || 0;
    if (end === 0) {
      setCount(0);
      return;
    }
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing out easeOutQuad
      const easedProgress = progress * (2 - progress);
      const currentCount = Math.floor(easedProgress * end);
      setCount(currentCount);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    requestAnimationFrame(animate);
  }, [target, duration, isIntersecting]);

  return <span ref={ref}>{isIntersecting ? count : 0}{suffix}</span>;
}

export default function Hero() {
  const { hero, whatsapp } = useAppContext();
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

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
    
    let normalized = titleStr.replace(/\\n/g, "\n");
    
    // Convert to uppercase alphanumeric-only to flexibly detect cached versions of the title phrase
    const cleanStr = normalized.replace(/[^A-Z]/gi, "").toUpperCase();
    if (!normalized.includes("\n") && (
      cleanStr.includes("CONTAINERSPRONTOPARASUAEMPRESAOBRAOUPROJETO") ||
      cleanStr.includes("CONTAINERSPRONTOSPARASUAEMPRESAOBRAOUPROJETO") || 
      cleanStr.includes("CONTAINERSPRONTOPARASUAEMPRESAOBRA") ||
      cleanStr.includes("CONTAINERSPRONTOSPARASUAEMPRESAOBRA") ||
      cleanStr.includes("SUAEMPRESAOBRAOUPROJETO") ||
      cleanStr.includes("ENGENHARIAEPRECISAO")
    )) {
      normalized = "CONTAINERS PRONTO PARA SUA EMPRESA,\nOBRA OU PROJETO.";
    }
    
    const lines = normalized.split("\n");
    
    return lines.map((line, lineIndex) => {
      const regex = /(EMPRESA,|EMPRESA|OBRA)/gi;
      const parts = line.split(regex);
      
      return (
        <span key={lineIndex} className="block last:mb-0">
          {parts.map((part, index) => {
            const lower = part.toLowerCase();
            if (lower === "empresa," || lower === "empresa") {
              return (
                <span key={index} className="text-brand-yellow relative inline-block pb-0.5 sm:pb-1">
                  {part}
                  <span className="absolute bottom-0 left-0 w-full h-[3px] bg-brand-orange rounded-full"></span>
                </span>
              );
            }
            if (lower === "obra") {
              return (
                <span key={index} className="text-brand-orange font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-yellow to-brand-orange">
                  {part}
                </span>
              );
            }
            return <span key={index}>{part}</span>;
          })}
        </span>
      );
    });
  };

  return (
    <section
      id="inicio"
      className="relative min-h-screen flex items-center justify-center bg-[#07090D] overflow-hidden pt-28 pb-16"
    >
      {/* Abstract Blueprint Grid Backdrop with lighting overlays */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        
        {/* Real-image blended beautifully behind mask */}
        <div className="absolute inset-0 opacity-15 mix-blend-overlay">
          <img
            src={hero.image}
            alt="Pátio Industrial de Containers Dodisa"
            className="w-full h-full object-cover object-center scale-110 transition-transform duration-[20s]"
            style={{ filter: "grayscale(100%) contrast(150%) blur(1px)" }}
            loading="eager"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Blueprint mesh structure */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:32px_32px] opacity-70" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0c_4px,transparent_4px),linear-gradient(to_bottom,#ffffff0c_4px,transparent_4px)] bg-[size:160px_160px] opacity-40" />

        {/* Dynamic Studio Spotlights */}
        <div className="absolute top-[-10%] left-[20%] w-[50vw] h-[50vw] rounded-full bg-brand-yellow/5 blur-[120px] animate-pulse" style={{ animationDuration: "12s" }} />
        <div className="absolute bottom-[-10%] right-[10%] w-[40vw] h-[40vw] rounded-full bg-brand-orange/5 blur-[140px] animate-pulse" style={{ animationDuration: "8s" }} />
        
        {/* Absolute Industrial Dust Particle floatings */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(11,15,20,0)_0%,#06080b_85%)] z-1" />
      </div>

      {/* Extreme Premium Accent: Industrial Safety Warning Strip Ribbon */}
      <div className="absolute top-0 left-0 w-full h-[5px] z-20 overflow-hidden flex">
        <div className="warning-strip w-full h-full opacity-90 brightness-[0.85] contrast-[1.1]" />
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
              className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-lg bg-brand-yellow/10 border border-brand-yellow/20 text-brand-yellow text-[10px] font-black uppercase tracking-wider font-mono shadow-md shadow-brand-yellow/5"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-yellow opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-yellow"></span>
              </span>
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
                className="group relative px-8 py-4 bg-brand-yellow hover:bg-brand-orange text-brand-black font-black text-xs uppercase tracking-widest rounded-xl transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer shadow-lg shadow-brand-yellow/10 font-display ring-1 ring-brand-yellow hover:ring-brand-orange"
              >
                {hero.primaryBtnText}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform stroke-[3]" />
              </button>

              <button
                onClick={handleScrollToProjects}
                className="px-8 py-4 bg-[#111827]/75 hover:bg-[#1f293d] text-white hover:text-brand-yellow font-bold text-xs uppercase tracking-widest rounded-xl border border-white/5 hover:border-brand-yellow/30 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer font-mono"
              >
                {hero.secondaryBtnText}
              </button>

              {hero.videoUrl && (
                <button
                  onClick={() => setIsVideoModalOpen(true)}
                  className="px-5 py-4 bg-white/5 hover:bg-white/10 text-stone-300 hover:text-white font-black text-[10px] uppercase tracking-widest rounded-xl border border-white/5 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer font-mono"
                >
                  <Play className="w-3.5 h-3.5 fill-current text-brand-yellow" />
                  Assistir Tour
                </button>
              )}
            </motion.div>

            {/* Regulatory and Authority stamp highlights */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-stone-400 text-[10px] font-bold tracking-wider font-mono uppercase"
            >
              <div className="flex items-center gap-2 bg-[#111827]/40 p-2.5 rounded-lg border border-white/5">
                <CheckCircle2 className="w-4 h-4 text-brand-yellow flex-shrink-0" />
                <span>Normas NR-18 e NR-24</span>
              </div>
              <div className="flex items-center gap-2 bg-[#111827]/40 p-2.5 rounded-lg border border-white/5">
                <CheckCircle2 className="w-4 h-4 text-brand-yellow flex-shrink-0" />
                <span>Laudo Descontaminação</span>
              </div>
              <div className="flex items-center gap-2 bg-[#111827]/40 p-2.5 rounded-lg border border-white/5">
                <CheckCircle2 className="w-4 h-4 text-brand-yellow flex-shrink-0" />
                <span>Frota Munck Própria</span>
              </div>
            </motion.div>

          </div>

          {/* Column 2: Cinematographic 3D Container Scene + Performance Stats Card */}
          <div className="lg:col-span-6 flex flex-col space-y-8 relative">
            
            {/* Realist Cinematic Container Viewport - Floating Transparent 3D Container with no square border */}
            <div className="relative w-full h-[320px] sm:h-[450px] flex items-center justify-center overflow-hidden">
              <div className="w-full h-full relative">
                <Suspense fallback={<div className="w-full h-full bg-stone-900 animate-pulse rounded-lg" />}>
                  <ThreeContainerVisualizer />
                </Suspense>
              </div>
            </div>

            {/* Metrics and Interactive Performance Bento Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative p-6 px-6 sm:p-7 rounded-2xl bg-[#111827]/40 backdrop-blur-xl border border-white/5 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-yellow/5 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-brand-orange/5 rounded-full blur-xl pointer-events-none" />

              {/* Decorative Corner Locks representing Container Corner Casts */}
              <div className="absolute top-0 left-0 w-5 h-1 bg-brand-yellow/50" />
              <div className="absolute top-0 left-0 w-1 h-5 bg-brand-yellow/50" />
              <div className="absolute top-0 right-0 w-5 h-1 bg-brand-yellow/50" />
              <div className="absolute top-0 right-0 w-1 h-5 bg-brand-yellow/50" />
              <div className="absolute bottom-0 left-0 w-5 h-1 bg-brand-yellow/50" />
              <div className="absolute bottom-0 left-0 w-1 h-5 bg-brand-yellow/50" />
              <div className="absolute bottom-0 right-0 w-5 h-1 bg-brand-yellow/50" />
              <div className="absolute bottom-0 right-0 w-1 h-5 bg-brand-yellow/50" />

              <h3 className="text-xs font-black text-stone-200 uppercase tracking-widest border-b border-white/5 pb-3 mb-6 flex items-center justify-between font-mono">
                <span className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-brand-yellow" />
                  Métricas Industriais & Reputação
                </span>
                <span className="text-[10px] text-brand-yellow">PÁTIO DODISA</span>
              </h3>

              <div className="grid grid-cols-3 gap-3 sm:gap-6">
                
                {/* Metric Item 1 */}
                <div className="flex flex-col items-start gap-1 p-3.5 rounded-xl bg-[#0B0F14]/60 border border-white/5 group hover:border-brand-yellow/15 transition-all duration-300">
                  <span className="text-brand-yellow text-[10px] font-bold font-mono tracking-widest uppercase">PROJETOS</span>
                  <div className="text-2xl sm:text-3xl font-black text-white leading-none font-display flex items-baseline">
                    <CountUp target="1850" suffix="+" />
                  </div>
                  <span className="text-[9px] font-semibold text-stone-400 mt-1 uppercase tracking-wider leading-snug">
                    Módulos Entregues
                  </span>
                </div>

                {/* Metric Item 2 */}
                <div className="flex flex-col items-start gap-1 p-3.5 rounded-xl bg-[#0B0F14]/60 border border-white/5 group hover:border-brand-yellow/15 transition-all duration-300">
                  <span className="text-brand-yellow text-[10px] font-bold font-mono tracking-widest uppercase">CLIENTES</span>
                  <div className="text-2xl sm:text-3xl font-black text-white leading-none font-display flex items-baseline">
                    <CountUp target="940" suffix="+" />
                  </div>
                  <span className="text-[9px] font-semibold text-stone-400 mt-1 uppercase tracking-wider leading-snug">
                    Empresas Atendidas
                  </span>
                </div>

                {/* Metric Item 3 */}
                <div className="flex flex-col items-start gap-1 p-3.5 rounded-xl bg-[#0B0F14]/60 border border-white/5 group hover:border-brand-yellow/15 transition-all duration-300">
                  <span className="text-brand-orange text-[10px] font-bold font-mono tracking-widest uppercase">EXPERIÊNCIA</span>
                  <div className="text-2xl sm:text-3xl font-black text-white leading-none font-display flex items-baseline">
                    <CountUp target="15" suffix="" />
                    <span className="text-sm font-sans font-light text-stone-400 ml-1">Anos</span>
                  </div>
                  <span className="text-[9px] font-semibold text-stone-400 mt-1 uppercase tracking-wider leading-snug">
                    Força & Engenharia
                  </span>
                </div>

              </div>

              {/* Safety banner inside stats */}
              <div className="mt-5 p-3 rounded-lg bg-white/[0.02] border border-white/5 flex items-center gap-3">
                <ShieldAlert className="w-5 h-5 text-brand-orange flex-shrink-0 animate-pulse" />
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
                  <Play className="w-3.5 h-3.5 fill-current text-brand-yellow animate-ping" />
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
  );
}
