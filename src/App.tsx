import React from "react";
import { AppProvider, useAppContext } from "./context/AppContext";
import Header from "./components/Header";
import Hero from "./components/Hero";
import SimuladorOrcamento from "./components/SimuladorOrcamento";
import Diferenciais from "./components/Diferenciais";
import ContainersGrid from "./components/ContainersGrid";
import ProntaEntrega from "./components/ProntaEntrega";
import Projetos from "./components/Projetos";
import GaleriaProjetos from "./components/GaleriaProjetos";
import CalculadoraEconomia from "./components/CalculadoraEconomia";
import VideosReais from "./components/VideosReais";
import ComoFunciona from "./components/ComoFunciona";
import MapaAtendimento from "./components/MapaAtendimento";
import Sobre from "./components/Sobre";
import FAQInteligente from "./components/FAQInteligente";
import Depoimentos from "./components/Depoimentos";
import CTA from "./components/CTA";
import CanaisAtendimento from "./components/CanaisAtendimento";
import WhatsAppButton from "./components/WhatsAppButton";
import Footer from "./components/Footer";
import AdminPanel from "./components/AdminPanel";

function AppContent() {
  const { 
    isAdminViewActive, 
    setAdminViewActive,
    sectionsOrder, 
    sectionsVisibility, 
    isPagePreviewMode, 
    setPagePreviewMode,
    logoSettings
  } = useAppContext();

  const isFullPreview = window.location.pathname === "/admin/preview" || window.location.hash === "#/admin/preview" || window.location.hash === "/admin/preview";

  // Dynamic Browser Favicon sync
  React.useEffect(() => {
    if (logoSettings && logoSettings.faviconUrl) {
      let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      const cachedBustedUrl = logoSettings.faviconUrl.startsWith("data:") 
        ? logoSettings.faviconUrl 
        : `${logoSettings.faviconUrl}?v=${Date.now()}`;
      link.href = cachedBustedUrl;
    }
  }, [logoSettings]);

  // Synchronize context preview mode when visiting the full preview URL
  React.useEffect(() => {
    if (isFullPreview) {
      setPagePreviewMode(true);
    } else {
      if (!isAdminViewActive) {
        setPagePreviewMode(false);
      }
    }
  }, [isFullPreview, isAdminViewActive, setPagePreviewMode]);

  // Dictionary mapping section keys to their corresponding React Components
  const SECTION_COMPONENTS: Record<string, React.ReactNode> = {
    hero: <Hero key="hero" />,
    simulator: <SimuladorOrcamento key="simulator" />,
    differentials: <Diferenciais key="differentials" />,
    containers: <ContainersGrid key="containers" />,
    prontaEntrega: <ProntaEntrega key="prontaEntrega" />,
    projects: <Projetos key="projects" />,
    gallery: <GaleriaProjetos key="gallery" />,
    economyCalculator: <CalculadoraEconomia key="economyCalculator" />,
    videos: <VideosReais key="videos" />,
    timeline: <ComoFunciona key="timeline" />,
    map: <MapaAtendimento key="map" />,
    about: <Sobre key="about" />,
    faq: <FAQInteligente key="faq" />,
    testimonials: <Depoimentos key="testimonials" />,
    cta: <CTA key="cta" />,
    channels: <CanaisAtendimento key="channels" />
  };

  if (isFullPreview) {
    return (
      <div id="app-root" className="min-h-screen bg-stone-950 text-stone-200 antialiased overflow-x-hidden selection:bg-orange-600 selection:text-white font-sans">
        {/* Float preview controller bar */}
        <div className="sticky top-0 z-50 bg-[#FF6B00] text-white py-3 px-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 font-sans border-b border-black/10">
          <div className="flex items-center gap-2.5">
            <span className="animate-pulse w-2.5 h-2.5 bg-white rounded-full"></span>
            <span className="text-xs uppercase font-black tracking-widest leading-none">Modo de Visualização (Rascunho Ativo)</span>
            <span className="text-[10px] bg-black/20 text-white font-mono px-1.5 py-0.5 rounded">Rascunhos Não Salvos</span>
          </div>
          <div className="text-xs font-semibold text-white/90">
            Você está visualizando a landing page usando dados modificados não publicados (Rascunho).
          </div>
          <button
            onClick={() => {
              setAdminViewActive(true);
              setPagePreviewMode(false);
              window.location.hash = "";
              window.history.pushState({}, "", "/");
            }}
            className="px-4 py-2 bg-stone-950 text-white hover:bg-stone-900 border border-white/10 rounded-lg text-[11px] font-black uppercase tracking-wider transition-colors cursor-pointer"
          >
            Voltar ao Painel Admin
          </button>
        </div>

        <Header />

        <main className="relative z-10">
          {sectionsOrder.map((sectionKey) => {
            const isVisible = sectionsVisibility[sectionKey as keyof typeof sectionsVisibility] ?? true;
            if (!isVisible) return null;
            return SECTION_COMPONENTS[sectionKey] || null;
          })}
        </main>

        <WhatsAppButton />
        <Footer />
      </div>
    );
  }

  // If the admin user clicked the discrete footer link and logged in, show the Admin Dashboard
  if (isAdminViewActive) {
    return <AdminPanel />;
  }

  return (
    <div id="app-root" className="min-h-screen bg-stone-950 text-stone-200 antialiased overflow-x-hidden selection:bg-orange-600 selection:text-white">
      
      {/* Heavy Engineering Sticky Header */}
      <Header />

      {/* Main Sections Body - Dynamically ordered and visibility-toggled by Admin */}
      <main className="relative z-10">
        {sectionsOrder.map((sectionKey) => {
          const isVisible = sectionsVisibility[sectionKey as keyof typeof sectionsVisibility] ?? true;
          if (!isVisible) return null; // Drop rendering completely if marked hidden
          return SECTION_COMPONENTS[sectionKey] || null;
        })}
      </main>

      {/* Persistent floating Conversions Directory Hub */}
      <WhatsAppButton />

      {/* Corporate Structural Footer with credentials */}
      <Footer />

    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
