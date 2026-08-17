import React, { Suspense, lazy, Component } from "react";
import { AppProvider, useAppContext } from "./context/AppContext";

class AdminErrorBoundary extends Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center gap-4 text-center px-6">
          <p className="text-red-400 font-mono text-sm font-bold">Erro ao carregar painel</p>
          <pre className="text-red-300 text-xs bg-red-950/40 border border-red-500/20 rounded-xl p-4 max-w-xl w-full text-left overflow-auto whitespace-pre-wrap">
            {this.state.error.message}
            {"\n"}
            {this.state.error.stack}
          </pre>
          <button
            onClick={() => { this.setState({ error: null }); window.location.reload(); }}
            className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer"
          >
            Tentar novamente
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
import Header from "./components/Header";
import Hero from "./components/Hero";
import WhatsAppButton from "./components/WhatsAppButton";

// Tudo abaixo do fold carrega sob demanda — reduz o bundle inicial de 381KB para ~120KB
const SimuladorOrcamento = lazy(() => import("./components/SimuladorOrcamento"));
const Diferenciais = lazy(() => import("./components/Diferenciais"));
const ContainersGrid = lazy(() => import("./components/ContainersGrid"));
const ProntaEntrega = lazy(() => import("./components/ProntaEntrega"));
const Projetos = lazy(() => import("./components/Projetos"));
const ComoFunciona = lazy(() => import("./components/ComoFunciona"));
const Sobre = lazy(() => import("./components/Sobre"));
const Depoimentos = lazy(() => import("./components/Depoimentos"));
const CTA = lazy(() => import("./components/CTA"));
const CanaisAtendimento = lazy(() => import("./components/CanaisAtendimento"));
const Footer = lazy(() => import("./components/Footer"));
const OrcamentoPopup = lazy(() => import("./components/OrcamentoPopup"));
const OrcamentoPage = lazy(() => import("./components/OrcamentoPage"));
const AdminPanel = lazy(() => import("./components/AdminPanel"));
const GaleriaProjetos = lazy(() => import("./components/GaleriaProjetos"));
const CalculadoraEconomia = lazy(() => import("./components/CalculadoraEconomia"));
const VideosReais = lazy(() => import("./components/VideosReais"));
const MapaAtendimento = lazy(() => import("./components/MapaAtendimento"));
const FAQInteligente = lazy(() => import("./components/FAQInteligente"));
const CarrosselGaleria = lazy(() => import("./components/CarrosselGaleria"));

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
  const isOrcamentoPage = window.location.pathname === "/orcamento";

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

  const LazySection = ({ children }: { children: React.ReactNode }) => (
    <Suspense fallback={<div className="py-16" />}>{children}</Suspense>
  );

  // Dictionary mapping section keys to their corresponding React Components
  // Hero is eager (above the fold). Everything else loads lazily on scroll.
  const SECTION_COMPONENTS: Record<string, React.ReactNode> = {
    hero: <Hero key="hero" />,
    simulator: <LazySection key="simulator"><SimuladorOrcamento /></LazySection>,
    differentials: <LazySection key="differentials"><Diferenciais /></LazySection>,
    containers: <LazySection key="containers"><ContainersGrid /></LazySection>,
    prontaEntrega: <LazySection key="prontaEntrega"><ProntaEntrega /></LazySection>,
    projects: <LazySection key="projects"><Projetos /></LazySection>,
    carrosselGaleria: <LazySection key="carrosselGaleria"><CarrosselGaleria /></LazySection>,
    gallery: <LazySection key="gallery"><GaleriaProjetos /></LazySection>,
    economyCalculator: <LazySection key="economyCalculator"><CalculadoraEconomia /></LazySection>,
    videos: <LazySection key="videos"><VideosReais /></LazySection>,
    timeline: <LazySection key="timeline"><ComoFunciona /></LazySection>,
    map: <LazySection key="map"><MapaAtendimento /></LazySection>,
    about: <LazySection key="about"><Sobre /></LazySection>,
    faq: <LazySection key="faq"><FAQInteligente /></LazySection>,
    testimonials: <LazySection key="testimonials"><Depoimentos /></LazySection>,
    cta: <LazySection key="cta"><CTA /></LazySection>,
    channels: <LazySection key="channels"><CanaisAtendimento /></LazySection>,
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
        <Suspense fallback={null}><Footer /></Suspense>
      </div>
    );
  }

  if (isOrcamentoPage) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-[#07090D]" />}>
        <OrcamentoPage />
      </Suspense>
    );
  }

  // If the admin user clicked the discrete footer link and logged in, show the Admin Dashboard
  if (isAdminViewActive) {
    return (
      <AdminErrorBoundary>
        <Suspense fallback={<div className="min-h-screen bg-stone-950 flex items-center justify-center text-stone-400">Carregando painel...</div>}>
          <AdminPanel />
        </Suspense>
      </AdminErrorBoundary>
    );
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
      <Suspense fallback={null}><Footer /></Suspense>

      {/* Scroll-triggered quote popup */}
      <Suspense fallback={null}><OrcamentoPopup /></Suspense>

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
