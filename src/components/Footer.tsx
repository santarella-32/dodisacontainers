import { Phone, Mail, MapPin, Clock, Instagram, Linkedin, Facebook, MessageSquare, ShieldCheck, Award } from "lucide-react";
import { APP_INFO } from "../data";
import { useAppContext } from "../context/AppContext";
import Logo from "./Logo";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { setAdminViewActive, whatsapp, logoSettings } = useAppContext();

  const handleWhatsappClick = () => {
    const msg = encodeURIComponent("Olá! Estou no site da Dodisa e gostaria de conversar com o departamento de atendimento comercial.");
    window.open(`https://wa.me/${whatsapp.number}?text=${msg}`, "_blank");
  };

  return (
    <footer id="contato" className="relative bg-[#07090D] text-stone-400 border-t border-white/5 pt-20 pb-10 overflow-hidden z-20">
      
      {/* Decorative premium yellow steel bar at the top */}
      <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-brand-yellow via-brand-orange to-brand-yellow" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 lg:gap-12">
          
          {/* Column 1: Brand & Slogan */}
          <div className="flex flex-col gap-4">
            <a href={logoSettings?.logoLink || "#inicio"} className="flex items-center gap-2.5 group focus:outline-none">
              <Logo 
                size={38} 
                primaryColor="#FFFFFF" 
                accentColor="#FFD400" 
                className="transform group-hover:scale-105 transition-transform duration-300" 
              />
              {(!logoSettings || !logoSettings.logoUrl || logoSettings.logoUrl === "default") && (
                <div className="flex flex-col">
                  <span className="text-xl font-display font-black tracking-[0.15em] text-white uppercase leading-none mr-[-0.15em]">
                    DODISA
                  </span>
                  <span className="text-[9px] font-sans font-black text-brand-yellow uppercase tracking-[0.3em] leading-none mt-1 mr-[-0.3em]">
                    CONTAINERS
                  </span>
                </div>
              )}
            </a>
            
            <p className="text-xs sm:text-sm font-sans leading-relaxed mt-2 text-stone-400">
              Projetamos, reformamos e entregamos containers para obras e indústrias, com garantia técnica.
            </p>

            {/* Social media connections */}
            <div className="flex gap-2.5 mt-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-xl bg-[#111827]/40 hover:bg-brand-yellow hover:text-brand-black flex items-center justify-center border border-white/5 hover:border-brand-yellow transition-all duration-300 text-stone-400"
                aria-label="Instagram Dodisa"
              >
                <Instagram className="w-4 h-4 stroke-[2.5]" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-xl bg-[#111827]/40 hover:bg-brand-yellow hover:text-brand-black flex items-center justify-center border border-white/5 hover:border-brand-yellow transition-all duration-300 text-stone-400"
                aria-label="Linkedin Dodisa"
              >
                <Linkedin className="w-4 h-4 stroke-[2.5]" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-xl bg-[#111827]/40 hover:bg-brand-yellow hover:text-brand-black flex items-center justify-center border border-white/5 hover:border-brand-yellow transition-all duration-300 text-stone-400"
                aria-label="Facebook Dodisa"
              >
                <Facebook className="w-4 h-4 stroke-[2.5]" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-xs font-mono font-black text-white uppercase tracking-widest border-b border-white/5 pb-3 mb-5 select-none">
              Acesso Rápido
            </h3>
            <ul className="space-y-3 text-xs sm:text-sm font-sans">
              <li>
                <a href="#inicio" className="hover:text-brand-yellow transition-colors font-medium tracking-wide uppercase text-[10px]">
                  Início / Topo
                </a>
              </li>
              <li>
                <a href="#containers" className="hover:text-brand-yellow transition-colors font-medium tracking-wide uppercase text-[10px]">
                  Nosso Catálogo
                </a>
              </li>
              <li>
                <a href="#pronta-entrega" className="hover:text-brand-yellow transition-colors font-medium tracking-wide uppercase text-[10px]">
                  Pronta Entrega
                </a>
              </li>
              <li>
                <a href="#projetos" className="hover:text-brand-yellow transition-colors font-medium tracking-wide uppercase text-[10px]">
                  Projetos Executados
                </a>
              </li>
              <li>
                <button
                  onClick={handleWhatsappClick}
                  className="hover:text-brand-yellow text-left transition-colors font-medium tracking-wide uppercase text-[10px] font-sans cursor-pointer focus:outline-none"
                >
                  Falar Comercial
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact details */}
          <div>
            <h3 className="text-xs font-mono font-black text-white uppercase tracking-widest border-b border-white/5 pb-3 mb-5 select-none">
              Central Comercial
            </h3>
            <ul className="space-y-3.5 text-xs sm:text-sm font-sans">
              <li className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-brand-yellow flex-shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider leading-none">Telefone Fixo</span>
                  <a href={`tel:${APP_INFO.phone.replace(/[^0-9+]/g, "")}`} className="hover:text-white transition-colors text-xs sm:text-sm font-medium">
                    {APP_INFO.phone}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MessageSquare className="w-4 h-4 text-brand-orange flex-shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider leading-none">WhatsApp Oficial</span>
                  <a
                    href={`https://wa.me/${whatsapp.number}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-brand-yellow transition-colors text-xs sm:text-sm font-bold"
                  >
                    {whatsapp.number.replace(/^55/, "").replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-brand-yellow flex-shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider leading-none">E-mail Corporativo</span>
                  <a href={`mailto:${APP_INFO.email}`} className="hover:text-white transition-colors text-xs sm:text-sm font-medium">
                    {APP_INFO.email}
                  </a>
                </div>
              </li>
            </ul>
          </div>

          {/* Column 4: Location */}
          <div>
            <h3 className="text-xs font-mono font-black text-white uppercase tracking-widest border-b border-white/5 pb-3 mb-5 select-none">
              Logística e Portão
            </h3>
            <ul className="space-y-3.5 text-xs sm:text-sm font-sans">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-brand-yellow flex-shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider leading-none">Planta Fabril</span>
                  <p className="leading-relaxed text-stone-300 text-xs sm:text-sm">
                    {APP_INFO.address}
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-brand-yellow flex-shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider leading-none">Expediente de Despacho</span>
                  <p className="leading-normal text-stone-300 text-xs">
                    {APP_INFO.workingHours}
                  </p>
                </div>
              </li>
            </ul>
          </div>

        </div>

        {/* Lower Legal disclaimer area */}
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs font-semibold text-stone-500 font-mono">
          <div>
            <p>
              © {currentYear}{" "}
              <button 
                onClick={() => setAdminViewActive(true)}
                className="hover:text-brand-yellow font-black transition-all text-left uppercase cursor-pointer focus:outline-none"
                title="Acessar Sistema Administrativo"
              >
                Dodisa Containers
              </button>{" "}
              LTDA. Todos os direitos reservados.
            </p>
            <p className="text-[10px] text-stone-600 mt-1">CNPJ: {APP_INFO.cnpj} • Eng. Responsável CREA-SP: 507.822/01</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-stone-600 text-[10px]">Padrão de Engenharia Modular • RS 2026</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
