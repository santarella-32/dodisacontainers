import React, { createContext, useContext, useState, useEffect } from "react";
import { getSupabase } from "../lib/supabase";
import { 
  CUSTOMER_WHATSAPP_NUMBER, 
  APP_INFO, 
  CONTAINERS_DATA, 
  DIFFERENTIALS_DATA, 
  PROJECTS_DATA, 
  TESTIMONIALS_DATA, 
  STEPS_DATA 
} from "../data";

// Type declarations for editable sections
export interface LogoSettings {
  logoUrl: string;       // Empty or "default" means vector SVG
  logoDarkUrl: string;   // Optional dark logo or alternative
  faviconUrl: string;    // Browser favicon
  logoAlt: string;       // Logo text representation
  logoLink: string;      // Anchor redirection link
  logoWidthDesktop: number; // Desktop logo width
  logoWidthMobile: number;  // Mobile logo width
}

export interface SEOConfig {
  title: string;
  description: string;
  ogImage: string;
  keywords: string;
}

export interface HeroConfig {
  title: string;
  subtitle: string;
  image: string;
  videoUrl: string;
  primaryBtnText: string;
  primaryBtnUrl: string;
  secondaryBtnText: string;
  secondaryBtnUrl: string;
  visible: boolean;
}

export interface DifferentialCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  visible: boolean;
}

export interface EditableContainer {
  id: string;
  title: string;
  category: string;
  description: string;
  specs: string[];
  image: string;
  whatsappMsg: string;
  status: "Disponível" | "Sob Consulta" | "Vendido" | "Alugado";
  visible: boolean;
  destacado: boolean;
}

export interface ProntaEntregaItem {
  id: string;
  title: string;
  images: string[];
  city: string;
  state: string;
  measurements: string;
  condition: string;
  type: string;
  availableForSale: boolean;
  availableForRent: boolean;
  active: boolean;
}

export interface EditableProject {
  id: string;
  title: string;
  category: string;
  imageBefore?: string;
  imageAfter: string;
  description: string;
  specs: string[];
  visible: boolean;
  destacado: boolean;
}

export interface EditableVideo {
  id: string;
  title: string;
  url: string;
  category: "Transporte" | "Logística" | "Instalação" | "Projeto finalizado" | "Antes e depois";
  visible: boolean;
  orderIndex: number;
}

export interface EditableFAQ {
  id: string;
  question: string;
  answer: string;
  visible: boolean;
  orderIndex: number;
}

export interface EditableTestimonial {
  id: string;
  name: string;
  cityOrCompany: string;
  content: string;
  image?: string;
  rating: number;
  visible: boolean;
}

export interface RegionsConfig {
  states: string[];
  cities: string[];
  regions: string[];
  visibleRegions: Record<string, boolean>;
}

export interface SimulatorQuestion {
  id: string;
  questionText: string;
  options: string[];
  whatsappTemplate: string;
}

export interface SimulatorConfig {
  questions: SimulatorQuestion[];
  whatsappTemplate: string;
}

export interface WhatsAppConfig {
  number: string;
  autoMsgGeneral: string;
  categoryMessages: Record<string, string>;
}

export interface MediaItem {
  id: string;
  url: string;
  name: string;
  type: "image" | "video";
  category: string;
}

export interface SectionsVisibility {
  hero: boolean;
  simulator: boolean;
  differentials: boolean;
  containers: boolean;
  prontaEntrega: boolean;
  projects: boolean;
  gallery: boolean;
  economyCalculator: boolean;
  videos: boolean;
  timeline: boolean;
  map: boolean;
  about: boolean;
  faq: boolean;
  testimonials: boolean;
  cta: boolean;
  channels: boolean;
}

export interface AdminUser {
  email: string;
  role: "ADMIN_MASTER" | "EDITOR";
}

interface AppContextType {
  // Authentication
  isAdminLoggedIn: boolean;
  adminUser: AdminUser | null;
  loginError: string | null;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  recoverPassword: (email: string) => Promise<string>;
  changePassword: (newPass: string) => void;
  changeCredentials: (newEmail: string, currentPass: string, newPass: string) => Promise<{ success: boolean; message: string }>;

  // Site Configurations
  logoSettings: LogoSettings;
  seo: SEOConfig;
  hero: HeroConfig;
  differentials: DifferentialCard[];
  containers: EditableContainer[];
  prontaEntrega: ProntaEntregaItem[];
  projects: EditableProject[];
  videos: EditableVideo[];
  faq: EditableFAQ[];
  testimonials: EditableTestimonial[];
  regions: RegionsConfig;
  simulator: SimulatorConfig;
  whatsapp: WhatsAppConfig;
  mediaLibrary: MediaItem[];
  sectionsVisibility: SectionsVisibility;
  sectionsOrder: string[];
  lastUpdated: string;

  // Updaters (CRUD)
  saveLogoSettings: (settings: LogoSettings) => void;
  saveSEO: (newSeo: SEOConfig) => void;
  saveHero: (newHero: HeroConfig) => void;
  saveSectionsVisibility: (vis: SectionsVisibility) => void;
  saveSectionsOrder: (order: string[]) => void;
  
  // Differentials Updaters
  saveDifferentials: (diffs: DifferentialCard[]) => void;
  addDifferential: (diff: Omit<DifferentialCard, 'id'>) => void;
  editDifferential: (id: string, diff: Partial<DifferentialCard>) => void;
  deleteDifferential: (id: string) => void;

  // Containers Updaters
  saveContainers: (conts: EditableContainer[]) => void;
  addContainer: (cont: Omit<EditableContainer, 'id'>) => void;
  editContainer: (id: string, cont: Partial<EditableContainer>) => void;
  deleteContainer: (id: string) => void;

  // Pronta Entrega Updaters
  saveProntaEntrega: (pList: ProntaEntregaItem[]) => void;
  addProntaEntrega: (pItem: Omit<ProntaEntregaItem, 'id'>) => void;
  editProntaEntrega: (id: string, pItem: Partial<ProntaEntregaItem>) => void;
  deleteProntaEntrega: (id: string) => void;
  duplicateProntaEntrega: (id: string) => void;

  // Projects Updaters
  saveProjects: (projs: EditableProject[]) => void;
  addProject: (proj: Omit<EditableProject, 'id'>) => void;
  editProject: (id: string, proj: Partial<EditableProject>) => void;
  deleteProject: (id: string) => void;

  // Videos Updaters
  saveVideos: (vids: EditableVideo[]) => void;
  addVideo: (vid: Omit<EditableVideo, 'id'>) => void;
  editVideo: (id: string, vid: Partial<EditableVideo>) => void;
  deleteVideo: (id: string) => void;

  // FAQ Updaters
  saveFAQ: (faqs: EditableFAQ[]) => void;
  addFAQ: (faq: Omit<EditableFAQ, 'id'>) => void;
  editFAQ: (id: string, faq: Partial<EditableFAQ>) => void;
  deleteFAQ: (id: string) => void;

  // Testimonials Updaters
  saveTestimonials: (tests: EditableTestimonial[]) => void;
  addTestimonial: (test: Omit<EditableTestimonial, 'id'>) => void;
  editTestimonial: (id: string, test: Partial<EditableTestimonial>) => void;
  deleteTestimonial: (id: string) => void;

  // Regions Updaters
  saveRegions: (reg: RegionsConfig) => void;

  // Simulator Updaters
  saveSimulator: (sim: SimulatorConfig) => void;

  // WhatsApp Updaters
  saveWhatsApp: (wapp: WhatsAppConfig) => void;

  // Media Library Updaters
  saveMediaLibrary: (media: MediaItem[]) => void;
  addMediaItem: (item: Omit<MediaItem, 'id'>) => void;
  deleteMediaItem: (id: string) => void;
  
  // App view toggle
  isAdminViewActive: boolean;
  setAdminViewActive: (active: boolean) => void;

