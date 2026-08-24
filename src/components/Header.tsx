import { useState, useEffect } from "react";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { APP_INFO } from "../data";
import { useAppContext } from "../context/AppContext";
import Logo from "./Logo";

export default function Header() {
  const { whatsapp: systemWhatsapp, logoSettings } = useAppContext();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleWhatsappClick = () => {
    const defaultMsg = encodeURIComponent("Olá! Estou no site da Dodisa Containers e gostaria de solicitar um orçamento comercial.");
    window.open(`https://wa.me/${systemWhatsapp.number}?text=${defaultMsg}`, "_blank");
  };

  const menuItems = [
    { label: "Início", href: "#inicio" },
    { label: "Containers", href: "#containers" },
    { label: "Projetos", href: "#projetos" },
    { label: "Sobre", href: "#sobre" },
    { label: "Contato", href: "#contato" },
  ];

  return (
    <header
      id="main-header"
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-brand-black/95 backdrop-blur-xl border-b border-zinc-800/60 py-2.5"
          : "bg-gradient-to-b from-brand-black/90 via-brand-black/40 to-transparent py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Logo Brand / Geometric Steel Theme */}
          <a href={logoSettings?.logoLink || "#inicio"} className="flex items-center gap-2.5 px-1 py-1 rounded group focus:outline-none focus:ring-1 focus:ring-brand-yellow">
            <Logo 
              size={38} 
              primaryColor="#FFFFFF" 
              accentColor="#FFD400" 
              className="transform group-hover:scale-105 transition-transform duration-300" 
            />
            {(!logoSettings || !logoSettings.logoUrl || logoSettings.logoUrl === "default") ? (
              <div className="flex flex-col">
                <span className="text-xl font-display font-black tracking-[0.15em] text-white uppercase leading-none mr-[-0.15em]">
                  DODISA
                </span>
                <span className="text-[9px] font-sans font-black text-brand-yellow uppercase tracking-[0.3em] leading-none mt-1 mr-[-0.3em]">
                  CONTAINERS
                </span>
              </div>
            ) : (
              <img 
                src={logoSettings.logoUrl} 
                alt={logoSettings.logoAlt || "Dodisa Logo"} 
                referrerPolicy="no-referrer"
                style={{ height: `${logoSettings.logoWidthMobile || 36}px` }}
                className="max-h-12 w-auto object-contain hidden max-md:block"
              />
            )}
            {logoSettings && logoSettings.logoUrl && logoSettings.logoUrl !== "default" && (
              <img 
                src={logoSettings.logoUrl} 
                alt={logoSettings.logoAlt || "Dodisa Logo"} 
                referrerPolicy="no-referrer"
                style={{ height: `${logoSettings.logoWidthDesktop || 42}px` }}
                className="max-h-14 w-auto object-contain md:block hidden"
              />
            )}
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            {menuItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-xs font-bold font-mono text-stone-300 hover:text-brand-yellow hover:translate-y-[-1px] transition-all duration-200 uppercase tracking-wider relative group"
              >
                {item.label}
                <span className="absolute bottom-[-4px] left-0 w-0 h-0.5 bg-brand-yellow transition-all duration-300 group-hover:w-full"></span>
              </a>
            ))}
          </nav>

          {/* Call to Action Trigger Button */}
          <div className="hidden md:block border-none">
            <button
              onClick={handleWhatsappClick}
              className="group bg-brand-yellow hover:bg-brand-orange text-brand-black text-xs font-black uppercase tracking-widest py-2.5 px-6 min-h-[44px] rounded-lg transition-colors flex items-center gap-2 cursor-pointer font-display"
            >
              Solicitar Orçamento
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform stroke-[2.5]" />
            </button>
          </div>

          {/* Mobile hamburger toggle */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 text-stone-400 hover:text-white hover:bg-brand-dark rounded-lg transition-colors border border-white/5"
              aria-label="Abrir menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer (sliding drop-down) */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-brand-black/95 backdrop-blur-2xl border-b border-white/5 py-6 px-4 animate-fade-in z-50">
          <div className="flex flex-col gap-4">
            {menuItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-bold text-stone-200 hover:text-brand-yellow py-2 border-b border-white/5 uppercase tracking-widest"
              >
                {item.label}
              </a>
            ))}
            <div className="pt-4">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleWhatsappClick();
                }}
                className="w-full bg-brand-yellow hover:bg-brand-orange text-brand-black font-black uppercase tracking-widest text-center py-4 min-h-[44px] rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                Solicitar Orçamento (WhatsApp)
                <ArrowUpRight className="w-5 h-5" />
              </button>
              <div className="text-center mt-4 text-xs font-semibold text-stone-500">
                Atendimento Rápido Comercial: {APP_INFO.phone}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