  // Live Draft/Publish Preview Control
  isPagePreviewMode: boolean;
  setPagePreviewMode: (mode: boolean) => void;
  hasUnsavedChanges: boolean;
  publishChanges: () => Promise<void>;
  discardDrafts: () => void;
  restoreOriginalDefaults: () => void;
  previewDataScope: 'draft' | 'published';
  setPreviewDataScope: (scope: 'draft' | 'published') => void;
}

const DEFAULTS = {
  logoSettings: {
    logoUrl: "default",       // 'default' indicates we fallback to the SVG component
    logoDarkUrl: "default",   // 'default' or empty
    faviconUrl: "/favicon.svg", // Dodisa DD logo SVG favicon
    logoAlt: "Dodisa Containers Símbolo",
    logoLink: "/",
    logoWidthDesktop: 120,    // Default size configuration max width px
    logoWidthMobile: 80       // Mobile size configuration
  },
  seo: {
    title: "DODISA CONTAINERS | Especialista em Venda, Aluguel e Projetos Modulares",
    description: "Referência no Sul do Brasil em containers residenciais, escritórios, almoxarifados e sob medida. Atendimento ágil e estrutura de alta segurança.",
    ogImage: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80",
    keywords: "containers, container santa rosa, aluguel container, comprar container, container escritorio, container oficina, v-40, e-30, d-20, rio grande do sul"
  },
  hero: {
    title: "CONTAINERS PRONTO PARA SUA EMPRESA,\nOBRA OU PROJETO.",
    subtitle: "Containers marítimos transformados em escritórios, depósitos, banheiros e projetos personalizados de alto padrão. Robustez, de vedação impecável e pronta entrega rápida.",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    primaryBtnText: "SIMULAR CONTAINER VIA WHATSAPP",
    primaryBtnUrl: "#simulador",
    secondaryBtnText: "VER PRONTA ENTREGA",
    secondaryBtnUrl: "#pronta-entrega",
    visible: true
  },
  differentials: DIFFERENTIALS_DATA.map((d, i) => ({
    id: `diff-${i}`,
    title: d.title,
    description: d.description,
    icon: d.icon,
    visible: true
  })),
  containers: CONTAINERS_DATA.map((c) => ({
    ...c,
    status: "Disponível" as const,
    visible: true,
    destacado: c.id === "escritorio" || c.id === "deposito"
  })),
  prontaEntrega: [
    {
      id: "pe-1",
      title: "Módulo d-20 Standard (6 metros)",
      images: ["https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80"],
      city: "Santa Rosa",
      state: "RS",
      measurements: "6.00m x 2.44m x 2.59m",
      condition: "Seminovo (Classe A)",
      type: "Depósito Blindado",
      availableForSale: true,
      availableForRent: true,
      active: true
    },
    {
      id: "pe-2",
      title: "Módulo e-30 Luxo Isolado",
      images: ["https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=800&q=80"],
      city: "Ijuí",
      state: "RS",
      measurements: "6.00m x 2.44m x 2.59m",
      condition: "Novo de Fábrica",
      type: "Escritório",
      availableForSale: true,
      availableForRent: true,
      active: true
    },
    {
      id: "pe-3",
      title: "Módulo b-15 Acoplado Sanitário",
      images: ["https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80"],
      city: "Passo Fundo",
      state: "RS",
      measurements: "3.00m x 2.44m x 2.59m",
      condition: "Novo",
      type: "Banheiro Especial",
      availableForSale: true,
      availableForRent: true,
      active: true
    }
  ],
  projects: PROJECTS_DATA.map((p) => ({
    ...p,
    specs: p.specs || [],
    visible: true,
    destacado: true
  })),
  videos: [
    {
      id: "v-1",
      title: "Içamento de Módulo d-20 para Depósito de Fábrica",
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      category: "Transporte" as const,
      visible: true,
      orderIndex: 0
    },
    {
      id: "v-2",
      title: "Instalação Completa do Stand de Vendas de Luxo",
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      category: "Instalação" as const,
      visible: true,
      orderIndex: 1
    },
    {
      id: "v-3",
      title: "Tour Interno e Acabamentos do Escritório Premium e-30",
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      category: "Projeto finalizado" as const,
      visible: true,
      orderIndex: 2
    }
  ],
  faq: [
    {
      id: "faq-1",
      question: "O container esquenta muito?",
      answer: "Por ser de aço corten, ele conduz calor. Porém, todos os nossos modelos habitáveis (escritório, habitacional) recebem isolamento térmico premium de lã de rocha de alta densidade e revestimentos adequados.",
      visible: true,
      orderIndex: 0
    },
    {
      id: "faq-2",
      question: "Qual o prazo de entrega padrão para Santa Rosa e região?",
      answer: "Possuímos frota de caminhão munck própria. Para itens à pronta entrega, o despacho ocorre em até 24 a 48 horas úteis.",
      visible: true,
      orderIndex: 1
    },
    {
      id: "faq-3",
      question: "Fazem projetos de containers personalizados com mezanino?",
      answer: "Sim! Desenvolvemos do projeto conceitual inicial até a montagem final com memorial de cálculo estrutural e ART oficial.",
      visible: true,
      orderIndex: 2
    }
  ],
  testimonials: TESTIMONIALS_DATA.map((t) => ({
    id: t.id,
    name: t.name,
    cityOrCompany: `${t.role} - ${t.company}`,
    content: t.content,
    rating: t.rating,
    visible: true
  })),
  regions: {
    states: ["Rio Grande do Sul (Atendimento Total)", "Santa Catarina (Sob Consulta)", "Paraná (Sob Consulta)"],
    cities: ["Santa Rosa", "Santo Ângelo", "Ijuí", "Cruz Alta", "Passo Fundo", "São Borja", "Três Passos", "Erechim", "Porto Alegre"],
    regions: ["Noroeste Riograndense", "Missões", "Planalto Médio", "Fronteira Oeste", "Serra Gaúcha"],
    visibleRegions: {
      "rs_noroeste": true,
      "rs_missoes": true,
      "rs_planalto": true,
      "sc_oeste": true
    }
  },
  simulator: {
    questions: [
      {
        id: "q-tipo",
        questionText: "Qual a finalidade principal do seu container?",
        options: ["Depósito / Almoxarifado", "Escritório / Comercial", "Sanitário / Banheiro", "Habitacional / Studio", "Projeto Customizado"],
        whatsappTemplate: "Finalidade: {val}"
      },
      {
        id: "q-tamanho",
        questionText: "Qual o tamanho que você necessita?",
        options: ["Pequeno (3 metros / 10 pés)", "Padrão (6 metros / 20 pés)", "Grande (12 metros / 40 pés)", "Módulos acoplados sob medida"],
        whatsappTemplate: "Tamanho: {val}"
      },
      {
        id: "q-prazo",
        questionText: "Qual o prazo estimado de início da sua operação?",
        options: ["Urgente (Esta semana)", "Próximas semanas", "Apenas cotação futura"],
        whatsappTemplate: "Urgência: {val}"
      }
    ],
    whatsappTemplate: "Olá! Fiz a simulação de orçamento no site Dodisa e gostaria de saber valores sobre:\\n\\n{answers}\\n\\nObrigado!"
  },
  whatsapp: {
    number: CUSTOMER_WHATSAPP_NUMBER,
    autoMsgGeneral: "Olá! Gostaria de falar com um especialista da Dodisa Containers sobre módulos de aço e orçamentos.",
    categoryMessages: {
      "Depósito": "Gostaria de cotar um Container Depósito Blindado.",
      "Escritório": "Quero saber valores de Container Escritório Premium.",
      "Banheiro": "Gostaria de mais detalhes sobre Container Banheiro.",
      "Vestiário": "Desejo informações sobre Container Vestiário / Refeitório.",
      "Almoxarifado": "Solicito cotação sobre Container Almoxarifado.",
      "Habitacional": "Gostaria de falar sobre o Container Habitacional Studio.",
      "Projetos Personalizados": "Quero apresentar uma ideia de Projeto Personalizado sob medida."
    }
  },
  sectionsVisibility: {
    hero: true,
    simulator: true,
    differentials: true,
    containers: true,
    prontaEntrega: true,
    projects: true,
    gallery: true,
    economyCalculator: true,
    videos: true,
    timeline: true,
    map: true,
    about: true,
    faq: true,
    testimonials: true,
    cta: true,
    channels: true
  },
  sectionsOrder: [
    "hero", "simulator", "differentials", "containers", "prontaEntrega", "projects", 
    "gallery", "economyCalculator", "videos", "timeline", "map", 
    "about", "faq", "testimonials", "cta", "channels"
  ]
};

export const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const supabase = getSupabase();

  // Authentication State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem("dodisa_admin_logged") === "true";
  });
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    const cached = localStorage.getItem("dodisa_admin_user");
    return cached ? JSON.parse(cached) : null;
  });
  const [loginError, setLoginError] = useState<string | null>(null);
  
  // Toggle Admin Dashboard vs Main Storefront View
  const [isAdminViewActive, setAdminViewActive] = useState<boolean>(false);

  // LAST UPDATED METRIC
  const [lastUpdated, setLastUpdated] = useState<string>(() => {
    return localStorage.getItem("dodisa_last_updated") || "2026-06-21 13:30";
  });

  // Live Preview Control State
  const [isPagePreviewMode, setPagePreviewMode] = useState<boolean>(false);
  const [previewDataScope, setPreviewDataScope] = useState<'draft' | 'published'>('draft');

  // ----------------------------------------------------
  // PUBLISHED STATES (Shown on the visitor site)
  // ----------------------------------------------------
  const [pubLogoSettings, setPubLogoSettings] = useState<LogoSettings>(() => {
    const cachedPub = localStorage.getItem("dodisa_cms_pub_logo_settings");
    if (cachedPub) return JSON.parse(cachedPub);
    return DEFAULTS.logoSettings;
  });

  const [pubSeo, setPubSeo] = useState<SEOConfig>(() => {
    const cachedPub = localStorage.getItem("dodisa_cms_pub_seo");
    if (cachedPub) return JSON.parse(cachedPub);
    const legacy = localStorage.getItem("dodisa_cms_seo");
    return legacy ? JSON.parse(legacy) : DEFAULTS.seo;
  });

  const [pubHero, setPubHero] = useState<HeroConfig>(() => {
    const cachedPub = localStorage.getItem("dodisa_cms_pub_hero");
    if (cachedPub) {
      try {
        const parsed = JSON.parse(cachedPub);
        if (parsed && parsed.title && (parsed.title.includes("ENGENHARIA") || parsed.title.includes("ESTRUTURAS MODULARES") || parsed.title.includes("PRONTOS") || parsed.title.includes("PRONTO PARA\nSUA EMPRESA"))) {
          parsed.title = "CONTAINERS PRONTO PARA SUA EMPRESA,\nOBRA OU PROJETO.";
          localStorage.setItem("dodisa_cms_pub_hero", JSON.stringify(parsed));
        }
        return parsed;
      } catch (e) {
        // Fallback
      }
    }
    const legacy = localStorage.getItem("dodisa_cms_hero");
    if (legacy) {
      try {
        const parsed = JSON.parse(legacy);
        if (parsed && parsed.title && (parsed.title.includes("ENGENHARIA") || parsed.title.includes("ESTRUTURAS MODULARES") || parsed.title.includes("PRONTOS") || parsed.title.includes("PRONTO PARA\nSUA EMPRESA"))) {
          parsed.title = "CONTAINERS PRONTO PARA SUA EMPRESA,\nOBRA OU PROJETO.";
          localStorage.setItem("dodisa_cms_hero", JSON.stringify(parsed));
        }
        return parsed;
      } catch (e) {
        // Fallback
      }
    }
    return DEFAULTS.hero;
  });

  const [pubDifferentials, setPubDifferentials] = useState<DifferentialCard[]>(() => {
    const cachedPub = localStorage.getItem("dodisa_cms_pub_differentials");
    if (cachedPub) return JSON.parse(cachedPub);
    const legacy = localStorage.getItem("dodisa_cms_differentials");
    return legacy ? JSON.parse(legacy) : DEFAULTS.differentials;
  });

  const [pubContainers, setPubContainers] = useState<EditableContainer[]>(() => {
    const cachedPub = localStorage.getItem("dodisa_cms_pub_containers");
    if (cachedPub) return JSON.parse(cachedPub);
    const legacy = localStorage.getItem("dodisa_cms_containers");
    return legacy ? JSON.parse(legacy) : DEFAULTS.containers;
  });

  const [pubProntaEntrega, setPubProntaEntrega] = useState<ProntaEntregaItem[]>(() => {
    const cachedPub = localStorage.getItem("dodisa_cms_pub_pronta_entrega");
    if (cachedPub) return JSON.parse(cachedPub);
    const legacy = localStorage.getItem("dodisa_cms_pronta_entrega");
    return legacy ? JSON.parse(legacy) : DEFAULTS.prontaEntrega;
  });

  const [pubProjects, setPubProjects] = useState<EditableProject[]>(() => {
    const cachedPub = localStorage.getItem("dodisa_cms_pub_projects");
    if (cachedPub) return JSON.parse(cachedPub);
    const legacy = localStorage.getItem("dodisa_cms_projects");
    return legacy ? JSON.parse(legacy) : DEFAULTS.projects;
  });

  const [pubVideos, setPubVideos] = useState<EditableVideo[]>(() => {
    const cachedPub = localStorage.getItem("dodisa_cms_pub_videos");
    if (cachedPub) return JSON.parse(cachedPub);
    const legacy = localStorage.getItem("dodisa_cms_videos");
    return legacy ? JSON.parse(legacy) : DEFAULTS.videos;
  });

  const [pubFaq, setPubFaq] = useState<EditableFAQ[]>(() => {
    const cachedPub = localStorage.getItem("dodisa_cms_pub_faq");
    if (cachedPub) return JSON.parse(cachedPub);
    const legacy = localStorage.getItem("dodisa_cms_faq");
    return legacy ? JSON.parse(legacy) : DEFAULTS.faq;
  });

  const [pubTestimonials, setPubTestimonials] = useState<EditableTestimonial[]>(() => {
    const cachedPub = localStorage.getItem("dodisa_cms_pub_testimonials");
    if (cachedPub) return JSON.parse(cachedPub);
    const legacy = localStorage.getItem("dodisa_cms_testimonials");
    return legacy ? JSON.parse(legacy) : DEFAULTS.testimonials;
  });

  const [pubRegions, setPubRegions] = useState<RegionsConfig>(() => {
    const cachedPub = localStorage.getItem("dodisa_cms_pub_regions");
    if (cachedPub) return JSON.parse(cachedPub);
    const legacy = localStorage.getItem("dodisa_cms_regions");
    return legacy ? JSON.parse(legacy) : DEFAULTS.regions;
  });

  const [pubSimulator, setPubSimulator] = useState<SimulatorConfig>(() => {
    const cachedPub = localStorage.getItem("dodisa_cms_pub_simulator");
    if (cachedPub) return JSON.parse(cachedPub);
    const legacy = localStorage.getItem("dodisa_cms_simulator");
    return legacy ? JSON.parse(legacy) : DEFAULTS.simulator;
  });

  const [pubWhatsApp, setPubWhatsApp] = useState<WhatsAppConfig>(() => {
    const cachedPub = localStorage.getItem("dodisa_cms_pub_whatsapp");
    if (cachedPub) return JSON.parse(cachedPub);
    const legacy = localStorage.getItem("dodisa_cms_whatsapp");
    return legacy ? JSON.parse(legacy) : DEFAULTS.whatsapp;
  });

  const [pubSectionsVisibility, setPubSectionsVisibility] = useState<SectionsVisibility>(() => {
    const cachedPub = localStorage.getItem("dodisa_cms_pub_visibility");
    if (cachedPub) return JSON.parse(cachedPub);
    const legacy = localStorage.getItem("dodisa_cms_visibility");
    return legacy ? JSON.parse(legacy) : DEFAULTS.sectionsVisibility;
  });

  const [pubSectionsOrder, setPubSectionsOrder] = useState<string[]>(() => {
    const cachedPub = localStorage.getItem("dodisa_cms_pub_sections_order");
    if (cachedPub) return JSON.parse(cachedPub);
    const legacy = localStorage.getItem("dodisa_cms_sections_order");
    return legacy ? JSON.parse(legacy) : DEFAULTS.sectionsOrder;
  });

  // ----------------------------------------------------
  // DRAFT STATES (Modified in real-time in AdminPanel)
  // ----------------------------------------------------
  const [logoSettings, setLogoSettings] = useState<LogoSettings>(() => {
    const cachedDraft = localStorage.getItem("dodisa_cms_draft_logo_settings");
    if (cachedDraft) return JSON.parse(cachedDraft);
    return pubLogoSettings;
  });

  const [seo, setSeo] = useState<SEOConfig>(() => {
    const cachedDraft = localStorage.getItem("dodisa_cms_draft_seo");
    if (cachedDraft) return JSON.parse(cachedDraft);
    return pubSeo;
  });

  const [hero, setHero] = useState<HeroConfig>(() => {
    const cachedDraft = localStorage.getItem("dodisa_cms_draft_hero");
    if (cachedDraft) {
      try {
        const parsed = JSON.parse(cachedDraft);
        if (parsed && parsed.title && (parsed.title.includes("ENGENHARIA") || parsed.title.includes("ESTRUTURAS MODULARES") || parsed.title.includes("PRONTOS") || parsed.title.includes("PRONTO PARA\nSUA EMPRESA"))) {
          parsed.title = "CONTAINERS PRONTO PARA SUA EMPRESA,\nOBRA OU PROJETO.";
          localStorage.setItem("dodisa_cms_draft_hero", JSON.stringify(parsed));
        }
        return parsed;
      } catch (e) {
        // Fallback
      }
    }
    return pubHero;
  });

  const [differentials, setDifferentials] = useState<DifferentialCard[]>(() => {
    const cachedDraft = localStorage.getItem("dodisa_cms_draft_differentials");
    if (cachedDraft) return JSON.parse(cachedDraft);
    return pubDifferentials;
  });

  const [containers, setContainers] = useState<EditableContainer[]>(() => {
    const cachedDraft = localStorage.getItem("dodisa_cms_draft_containers");
    if (cachedDraft) return JSON.parse(cachedDraft);
    return pubContainers;
  });

  const [prontaEntrega, setProntaEntrega] = useState<ProntaEntregaItem[]>(() => {
    const cachedDraft = localStorage.getItem("dodisa_cms_draft_pronta_entrega");
    if (cachedDraft) return JSON.parse(cachedDraft);
    return pubProntaEntrega;
  });

  const [projects, setProjects] = useState<EditableProject[]>(() => {
    const cachedDraft = localStorage.getItem("dodisa_cms_draft_projects");
    if (cachedDraft) return JSON.parse(cachedDraft);
    return pubProjects;
  });

  const [videos, setVideos] = useState<EditableVideo[]>(() => {
    const cachedDraft = localStorage.getItem("dodisa_cms_draft_videos");
    if (cachedDraft) return JSON.parse(cachedDraft);
    return pubVideos;
  });

  const [faq, setFaq] = useState<EditableFAQ[]>(() => {
    const cachedDraft = localStorage.getItem("dodisa_cms_draft_faq");
    if (cachedDraft) return JSON.parse(cachedDraft);
    return pubFaq;
  });

  const [testimonials, setTestimonials] = useState<EditableTestimonial[]>(() => {
    const cachedDraft = localStorage.getItem("dodisa_cms_draft_testimonials");
    if (cachedDraft) return JSON.parse(cachedDraft);
    return pubTestimonials;
  });

  const [regions, setRegions] = useState<RegionsConfig>(() => {
    const cachedDraft = localStorage.getItem("dodisa_cms_draft_regions");
    if (cachedDraft) return JSON.parse(cachedDraft);
    return pubRegions;
  });

  const [simulator, setSimulator] = useState<SimulatorConfig>(() => {
    const cachedDraft = localStorage.getItem("dodisa_cms_draft_simulator");
    if (cachedDraft) return JSON.parse(cachedDraft);
    return pubSimulator;
  });

  const [whatsapp, setWhatsApp] = useState<WhatsAppConfig>(() => {
    const cachedDraft = localStorage.getItem("dodisa_cms_draft_whatsapp");
    if (cachedDraft) return JSON.parse(cachedDraft);
    return pubWhatsApp;
  });

  const [mediaLibrary, setMediaLibrary] = useState<MediaItem[]>(() => {
    const cached = localStorage.getItem("dodisa_cms_media_library");
    return cached ? JSON.parse(cached) : [
      { id: "img-dep", url: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80", name: "container_deposito.jpg", type: "image", category: "Containers" },
      { id: "img-esc", url: "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=800&q=80", name: "container_escritorio.jpg", type: "image", category: "Containers" },
      { id: "img-ban", url: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80", name: "container_banheiro.jpg", type: "image", category: "Containers" }
    ];
  });

  const [sectionsVisibility, setSectionsVisibilityState] = useState<SectionsVisibility>(() => {
    const cachedDraft = localStorage.getItem("dodisa_cms_draft_visibility");
    if (cachedDraft) return JSON.parse(cachedDraft);
    return pubSectionsVisibility;
  });

  const [sectionsOrder, setSectionsOrderState] = useState<string[]>(() => {
    const cachedDraft = localStorage.getItem("dodisa_cms_draft_sections_order");
    if (cachedDraft) return JSON.parse(cachedDraft);
    return pubSectionsOrder;
  });

  // Load published content from Supabase on mount so all visitors see the latest data
  useEffect(() => {
    const loadPublished = async () => {
      if (!supabase) return;
      try {
        const { data, error } = await supabase
          .from("published_content")
          .select("section_key, content_data");
        if (error || !data || data.length === 0) return;

        data.forEach(({ section_key, content_data }: { section_key: string; content_data: any }) => {
          if (!content_data) return;
          switch (section_key) {
            case "logo_settings":
              setPubLogoSettings(content_data);
              setLogoSettings(content_data);
              localStorage.setItem("dodisa_cms_pub_logo_settings", JSON.stringify(content_data));
              break;
            case "seo":
              setPubSeo(content_data);
              setSeo(content_data);
              localStorage.setItem("dodisa_cms_pub_seo", JSON.stringify(content_data));
              break;
            case "hero":
              setPubHero(content_data);
              setHero(content_data);
              localStorage.setItem("dodisa_cms_pub_hero", JSON.stringify(content_data));
              break;
            case "differentials":
              setPubDifferentials(content_data);
              setDifferentials(content_data);
              localStorage.setItem("dodisa_cms_pub_differentials", JSON.stringify(content_data));
              break;
            case "containers":
              setPubContainers(content_data);
              setContainers(content_data);
              localStorage.setItem("dodisa_cms_pub_containers", JSON.stringify(content_data));
              break;
            case "pronta_entrega":
              setPubProntaEntrega(content_data);
              setProntaEntrega(content_data);
              localStorage.setItem("dodisa_cms_pub_pronta_entrega", JSON.stringify(content_data));
              break;
            case "projects":
              setPubProjects(content_data);
              setProjects(content_data);
              localStorage.setItem("dodisa_cms_pub_projects", JSON.stringify(content_data));
              break;
            case "videos":
              setPubVideos(content_data);
              setVideos(content_data);
              localStorage.setItem("dodisa_cms_pub_videos", JSON.stringify(content_data));
              break;
            case "faq":
              setPubFaq(content_data);
              setFaq(content_data);
              localStorage.setItem("dodisa_cms_pub_faq", JSON.stringify(content_data));
              break;
            case "testimonials":
              setPubTestimonials(content_data);
              setTestimonials(content_data);
              localStorage.setItem("dodisa_cms_pub_testimonials", JSON.stringify(content_data));
              break;
            case "regions":
              setPubRegions(content_data);
              setRegions(content_data);
              localStorage.setItem("dodisa_cms_pub_regions", JSON.stringify(content_data));
              break;
            case "simulator":
              setPubSimulator(content_data);
              setSimulator(content_data);
              localStorage.setItem("dodisa_cms_pub_simulator", JSON.stringify(content_data));
              break;
            case "whatsapp":
              setPubWhatsApp(content_data);
              setWhatsApp(content_data);
              localStorage.setItem("dodisa_cms_pub_whatsapp", JSON.stringify(content_data));
              break;
            case "visibility":
              setPubSectionsVisibility(content_data);
              setSectionsVisibilityState(content_data);
              localStorage.setItem("dodisa_cms_pub_visibility", JSON.stringify(content_data));
              break;
            case "sections_order":
              setPubSectionsOrder(content_data);
              setSectionsOrderState(content_data);
              localStorage.setItem("dodisa_cms_pub_sections_order", JSON.stringify(content_data));
              break;
          }
        });
      } catch {
        // Silently fall back to localStorage data already loaded
      }
    };

    loadPublished();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Track updates
  const markUpdate = () => {
    const now = new Date();
    const formatted = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setLastUpdated(formatted);
    localStorage.setItem("dodisa_last_updated", formatted);
  };

  // Synchronizers of local state to localStorage
  useEffect(() => {
    localStorage.setItem("dodisa_cms_draft_seo", JSON.stringify(seo));
    // Apply changes dynamically to title and description tags for real SEO!
    if (isPagePreviewMode || isAdminViewActive) {
      document.title = seo.title;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute("content", seo.description);
      } else {
        const meta = document.createElement("meta");
        meta.name = "description";
        meta.content = seo.description;
        document.head.appendChild(meta);
      }
    } else {
      document.title = pubSeo.title;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute("content", pubSeo.description);
      }
    }
  }, [seo, pubSeo, isPagePreviewMode, isAdminViewActive]);

  useEffect(() => {
    localStorage.setItem("dodisa_cms_draft_hero", JSON.stringify(hero));
  }, [hero]);

  useEffect(() => {
    localStorage.setItem("dodisa_cms_draft_differentials", JSON.stringify(differentials));
  }, [differentials]);

  useEffect(() => {
    localStorage.setItem("dodisa_cms_draft_containers", JSON.stringify(containers));
  }, [containers]);

  useEffect(() => {
    localStorage.setItem("dodisa_cms_draft_pronta_entrega", JSON.stringify(prontaEntrega));
  }, [prontaEntrega]);

  useEffect(() => {
    localStorage.setItem("dodisa_cms_draft_projects", JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem("dodisa_cms_draft_videos", JSON.stringify(videos));
  }, [videos]);

  useEffect(() => {
    localStorage.setItem("dodisa_cms_draft_faq", JSON.stringify(faq));
  }, [faq]);

  useEffect(() => {
    localStorage.setItem("dodisa_cms_draft_testimonials", JSON.stringify(testimonials));
  }, [testimonials]);

  useEffect(() => {
    localStorage.setItem("dodisa_cms_draft_regions", JSON.stringify(regions));
  }, [regions]);

  useEffect(() => {
    localStorage.setItem("dodisa_cms_draft_simulator", JSON.stringify(simulator));
  }, [simulator]);

  useEffect(() => {
    localStorage.setItem("dodisa_cms_draft_whatsapp", JSON.stringify(whatsapp));
  }, [whatsapp]);

  useEffect(() => {
    localStorage.setItem("dodisa_cms_media_library", JSON.stringify(mediaLibrary));
  }, [mediaLibrary]);

  useEffect(() => {
    localStorage.setItem("dodisa_cms_draft_visibility", JSON.stringify(sectionsVisibility));
  }, [sectionsVisibility]);

  useEffect(() => {
    localStorage.setItem("dodisa_cms_draft_sections_order", JSON.stringify(sectionsOrder));
  }, [sectionsOrder]);

  // Sync state modifications to Supabase database if credentials are valid
  const syncToSupabase = async (table: string, data: any) => {
    if (!supabase) return;
    try {
      const { error } = await supabase
        .from(table)
        .upsert(data, { onConflict: 'id' });
      if (error) console.error(`Error syncing to Supabase table ${table}:`, error);
    } catch (e) {
      console.error("Supabase connection exception:", e);
    }
  };

  // AUTHENTICATION INTERACTIVE LOGIC
  const login = async (email: string, pass: string): Promise<boolean> => {
    setLoginError(null);

    // If Supabase is connected, trigger real Supabase sign-in
    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: pass
        });
        if (error) {
          setLoginError(error.message);
          return false;
        }
        if (data && data.user) {
          const userObj: AdminUser = { email: data.user.email || email, role: "ADMIN_MASTER" };
          setIsAdminLoggedIn(true);
          setAdminUser(userObj);
          localStorage.setItem("dodisa_admin_logged", "true");
          localStorage.setItem("dodisa_admin_user", JSON.stringify(userObj));
          return true;
        }
      } catch (e: any) {
        setLoginError(e.message || "Erro de conexão ao Supabase");
        return false;
      }
    }

    // Default High-Fidelity Local Authentication for ADMIN MASTER
    const storedCreds = (() => {
      try { return JSON.parse(localStorage.getItem("dodisa_admin_custom_creds") || "null"); } catch { return null; }
    })();
    const defaultEmail = storedCreds?.email || "admin@dodisa.com.br";
    const defaultPass = storedCreds?.password || "dodisaadmin2026";

    if (email.trim() === defaultEmail && pass === defaultPass) {
      const userObj: AdminUser = { email: defaultEmail, role: "ADMIN_MASTER" };
      setIsAdminLoggedIn(true);
      setAdminUser(userObj);
      localStorage.setItem("dodisa_admin_logged", "true");
      localStorage.setItem("dodisa_admin_user", JSON.stringify(userObj));
      return true;
    } else {
      setLoginError("Credenciais inválidas. Use os dados padrão do Admin Master.");
      return false;
    }
  };

  const logout = () => {
    if (supabase) {
      supabase.auth.signOut().catch(() => {});
    }
    setIsAdminLoggedIn(false);
    setAdminUser(null);
    setAdminViewActive(false);
    localStorage.removeItem("dodisa_admin_logged");
    localStorage.removeItem("dodisa_admin_user");
  };

  const recoverPassword = async (email: string): Promise<string> => {
    if (supabase) {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) throw error;
        return "E-mail de recuperação enviado via Supabase!";
      } catch (e: any) {
        return `Erro: ${e.message}`;
      }
    }
    // Mock Recovery response
    if (email.includes("@")) {
      return `Link de recuperação enviado para ${email}. Senha temporária recomendada: dodisaadmin2026`;
    }
    return "E-mail de recuperação inválido.";
  };

  const changePassword = (newPass: string) => {
    markUpdate();
  };

  const changeCredentials = async (newEmail: string, currentPass: string, newPass: string): Promise<{ success: boolean; message: string }> => {
    // If Supabase, delegate to it
    if (supabase) {
      try {
        const updates: any = {};
        if (newEmail) updates.email = newEmail;
        if (newPass) updates.password = newPass;
        const { error } = await supabase.auth.updateUser(updates);
        if (error) return { success: false, message: error.message };
        if (newEmail) {
          const updatedUser: AdminUser = { email: newEmail, role: "ADMIN_MASTER" };
          setAdminUser(updatedUser);
          localStorage.setItem("dodisa_admin_user", JSON.stringify(updatedUser));
        }
        return { success: true, message: "Credenciais atualizadas via Supabase!" };
      } catch (e: any) {
        return { success: false, message: e.message };
      }
    }

    // Local auth: verify current password first
    const storedCreds = (() => {
      try { return JSON.parse(localStorage.getItem("dodisa_admin_custom_creds") || "null"); } catch { return null; }
    })();
    const activeEmail = storedCreds?.email || "admin@dodisa.com.br";
    const activePass = storedCreds?.password || "dodisaadmin2026";

    if (currentPass !== activePass) {
      return { success: false, message: "Senha atual incorreta." };
    }

    const updatedCreds = {
      email: newEmail || activeEmail,
      password: newPass || activePass,
    };
    localStorage.setItem("dodisa_admin_custom_creds", JSON.stringify(updatedCreds));

    const updatedUser: AdminUser = { email: updatedCreds.email, role: "ADMIN_MASTER" };
    setAdminUser(updatedUser);
    localStorage.setItem("dodisa_admin_user", JSON.stringify(updatedUser));

    markUpdate();
    return { success: true, message: "Credenciais atualizadas com sucesso!" };
  };

  // ----------------------------------------------------
  // DRAFT & LIVE PREVIEW ACTION MIDDLEWARES
  // ----------------------------------------------------

  const hasUnsavedChanges = 
    JSON.stringify(seo) !== JSON.stringify(pubSeo) ||
    JSON.stringify(hero) !== JSON.stringify(pubHero) ||
    JSON.stringify(differentials) !== JSON.stringify(pubDifferentials) ||
    JSON.stringify(containers) !== JSON.stringify(pubContainers) ||
    JSON.stringify(prontaEntrega) !== JSON.stringify(pubProntaEntrega) ||
    JSON.stringify(projects) !== JSON.stringify(pubProjects) ||
    JSON.stringify(videos) !== JSON.stringify(pubVideos) ||
    JSON.stringify(faq) !== JSON.stringify(pubFaq) ||
    JSON.stringify(testimonials) !== JSON.stringify(pubTestimonials) ||
    JSON.stringify(regions) !== JSON.stringify(pubRegions) ||
    JSON.stringify(simulator) !== JSON.stringify(pubSimulator) ||
    JSON.stringify(whatsapp) !== JSON.stringify(pubWhatsApp) ||
    JSON.stringify(sectionsVisibility) !== JSON.stringify(pubSectionsVisibility) ||
    JSON.stringify(sectionsOrder) !== JSON.stringify(pubSectionsOrder);

  const publishChanges = async () => {
    // 1. Copy Draft states to Published states
    setPubLogoSettings(logoSettings);
    setPubSeo(seo);
    setPubHero(hero);
    setPubDifferentials(differentials);
    setPubContainers(containers);
    setPubProntaEntrega(prontaEntrega);
    setPubProjects(projects);
    setPubVideos(videos);
    setPubFaq(faq);
    setPubTestimonials(testimonials);
    setPubRegions(regions);
    setPubSimulator(simulator);
    setPubWhatsApp(whatsapp);
    setPubSectionsVisibility(sectionsVisibility);
    setPubSectionsOrder(sectionsOrder);

    // 2. Persist Published state to localStorage
    localStorage.setItem("dodisa_cms_pub_logo_settings", JSON.stringify(logoSettings));
    localStorage.setItem("dodisa_cms_pub_seo", JSON.stringify(seo));
    localStorage.setItem("dodisa_cms_pub_hero", JSON.stringify(hero));
    localStorage.setItem("dodisa_cms_pub_differentials", JSON.stringify(differentials));
    localStorage.setItem("dodisa_cms_pub_containers", JSON.stringify(containers));
    localStorage.setItem("dodisa_cms_pub_pronta_entrega", JSON.stringify(prontaEntrega));
    localStorage.setItem("dodisa_cms_pub_projects", JSON.stringify(projects));
    localStorage.setItem("dodisa_cms_pub_videos", JSON.stringify(videos));
    localStorage.setItem("dodisa_cms_pub_faq", JSON.stringify(faq));
    localStorage.setItem("dodisa_cms_pub_testimonials", JSON.stringify(testimonials));
    localStorage.setItem("dodisa_cms_pub_regions", JSON.stringify(regions));
    localStorage.setItem("dodisa_cms_pub_simulator", JSON.stringify(simulator));
    localStorage.setItem("dodisa_cms_pub_whatsapp", JSON.stringify(whatsapp));
    localStorage.setItem("dodisa_cms_pub_visibility", JSON.stringify(sectionsVisibility));
    localStorage.setItem("dodisa_cms_pub_sections_order", JSON.stringify(sectionsOrder));

    // Also copy to legacy slots so public visitors see their contents instantly on this instance
    localStorage.setItem("dodisa_cms_logo_settings", JSON.stringify(logoSettings));
    localStorage.setItem("dodisa_cms_seo", JSON.stringify(seo));
    localStorage.setItem("dodisa_cms_hero", JSON.stringify(hero));
    localStorage.setItem("dodisa_cms_differentials", JSON.stringify(differentials));
    localStorage.setItem("dodisa_cms_containers", JSON.stringify(containers));
    localStorage.setItem("dodisa_cms_pronta_entrega", JSON.stringify(prontaEntrega));
    localStorage.setItem("dodisa_cms_projects", JSON.stringify(projects));
    localStorage.setItem("dodisa_cms_videos", JSON.stringify(videos));
    localStorage.setItem("dodisa_cms_faq", JSON.stringify(faq));
    localStorage.setItem("dodisa_cms_testimonials", JSON.stringify(testimonials));
    localStorage.setItem("dodisa_cms_regions", JSON.stringify(regions));
    localStorage.setItem("dodisa_cms_simulator", JSON.stringify(simulator));
    localStorage.setItem("dodisa_cms_whatsapp", JSON.stringify(whatsapp));
    localStorage.setItem("dodisa_cms_visibility", JSON.stringify(sectionsVisibility));
    localStorage.setItem("dodisa_cms_sections_order", JSON.stringify(sectionsOrder));

    markUpdate();

    // 3. Sync to Supabase tables draft_content and published_content if configured
    if (supabase) {
      const userEmail = adminUser?.email || "admin@dodisa.com.br";
      const sections = [
        { key: "logo_settings", data: logoSettings },
        { key: "seo", data: seo },
        { key: "hero", data: hero },
        { key: "differentials", data: differentials },
        { key: "containers", data: containers },
        { key: "pronta_entrega", data: prontaEntrega },
        { key: "projects", data: projects },
        { key: "videos", data: videos },
        { key: "faq", data: faq },
        { key: "testimonials", data: testimonials },
        { key: "regions", data: regions },
        { key: "simulator", data: simulator },
        { key: "whatsapp", data: whatsapp },
        { key: "visibility", data: sectionsVisibility },
        { key: "sections_order", data: sectionsOrder }
      ];

      for (const sec of sections) {
        try {
          await supabase.from("draft_content").upsert({
            section_key: sec.key,
            content_data: sec.data,
            updated_at: new Date().toISOString(),
            updated_by: userEmail,
            is_published: true
          }, { onConflict: "section_key" });

          await supabase.from("published_content").upsert({
            section_key: sec.key,
            content_data: sec.data,
            updated_at: new Date().toISOString(),
            updated_by: userEmail,
            is_published: true
          }, { onConflict: "section_key" });

          // Also sync to a specific table site_settings if it exists
          if (sec.key === "logo_settings") {
            try {
              await supabase.from("site_settings").upsert({
                id: 1,
                logo_url: logoSettings.logoUrl,
                logo_dark_url: logoSettings.logoDarkUrl,
                favicon_url: logoSettings.faviconUrl,
                logo_alt: logoSettings.logoAlt,
                logo_link: logoSettings.logoLink,
                logo_width_desktop: logoSettings.logoWidthDesktop,
                logo_width_mobile: logoSettings.logoWidthMobile,
                updated_at: new Date().toISOString(),
                updated_by: userEmail
              }, { onConflict: "id" });
            } catch (err) {
              // Ignore if site_settings is not set up
            }
          }
        } catch (err) {
          console.error("Supabase sync issue inside publishChanges:", err);
        }
      }
    }
  };

  const discardDrafts = () => {
    setLogoSettings(pubLogoSettings);
    setSeo(pubSeo);
    setHero(pubHero);
    setDifferentials(pubDifferentials);
    setContainers(pubContainers);
    setProntaEntrega(pubProntaEntrega);
    setProjects(pubProjects);
    setVideos(pubVideos);
    setFaq(pubFaq);
    setTestimonials(pubTestimonials);
    setRegions(pubRegions);
    setSimulator(pubSimulator);
    setWhatsApp(pubWhatsApp);
    setSectionsVisibilityState(pubSectionsVisibility);
    setSectionsOrderState(pubSectionsOrder);

    localStorage.setItem("dodisa_cms_draft_logo_settings", JSON.stringify(pubLogoSettings));
    localStorage.setItem("dodisa_cms_draft_seo", JSON.stringify(pubSeo));
    localStorage.setItem("dodisa_cms_draft_hero", JSON.stringify(pubHero));
    localStorage.setItem("dodisa_cms_draft_differentials", JSON.stringify(pubDifferentials));
    localStorage.setItem("dodisa_cms_draft_containers", JSON.stringify(pubContainers));
    localStorage.setItem("dodisa_cms_draft_pronta_entrega", JSON.stringify(pubProntaEntrega));
    localStorage.setItem("dodisa_cms_draft_projects", JSON.stringify(pubProjects));
    localStorage.setItem("dodisa_cms_draft_videos", JSON.stringify(pubVideos));
    localStorage.setItem("dodisa_cms_draft_faq", JSON.stringify(pubFaq));
    localStorage.setItem("dodisa_cms_draft_testimonials", JSON.stringify(pubTestimonials));
    localStorage.setItem("dodisa_cms_draft_regions", JSON.stringify(pubRegions));
    localStorage.setItem("dodisa_cms_draft_simulator", JSON.stringify(pubSimulator));
    localStorage.setItem("dodisa_cms_draft_whatsapp", JSON.stringify(pubWhatsApp));
    localStorage.setItem("dodisa_cms_draft_visibility", JSON.stringify(pubSectionsVisibility));
    localStorage.setItem("dodisa_cms_draft_sections_order", JSON.stringify(pubSectionsOrder));
  };

  const restoreOriginalDefaults = () => {
    setLogoSettings(DEFAULTS.logoSettings);
    setSeo(DEFAULTS.seo);
    setHero(DEFAULTS.hero);
    setDifferentials(DEFAULTS.differentials);
    setContainers(DEFAULTS.containers);
    setProntaEntrega(DEFAULTS.prontaEntrega);
    setProjects(DEFAULTS.projects);
    setVideos(DEFAULTS.videos);
    setFaq(DEFAULTS.faq);
    setTestimonials(DEFAULTS.testimonials);
    setRegions(DEFAULTS.regions);
    setSimulator(DEFAULTS.simulator);
    setWhatsApp(DEFAULTS.whatsapp);
    setSectionsVisibilityState(DEFAULTS.sectionsVisibility);
    setSectionsOrderState(DEFAULTS.sectionsOrder);

    localStorage.setItem("dodisa_cms_draft_logo_settings", JSON.stringify(DEFAULTS.logoSettings));
    localStorage.setItem("dodisa_cms_draft_seo", JSON.stringify(DEFAULTS.seo));
    localStorage.setItem("dodisa_cms_draft_hero", JSON.stringify(DEFAULTS.hero));
    localStorage.setItem("dodisa_cms_draft_differentials", JSON.stringify(DEFAULTS.differentials));
    localStorage.setItem("dodisa_cms_draft_containers", JSON.stringify(DEFAULTS.containers));
    localStorage.setItem("dodisa_cms_draft_pronta_entrega", JSON.stringify(DEFAULTS.prontaEntrega));
    localStorage.setItem("dodisa_cms_draft_projects", JSON.stringify(DEFAULTS.projects));
    localStorage.setItem("dodisa_cms_draft_videos", JSON.stringify(DEFAULTS.videos));
    localStorage.setItem("dodisa_cms_draft_faq", JSON.stringify(DEFAULTS.faq));
    localStorage.setItem("dodisa_cms_draft_testimonials", JSON.stringify(DEFAULTS.testimonials));
    localStorage.setItem("dodisa_cms_draft_regions", JSON.stringify(DEFAULTS.regions));
    localStorage.setItem("dodisa_cms_draft_simulator", JSON.stringify(DEFAULTS.simulator));
    localStorage.setItem("dodisa_cms_draft_whatsapp", JSON.stringify(DEFAULTS.whatsapp));
    localStorage.setItem("dodisa_cms_draft_visibility", JSON.stringify(DEFAULTS.sectionsVisibility));
    localStorage.setItem("dodisa_cms_draft_sections_order", JSON.stringify(DEFAULTS.sectionsOrder));
  };

  // ----------------------------------------------------
  // INDIVIDUAL ENTITY ACTIONS (CMS CORE UPDATERS)
  // ----------------------------------------------------

  const saveLogoSettings = (settings: LogoSettings) => {
    setLogoSettings(settings);
    markUpdate();
  };

  const saveSEO = (newSeo: SEOConfig) => {
    setSeo(newSeo);
    markUpdate();
  };

  const saveHero = (newHero: HeroConfig) => {
    setHero(newHero);
    markUpdate();
  };

  const saveSectionsVisibility = (vis: SectionsVisibility) => {
    setSectionsVisibilityState(vis);
    markUpdate();
  };

  const saveSectionsOrder = (order: string[]) => {
    setSectionsOrderState(order);
    markUpdate();
  };

  // Differentials
  const saveDifferentials = (diffs: DifferentialCard[]) => {
    setDifferentials(diffs);
    markUpdate();
  };
  const addDifferential = (diff: Omit<DifferentialCard, 'id'>) => {
    const id = `diff-${Date.now()}`;
    const newDiff = { ...diff, id };
    setDifferentials(prev => [...prev, newDiff]);
    markUpdate();
    syncToSupabase("differentials", newDiff);
  };
  const editDifferential = (id: string, partial: Partial<DifferentialCard>) => {
    setDifferentials(prev => prev.map(d => d.id === id ? { ...d, ...partial } : d));
    markUpdate();
    const updated = differentials.find(d => d.id === id);
    if (updated) syncToSupabase("differentials", { ...updated, ...partial });
  };
  const deleteDifferential = (id: string) => {
    setDifferentials(prev => prev.filter(d => d.id !== id));
    markUpdate();
  };

  // Containers
  const saveContainers = (conts: EditableContainer[]) => {
    setContainers(conts);
    markUpdate();
  };
  const addContainer = (cont: Omit<EditableContainer, 'id'>) => {
    const id = `cont-${Date.now()}`;
    const newCont = { ...cont, id };
    setContainers(prev => [newCont, ...prev]);
    markUpdate();
    syncToSupabase("containers", newCont);
  };
  const editContainer = (id: string, partial: Partial<EditableContainer>) => {
    setContainers(prev => prev.map(c => c.id === id ? { ...c, ...partial } : c));
    markUpdate();
    const updated = containers.find(c => c.id === id);
    if (updated) syncToSupabase("containers", { ...updated, ...partial });
  };
  const deleteContainer = (id: string) => {
    setContainers(prev => prev.filter(c => c.id !== id));
    markUpdate();
  };

  // Pronta Entrega Stock
  const saveProntaEntrega = (pList: ProntaEntregaItem[]) => {
    setProntaEntrega(pList);
    markUpdate();
  };
  const addProntaEntrega = (pItem: Omit<ProntaEntregaItem, 'id'>) => {
    const id = `pe-${Date.now()}`;
    const newItem = { ...pItem, id };
    setProntaEntrega(prev => [newItem, ...prev]);
    markUpdate();
    syncToSupabase("containers_pronta_entrega", newItem);
  };
  const editProntaEntrega = (id: string, partial: Partial<ProntaEntregaItem>) => {
    setProntaEntrega(prev => prev.map(p => p.id === id ? { ...p, ...partial } : p));
    markUpdate();
    const updated = prontaEntrega.find(p => p.id === id);
    if (updated) syncToSupabase("containers_pronta_entrega", { ...updated, ...partial });
  };
  const deleteProntaEntrega = (id: string) => {
    setProntaEntrega(prev => prev.filter(p => p.id !== id));
    markUpdate();
  };
  const duplicateProntaEntrega = (id: string) => {
    const item = prontaEntrega.find(p => p.id === id);
    if (item) {
      const duplicated = {
        ...item,
        id: `pe-${Date.now()}`,
        title: `${item.title} (Cópia)`
      };
      setProntaEntrega(prev => [duplicated, ...prev]);
      markUpdate();
      syncToSupabase("containers_pronta_entrega", duplicated);
    }
  };

  // Completed Projects
  const saveProjects = (projs: EditableProject[]) => {
    setProjects(projs);
    markUpdate();
  };
  const addProject = (proj: Omit<EditableProject, 'id'>) => {
    const id = `proj-${Date.now()}`;
    const newProj = { ...proj, id };
    setProjects(prev => [newProj, ...prev]);
    markUpdate();
    syncToSupabase("projects", newProj);
  };
  const editProject = (id: string, partial: Partial<EditableProject>) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...partial } : p));
    markUpdate();
    const updated = projects.find(p => p.id === id);
    if (updated) syncToSupabase("projects", { ...updated, ...partial });
  };
  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    markUpdate();
  };

  // Embedded Videos
  const saveVideos = (vids: EditableVideo[]) => {
    setVideos(vids);
    markUpdate();
  };
  const addVideo = (vid: Omit<EditableVideo, 'id'>) => {
    const id = `vid-${Date.now()}`;
    const newVid = { ...vid, id, orderIndex: videos.length };
    setVideos(prev => [...prev, newVid]);
    markUpdate();
    syncToSupabase("videos", newVid);
  };
  const editVideo = (id: string, partial: Partial<EditableVideo>) => {
    setVideos(prev => prev.map(v => v.id === id ? { ...v, ...partial } : v));
    markUpdate();
  };
  const deleteVideo = (id: string) => {
    setVideos(prev => prev.filter(v => v.id !== id));
    markUpdate();
  };

  // Interactive FAQs
  const saveFAQ = (faqs: EditableFAQ[]) => {
    setFaq(faqs);
    markUpdate();
  };
  const addFAQ = (item: Omit<EditableFAQ, 'id'>) => {
    const id = `faq-${Date.now()}`;
    const newFaq = { ...item, id, orderIndex: faq.length };
    setFaq(prev => [...prev, newFaq]);
    markUpdate();
    syncToSupabase("faq", newFaq);
  };
  const editFAQ = (id: string, partial: Partial<EditableFAQ>) => {
    setFaq(prev => prev.map(f => f.id === id ? { ...f, ...partial } : f));
    markUpdate();
  };
  const deleteFAQ = (id: string) => {
    setFaq(prev => prev.filter(f => f.id !== id));
    markUpdate();
  };

  // Customer Reviews
  const saveTestimonials = (tests: EditableTestimonial[]) => {
    setTestimonials(tests);
    markUpdate();
  };
  const addTestimonial = (test: Omit<EditableTestimonial, 'id'>) => {
    const id = `test-${Date.now()}`;
    const newTest = { ...test, id };
    setTestimonials(prev => [newTest, ...prev]);
    markUpdate();
    syncToSupabase("depoimentos", newTest);
  };
  const editTestimonial = (id: string, partial: Partial<EditableTestimonial>) => {
    setTestimonials(prev => prev.map(t => t.id === id ? { ...t, ...partial } : t));
    markUpdate();
  };
  const deleteTestimonial = (id: string) => {
    setTestimonials(prev => prev.filter(t => t.id !== id));
    markUpdate();
  };

  // Logisitic regions
  const saveRegions = (reg: RegionsConfig) => {
    setRegions(reg);
    markUpdate();
  };

  // Estimator Form
  const saveSimulator = (sim: SimulatorConfig) => {
    setSimulator(sim);
    markUpdate();
  };

  // Conversions Phone configurations
  const saveWhatsApp = (wapp: WhatsAppConfig) => {
    setWhatsApp(wapp);
    markUpdate();
  };

  // Central Media Hub
  const saveMediaLibrary = (media: MediaItem[]) => {
    setMediaLibrary(media);
    markUpdate();
  };
  const addMediaItem = (item: Omit<MediaItem, 'id'>) => {
    const id = `media-${Date.now()}`;
    const newItem = { ...item, id };
    setMediaLibrary(prev => [newItem, ...prev]);
    markUpdate();
  };
  const deleteMediaItem = (id: string) => {
    setMediaLibrary(prev => prev.filter(m => m.id !== id));
    markUpdate();
  };

  return (
    <AppContext.Provider
      value={{
        isAdminLoggedIn,
        adminUser,
        loginError,
        login,
        logout,
        recoverPassword,
        changePassword,
        changeCredentials,

        logoSettings: (isPagePreviewMode || isAdminViewActive) ? (previewDataScope === 'published' ? pubLogoSettings : logoSettings) : pubLogoSettings,
        seo: (isPagePreviewMode || isAdminViewActive) ? (previewDataScope === 'published' ? pubSeo : seo) : pubSeo,
        hero: (isPagePreviewMode || isAdminViewActive) ? (previewDataScope === 'published' ? pubHero : hero) : pubHero,
        differentials: (isPagePreviewMode || isAdminViewActive) ? (previewDataScope === 'published' ? pubDifferentials : differentials) : pubDifferentials,
        containers: (isPagePreviewMode || isAdminViewActive) ? (previewDataScope === 'published' ? pubContainers : containers) : pubContainers,
        prontaEntrega: (isPagePreviewMode || isAdminViewActive) ? (previewDataScope === 'published' ? pubProntaEntrega : prontaEntrega) : pubProntaEntrega,
        projects: (isPagePreviewMode || isAdminViewActive) ? (previewDataScope === 'published' ? pubProjects : projects) : pubProjects,
        videos: (isPagePreviewMode || isAdminViewActive) ? (previewDataScope === 'published' ? pubVideos : videos) : pubVideos,
        faq: (isPagePreviewMode || isAdminViewActive) ? (previewDataScope === 'published' ? pubFaq : faq) : pubFaq,
        testimonials: (isPagePreviewMode || isAdminViewActive) ? (previewDataScope === 'published' ? pubTestimonials : testimonials) : pubTestimonials,
        regions: (isPagePreviewMode || isAdminViewActive) ? (previewDataScope === 'published' ? pubRegions : regions) : pubRegions,
        simulator: (isPagePreviewMode || isAdminViewActive) ? (previewDataScope === 'published' ? pubSimulator : simulator) : pubSimulator,
        whatsapp: (isPagePreviewMode || isAdminViewActive) ? (previewDataScope === 'published' ? pubWhatsApp : whatsapp) : pubWhatsApp,
        mediaLibrary,
        sectionsVisibility: (isPagePreviewMode || isAdminViewActive) ? (previewDataScope === 'published' ? pubSectionsVisibility : sectionsVisibility) : pubSectionsVisibility,
        sectionsOrder: (isPagePreviewMode || isAdminViewActive) ? (previewDataScope === 'published' ? pubSectionsOrder : sectionsOrder) : pubSectionsOrder,
        lastUpdated,

        saveLogoSettings,
        saveSEO,
        saveHero,
        saveSectionsVisibility,
        saveSectionsOrder,

        saveDifferentials,
        addDifferential,
        editDifferential,
        deleteDifferential,

        saveContainers,
        addContainer,
        editContainer,
        deleteContainer,

        saveProntaEntrega,
        addProntaEntrega,
        editProntaEntrega,
        deleteProntaEntrega,
        duplicateProntaEntrega,

        saveProjects,
        addProject,
        editProject,
        deleteProject,

        saveVideos,
        addVideo,
        editVideo,
        deleteVideo,

        saveFAQ,
        addFAQ,
        editFAQ,
        deleteFAQ,

        saveTestimonials,
        addTestimonial,
        editTestimonial,
        deleteTestimonial,

        saveRegions,
        saveSimulator,
        saveWhatsApp,

        saveMediaLibrary,
        addMediaItem,
        deleteMediaItem,

        isAdminViewActive,
        setAdminViewActive,
        isPagePreviewMode,
        setPagePreviewMode,
        hasUnsavedChanges,
        publishChanges,
        discardDrafts,
        restoreOriginalDefaults,
        previewDataScope,
        setPreviewDataScope
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
