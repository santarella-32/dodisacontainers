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

export interface BaseLocation {
  address: string;
  lat: number;
  lng: number;
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

export interface ProjectHotspot {
  id: string;
  x: number;
  y: number;
  label: string;
  spec: string;
  image?: string;
}

export interface EditableProject {
  id: string;
  title: string;
  category: string;
  imageBefore?: string;
  imageAfter: string;
  imageNight?: string;
  hotspots?: ProjectHotspot[];
  gallery?: string[];
  description: string;
  specs: string[];
  visible: boolean;
  destacado: boolean;
}

export interface EditableVideo {
  id: string;
  title: string;
  url: string;
  thumbnail?: string;
  duration?: string;
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

// Detects the pre-B2B FAQ content so it can be replaced on any load path
const isLegacyFaq = (items: EditableFAQ[]) =>
  Array.isArray(items) && items.length > 0 &&
  items[0].question.toLowerCase().includes("esquenta");

export interface EditableTestimonial {
  id: string;
  name: string;
  cityOrCompany: string;
  content: string;
  image?: string;
  rating: number;
  visible: boolean;
}

export interface CustomBlock {
  id: string;
  title: string;
  text: string;
  image?: string;
  ctaText?: string;
  ctaUrl?: string;
}

export interface AboutPillar {
  id: string;
  title: string;
  description: string;
  seal: string;
}

export interface AboutConfig {
  title: string;
  highlightTitle: string;
  paragraph1: string;
  paragraph2: string;
  paragraph3: string;
  stat1Value: string;
  stat1Label: string;
  stat2Value: string;
  stat2Label: string;
  stat3Value: string;
  stat3Label: string;
  image: string;
  pillarsLabel: string;
  pillars: AboutPillar[];
}

export interface TimelineStep {
  id: string;
  number: number;
  title: string;
  description: string;
}

export interface TimelineConfig {
  title: string;
  highlightTitle: string;
  subtitle: string;
  steps: TimelineStep[];
  footerNote: string;
}

export interface CTAConfig {
  eyebrow: string;
  statLine: string;
  title: string;
  subtitle: string;
  buttonText: string;
}

export interface ChannelsConfig {
  title: string;
  highlightTitle: string;
  subtitle: string;
  instagramHandle: string;
  instagramUrl: string;
  addressLine1: string;
  addressLine2: string;
  mapsUrl: string;
}

export interface EconomyComparisonRow {
  id: string;
  attribute: string;
  container: string;
  masonry: string;
}

export interface EconomyCalculatorConfig {
  eyebrow: string;
  titleLine1: string;
  titleHighlight: string;
  titleLine2: string;
  subtitle: string;
  projectTypes: string[];
  sizes: string[];
  timeframes: string[];
  comparisons: EconomyComparisonRow[];
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
  carrosselGaleria: boolean;
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
  // Custom sections use a dynamic "custom-<id>" key, so visibility isn't a fixed field
  [key: string]: boolean;
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
  baseLocation: BaseLocation;
  saveBaseLocation: (loc: BaseLocation) => void;
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
  customBlocks: CustomBlock[];
  materialImages: Record<string, string>;
  about: AboutConfig;
  timeline: TimelineConfig;
  cta: CTAConfig;
  channels: ChannelsConfig;
  economyCalculator: EconomyCalculatorConfig;
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

  // Custom Section Blocks Updaters
  saveCustomBlocks: (blocks: CustomBlock[]) => void;
  addCustomBlock: () => string;
  editCustomBlock: (id: string, block: Partial<CustomBlock>) => void;
  deleteCustomBlock: (id: string) => void;

  // Configurator material photo overrides
  setMaterialImage: (id: string, url: string) => void;
  removeMaterialImage: (id: string) => void;

  // Static-turned-editable section Updaters
  saveAbout: (about: AboutConfig) => void;
  saveTimeline: (timeline: TimelineConfig) => void;
  saveCTA: (cta: CTAConfig) => void;
  saveChannels: (channels: ChannelsConfig) => void;
  saveEconomyCalculator: (calc: EconomyCalculatorConfig) => void;

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
  baseLocation: {
    address: "Rua Julio Gaviragui, Santa Rosa, RS, Brasil",
    lat: -27.872,
    lng: -54.481,
  } as BaseLocation,
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
    ogImage: "/link.png",
    keywords: "containers, container santa rosa, aluguel container, comprar container, container escritorio, container oficina, v-40, e-30, d-20, rio grande do sul"
  },
  hero: {
    title: "A Solução Mais Rápida e Segura em Containers para sua Empresa ou Obra.",
    subtitle: "Containers marítimos transformados em escritórios, depósitos, banheiros e projetos personalizados de alto padrão. Robustez, de vedação impecável e pronta entrega rápida.",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    primaryBtnText: "SIMULAR CONTAINER VIA WHATSAPP",
    primaryBtnUrl: "#simulador",
    secondaryBtnText: "VER ESTOQUE",
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
      url: "",
      category: "Transporte" as const,
      visible: true,
      orderIndex: 0
    },
    {
      id: "v-2",
      title: "Instalação Completa do Stand de Vendas de Luxo",
      url: "",
      category: "Instalação" as const,
      visible: true,
      orderIndex: 1
    },
    {
      id: "v-3",
      title: "Tour Interno e Acabamentos do Escritório Premium e-30",
      url: "",
      category: "Projeto finalizado" as const,
      visible: true,
      orderIndex: 2
    }
  ],
  faq: [
    {
      id: "faq-1",
      question: "Qual o desempenho térmico real dos módulos e como ele é comprovado tecnicamente?",
      answer: "Os módulos habitáveis Dodisa utilizam painéis PIR (Poliisocianurato) com espessura de 50 mm, atingindo coeficiente de transmitância térmica (U) inferior a 0,40 W/m²K — equivalente a edificações convencionais climatizadas. O desempenho é documentado por laudo técnico com ART, cobrindo envoltória, vedação perimetral e análise de risco de condensação intersticial. Para projetos com exigência de conformidade NR-17 (conforto térmico), fornecemos memória de cálculo completa sob demanda.",
      visible: true,
      orderIndex: 0
    },
    {
      id: "faq-2",
      question: "Quais são os SLAs de mobilização, entrega e içamento para projetos corporativos?",
      answer: "Módulos em estoque: despacho em até 24 h úteis após assinatura do pedido. Projetos sob medida: cronograma formalizado em contrato com milestones de fabricação, acabamento e entrega. A mobilização inclui içamento com caminhão munck próprio (sem dependência de terceiros), nivelamento topográfico e conexão de infraestrutura, com janela operacional de 4 a 8 horas para módulos isolados. Para canteiros completos (conjuntos modulares), fornecemos cronograma Gantt integrado.",
      visible: true,
      orderIndex: 1
    },
    {
      id: "faq-3",
      question: "Os módulos suportam sobreposição estrutural e integração com redes MEP prediais existentes?",
      answer: "Sim. O chassi naval em aço Corten (espessura mínima 3 mm) suporta empilhamento de até 3 módulos habitáveis com cargas de serviço padrão, mediante análise estrutural e ART de responsabilidade técnica. A integração com redes MEP (Mecânica, Elétrica e Hidráulica) é viabilizada pelos breakouts elétricos em conduit IMC, conexões hidráulicas com flange de 1½\" e eletrodutos pré-instalados para dados. Adaptações adicionais são especificadas em projeto executivo.",
      visible: true,
      orderIndex: 2
    },
    {
      id: "faq-4",
      question: "Como é garantida a conformidade com as Normas NR-18 e NR-24 em canteiros de obras?",
      answer: "Todos os módulos destinados a canteiros de obras são fabricados em conformidade com os requisitos das Normas Regulamentadoras NR-18 (Condições e Meio Ambiente de Trabalho na Indústria da Construção) e NR-24 (Condições Sanitárias e de Conforto nos Locais de Trabalho). Fornecemos laudo técnico de conformidade assinado por engenheiro habilitado (CREA), documentação de vestiários, instalações sanitárias e áreas de refeição dimensionadas conforme o efetivo do canteiro. O conjunto documental está disponível para auditoria do cliente e fiscalização do MTE.",
      visible: true,
      orderIndex: 3
    },
    {
      id: "faq-5",
      question: "É possível locar módulos com opção de compra futura (lease-to-own) para projetos de longa duração?",
      answer: "Sim. Operamos com modalidade de locação operacional com cláusula de opção de compra ao término do contrato, aplicável a contratos com prazo mínimo de 12 meses. O valor residual é negociado no momento da contratação e descontado proporcionalmente dos aluguéis pagos. Para projetos corporativos de infraestrutura temporária com horizonte superior a 24 meses, o modelo lease-to-own apresenta custo total de propriedade (TCO) equivalente ou inferior ao de construção convencional, com vantagem adicional de mobilidade e reaproveitamento do ativo.",
      visible: true,
      orderIndex: 4
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
    differentials: false,
    containers: true,
    prontaEntrega: true,
    projects: true,
    carrosselGaleria: false,
    gallery: false,
    economyCalculator: false,
    videos: true,
    timeline: false,
    map: true,
    about: true,
    faq: true,
    testimonials: true,
    cta: true,
    channels: true
  },
  sectionsOrder: [
    "hero", "containers", "simulator", "differentials", "prontaEntrega", "projects",
    "carrosselGaleria", "gallery", "economyCalculator", "videos", "timeline", "map",
    "about", "faq", "testimonials", "cta", "channels"
  ],
  customBlocks: [] as CustomBlock[],
  materialImages: {} as Record<string, string>,
  about: {
    title: "A FORÇA DA ENGENHARIA MODULAR.",
    highlightTitle: "LOGÍSTICA E EXECUÇÃO IMPLACÁVEIS.",
    paragraph1: "Não somos apenas montadores de estruturas. Somos um grupo de engenharia e logística pesada focado em mobilização corporativa. Projetamos, fabricamos e entregamos soluções 'chave na mão' que esmagam o cronograma da alvenaria tradicional.",
    paragraph2: "Cada módulo sai da nossa linha de produção com chassi naval, pintura em poliuretano epóxi de alta resistência e isolamento térmico avançado. O resultado? Uma estrutura blindada, rigorosamente dentro das normas NR-18 e NR-24, pronta para operar nos climas e terrenos mais extremos do Brasil.",
    paragraph3: "A sua operação não tem margem para erros. Nós também não.",
    stat1Value: "100%", stat1Label: "Homologado NR-18",
    stat2Value: "Aço", stat2Label: "Corten Certificado",
    stat3Value: "LOGÍSTICA INTEGRADA", stat3Label: "Frota Pesada e Caminhões Munck Próprios",
    image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=800&q=80",
    pillarsLabel: "Fundamentos Corporativos",
    pillars: [
      { id: "pillar-1", title: "DIRETRIZ OPERACIONAL", description: "Erradicar o atraso, o desperdício e a burocracia do seu canteiro de obras. Entregamos estruturas modulares de alto padrão, prontas para uso imediato (Plug & Play), garantindo que a sua equipe comece a faturar no minuto em que o módulo toca o solo.", seal: "Engenharia de Resultados" },
      { id: "pillar-2", title: "NOSSO ALVO — O PADRÃO-OURO", description: "Estabelecer o padrão absoluto em infraestrutura modular no país. Onde houver uma operação crítica exigindo conforto térmico, segurança estrutural e velocidade de implantação, haverá uma estrutura com a nossa assinatura.", seal: "Domínio de Mercado" },
      { id: "pillar-3", title: "PILARES INEGOCIÁVEIS", description: "Rigor técnico incontestável (com laudos e ART em 100% dos projetos). Logística própria implacável, com içamento seguro e frota pesada. Prazo de embarque é lei. Nós falamos de engenheiro para engenheiro.", seal: "Operação Blindada" }
    ]
  } as AboutConfig,
  timeline: {
    title: "COMO FUNCIONA A",
    highlightTitle: "ENTREGA?",
    subtitle: "Do primeiro contato até a entrega no seu pátio. Sem burocracia.",
    steps: STEPS_DATA.map((s) => ({ id: `step-${s.number}`, number: s.number, title: s.title, description: s.description })),
    footerNote: "★ PRODUÇÃO COMEÇA EM 24 HORAS APÓS O CONTRATO."
  } as TimelineConfig,
  cta: {
    eyebrow: "Atendimento Rápido Nacional",
    statLine: "+940 empresas atendidas · Resposta em até 15 min",
    title: "ESTRUTURAS MODULARES\nPRONTAS EM ATÉ 30 DIAS ÚTEIS",
    subtitle: "Fale agora com um especialista e receba seu orçamento comercial detalhado.",
    buttonText: "Falar com um especialista"
  } as CTAConfig,
  channels: {
    title: "Nossos Canais",
    highlightTitle: "Oficiais",
    subtitle: "Fale com a gente pelo WhatsApp, Instagram ou visite nosso pátio.",
    instagramHandle: APP_INFO.instagram,
    instagramUrl: APP_INFO.instagramUrl,
    addressLine1: "Rua Julio Gaviragui, Santa Rosa, Rio Grande do Sul, Brazil - CEP 98790146",
    addressLine2: "Santa Rosa, Rio Grande do Sul",
    mapsUrl: APP_INFO.mapsUrl
  } as ChannelsConfig,
  economyCalculator: {
    eyebrow: "ANÁLISE DE CUSTO-BENEFÍCIO FINANCEIRO",
    titleLine1: "Container",
    titleHighlight: "vs",
    titleLine2: "Alvenaria",
    subtitle: "Proteja seu capital de giro corporativo e evite custos imprevisíveis de obras civis. Saiba o quanto você economiza optando por containers de alto padrão de engenharia.",
    projectTypes: ["Escritório Comercial", "Almoxarifado de Canteiro", "Banheiro em Lote", "Frente de Loja", "Projeto Especial"],
    sizes: ["15 m² (Padrão 20 Pés)", "30 m² (Padrão 40 Pés)", "60 m² (Acoplado de 2 Modules)", "Sob Medida / Especial"],
    timeframes: ["Imediato", "Em 15 Dias", "Em 30 Dias", "Mais de 60 Dias"],
    comparisons: [
      { id: "cmp-1", attribute: "Prazo de Execução", container: "Até 5x mais rápido. Entrega imediata de lotes padrão limpos e revisados nos pátios.", masonry: "Lento. Requer meses de fundação pesada, preparo de cimento, reboco, secagem e cura estrutural." },
      { id: "cmp-2", attribute: "Mobilidade e Transporte", container: "100% Móvel. Desmonte e desloque toda a estrutura no caminhão munck para outro terreno livremente.", masonry: "Estático. Destruição completa da estrutura construída ou abandono total em caso de mudança de endereço." },
      { id: "cmp-3", attribute: "Custo-Benefício Global", container: "Otimizado e previsível. Sem aditivos surpresas de ferragens, areia ou desvios de mão de obra.", masonry: "Instável. Orçamentos estouram em média de 30% a 50% por perdas de insumo e mão de obra de terceiros." },
      { id: "cmp-4", attribute: "Sustentabilidade", container: "Ecologicamente amigável. Reuso de aço corten excedente marítimo e zero desperdício de insumos ou água.", masonry: "Prejudicial. Alto desgaste de entulho de tijolo, areia de leito de rio e perdas de concreto fresco." },
      { id: "cmp-5", attribute: "Flexibilidade & Expansão", container: "Modular. Deseja expandir? Basta acoplar novos containers lateralmente ou empilhar sobrepostos.", masonry: "Complexo. Requer quebra de paredes vigentes, novos pilares estruturais e cálculo manual de solo." },
      { id: "cmp-6", attribute: "Personalização Interna", container: "Totalmente customizável. Prontamente compatível com drywall gesso, piso vinílico, cerâmica e portas pele de vidro.", masonry: "Totalmente customizável, porém com alto custo adicional de quebra-quebra de encunhamento e tubulações." },
      { id: "cmp-7", attribute: "Reutilização & Recuperação", container: "Ativo líquido. No fim do seu contrato ou uso fabril, você revende o container e recupera excelente capital de giro.", masonry: "Passivo permanente. O imóvel construído em terreno alheio não pode ser liquidado nem deslocado." },
      { id: "cmp-8", attribute: "Manutenção Corretiva", container: "Simples. Apenas aplicação preventiva de tinta esmalte industrial de retoque a cada 5 anos.", masonry: "Periódica. Reparos anuais contra infiltrações de telhado, umidade ascendente e trincas de cimento." }
    ]
  } as EconomyCalculatorConfig
};

export const AppContext = createContext<AppContextType | undefined>(undefined);

// Merges admin-uploaded real photos (keyed by material id) into a configurator
// item list, overriding the procedural swatch/icon wherever a photo was set.
export function applyMaterialImageOverrides<T extends { id: string; thumbnail?: string }>(
  items: T[],
  overrides: Record<string, string>
): T[] {
  return items.map((item) => (overrides[item.id] ? { ...item, thumbnail: overrides[item.id] } : item));
}

export function AppProvider({ children }: { children: React.ReactNode }) {
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
  const [isAdminViewActive, setAdminViewActive] = useState<boolean>(() => {
    try { return localStorage.getItem("dodisa_admin_active") === "true"; } catch { return false; }
  });

  // Persist admin view state so reload returns to same page
  React.useEffect(() => {
    try { localStorage.setItem("dodisa_admin_active", isAdminViewActive ? "true" : "false"); } catch { /* ignore */ }
  }, [isAdminViewActive]);

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
        if (parsed && parsed.title) {
          const clean = parsed.title.replace(/\s/g, "").toUpperCase();
          if (!clean.includes("ASOLUCAOMAISRAPIDA")) {
            parsed.title = "A Solução Mais Rápida e Segura em Containers para sua Empresa ou Obra.";
            localStorage.setItem("dodisa_cms_pub_hero", JSON.stringify(parsed));
          }
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
        if (parsed && parsed.title) {
          const clean = parsed.title.replace(/\s/g, "").toUpperCase();
          if (!clean.includes("ASOLUCAOMAISRAPIDA")) {
            parsed.title = "A Solução Mais Rápida e Segura em Containers para sua Empresa ou Obra.";
            localStorage.setItem("dodisa_cms_hero", JSON.stringify(parsed));
          }
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
    if (cachedPub) { const p = JSON.parse(cachedPub); if (!isLegacyFaq(p)) return p; }
    const legacy = localStorage.getItem("dodisa_cms_faq");
    if (legacy) { const p = JSON.parse(legacy); if (!isLegacyFaq(p)) return p; }
    return DEFAULTS.faq;
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

  const [pubCustomBlocks, setPubCustomBlocks] = useState<CustomBlock[]>(() => {
    const cachedPub = localStorage.getItem("dodisa_cms_pub_custom_blocks");
    if (cachedPub) return JSON.parse(cachedPub);
    const legacy = localStorage.getItem("dodisa_cms_custom_blocks");
    return legacy ? JSON.parse(legacy) : DEFAULTS.customBlocks;
  });

  const [pubMaterialImages, setPubMaterialImages] = useState<Record<string, string>>(() => {
    const cachedPub = localStorage.getItem("dodisa_cms_pub_material_images");
    return cachedPub ? JSON.parse(cachedPub) : DEFAULTS.materialImages;
  });

  const [pubAbout, setPubAbout] = useState<AboutConfig>(() => {
    const cachedPub = localStorage.getItem("dodisa_cms_pub_about");
    return cachedPub ? JSON.parse(cachedPub) : DEFAULTS.about;
  });
  const [pubTimeline, setPubTimeline] = useState<TimelineConfig>(() => {
    const cachedPub = localStorage.getItem("dodisa_cms_pub_timeline");
    return cachedPub ? JSON.parse(cachedPub) : DEFAULTS.timeline;
  });
  const [pubCTA, setPubCTA] = useState<CTAConfig>(() => {
    const cachedPub = localStorage.getItem("dodisa_cms_pub_cta");
    return cachedPub ? JSON.parse(cachedPub) : DEFAULTS.cta;
  });
  const [pubChannels, setPubChannels] = useState<ChannelsConfig>(() => {
    const cachedPub = localStorage.getItem("dodisa_cms_pub_channels");
    return cachedPub ? JSON.parse(cachedPub) : DEFAULTS.channels;
  });
  const [pubEconomyCalculator, setPubEconomyCalculator] = useState<EconomyCalculatorConfig>(() => {
    const cachedPub = localStorage.getItem("dodisa_cms_pub_economy_calculator");
    return cachedPub ? JSON.parse(cachedPub) : DEFAULTS.economyCalculator;
  });

  const [pubSectionsVisibility, setPubSectionsVisibility] = useState<SectionsVisibility>(() => {
    const cachedPub = localStorage.getItem("dodisa_cms_pub_visibility");
    if (cachedPub) return { ...JSON.parse(cachedPub), prontaEntrega: true };
    const legacy = localStorage.getItem("dodisa_cms_visibility");
    return legacy ? { ...JSON.parse(legacy), prontaEntrega: true } : DEFAULTS.sectionsVisibility;
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
    if (cachedDraft) { const p = JSON.parse(cachedDraft); if (!isLegacyFaq(p)) return p; }
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

  const [customBlocks, setCustomBlocks] = useState<CustomBlock[]>(() => {
    const cachedDraft = localStorage.getItem("dodisa_cms_draft_custom_blocks");
    if (cachedDraft) return JSON.parse(cachedDraft);
    return pubCustomBlocks;
  });

  const [materialImages, setMaterialImages] = useState<Record<string, string>>(() => {
    const cachedDraft = localStorage.getItem("dodisa_cms_draft_material_images");
    return cachedDraft ? JSON.parse(cachedDraft) : pubMaterialImages;
  });

  const [about, setAbout] = useState<AboutConfig>(() => {
    const cachedDraft = localStorage.getItem("dodisa_cms_draft_about");
    return cachedDraft ? JSON.parse(cachedDraft) : pubAbout;
  });
  const [timeline, setTimeline] = useState<TimelineConfig>(() => {
    const cachedDraft = localStorage.getItem("dodisa_cms_draft_timeline");
    return cachedDraft ? JSON.parse(cachedDraft) : pubTimeline;
  });
  const [cta, setCTA] = useState<CTAConfig>(() => {
    const cachedDraft = localStorage.getItem("dodisa_cms_draft_cta");
    return cachedDraft ? JSON.parse(cachedDraft) : pubCTA;
  });
  const [channels, setChannels] = useState<ChannelsConfig>(() => {
    const cachedDraft = localStorage.getItem("dodisa_cms_draft_channels");
    return cachedDraft ? JSON.parse(cachedDraft) : pubChannels;
  });
  const [economyCalculator, setEconomyCalculator] = useState<EconomyCalculatorConfig>(() => {
    const cachedDraft = localStorage.getItem("dodisa_cms_draft_economy_calculator");
    return cachedDraft ? JSON.parse(cachedDraft) : pubEconomyCalculator;
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
    if (cachedDraft) return { ...JSON.parse(cachedDraft), prontaEntrega: true };
    return pubSectionsVisibility;
  });

  const [sectionsOrder, setSectionsOrderState] = useState<string[]>(() => {
    const cachedDraft = localStorage.getItem("dodisa_cms_draft_sections_order");
    if (cachedDraft) return JSON.parse(cachedDraft);
    return pubSectionsOrder;
  });

  const [baseLocation, setBaseLocationState] = useState<BaseLocation>(() => {
    try { return JSON.parse(localStorage.getItem("dodisa_base_location") || "null") || DEFAULTS.baseLocation; } catch { return DEFAULTS.baseLocation; }
  });

  const saveBaseLocation = (loc: BaseLocation) => {
    setBaseLocationState(loc);
    localStorage.setItem("dodisa_base_location", JSON.stringify(loc));
    markUpdate();
  };

  // Load published content from Supabase on mount so all visitors see the latest data
  useEffect(() => {
    const loadPublished = async () => {
      const supabase = getSupabase();
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
            case "hero": {
              const heroData = { ...content_data };
              if (heroData.title) {
                const clean = heroData.title.replace(/\s/g, "").toUpperCase();
                if (!clean.includes("ASOLUCAOMAISRAPIDA")) {
                  heroData.title = "A Solução Mais Rápida e Segura em Containers para sua Empresa ou Obra.";
                }
              }
              setPubHero(heroData);
              setHero(heroData);
              localStorage.setItem("dodisa_cms_pub_hero", JSON.stringify(heroData));
              break;
            }
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
            case "faq": {
              const faqData = isLegacyFaq(content_data) ? DEFAULTS.faq : content_data;
              setPubFaq(faqData);
              setFaq(faqData);
              localStorage.setItem("dodisa_cms_pub_faq", JSON.stringify(faqData));
              break;
            }
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
            case "visibility": {
              const visData = { ...content_data, prontaEntrega: false };
              setPubSectionsVisibility(visData);
              setSectionsVisibilityState(visData);
              localStorage.setItem("dodisa_cms_pub_visibility", JSON.stringify(visData));
              break;
            }
            case "sections_order":
              setPubSectionsOrder(content_data);
              setSectionsOrderState(content_data);
              localStorage.setItem("dodisa_cms_pub_sections_order", JSON.stringify(content_data));
              break;
            case "custom_blocks":
              setPubCustomBlocks(content_data);
              setCustomBlocks(content_data);
              localStorage.setItem("dodisa_cms_pub_custom_blocks", JSON.stringify(content_data));
              break;
            case "material_images":
              setPubMaterialImages(content_data);
              setMaterialImages(content_data);
              localStorage.setItem("dodisa_cms_pub_material_images", JSON.stringify(content_data));
              break;
            case "about":
              setPubAbout(content_data);
              setAbout(content_data);
              localStorage.setItem("dodisa_cms_pub_about", JSON.stringify(content_data));
              break;
            case "timeline":
              setPubTimeline(content_data);
              setTimeline(content_data);
              localStorage.setItem("dodisa_cms_pub_timeline", JSON.stringify(content_data));
              break;
            case "cta":
              setPubCTA(content_data);
              setCTA(content_data);
              localStorage.setItem("dodisa_cms_pub_cta", JSON.stringify(content_data));
              break;
            case "channels":
              setPubChannels(content_data);
              setChannels(content_data);
              localStorage.setItem("dodisa_cms_pub_channels", JSON.stringify(content_data));
              break;
            case "economy_calculator":
              setPubEconomyCalculator(content_data);
              setEconomyCalculator(content_data);
              localStorage.setItem("dodisa_cms_pub_economy_calculator", JSON.stringify(content_data));
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
    localStorage.setItem("dodisa_cms_draft_custom_blocks", JSON.stringify(customBlocks));
  }, [customBlocks]);

  useEffect(() => {
    localStorage.setItem("dodisa_cms_draft_material_images", JSON.stringify(materialImages));
  }, [materialImages]);

  useEffect(() => {
    localStorage.setItem("dodisa_cms_draft_about", JSON.stringify(about));
  }, [about]);

  useEffect(() => {
    localStorage.setItem("dodisa_cms_draft_timeline", JSON.stringify(timeline));
  }, [timeline]);

  useEffect(() => {
    localStorage.setItem("dodisa_cms_draft_cta", JSON.stringify(cta));
  }, [cta]);

  useEffect(() => {
    localStorage.setItem("dodisa_cms_draft_channels", JSON.stringify(channels));
  }, [channels]);

  useEffect(() => {
    localStorage.setItem("dodisa_cms_draft_economy_calculator", JSON.stringify(economyCalculator));
  }, [economyCalculator]);

  useEffect(() => {
    localStorage.setItem("dodisa_cms_draft_visibility", JSON.stringify(sectionsVisibility));
  }, [sectionsVisibility]);

  // One-time migration: apply new section visibility defaults to existing users
  useEffect(() => {
    if (localStorage.getItem("dodisa_visibility_v3")) return;
    const hidden = ["differentials", "gallery", "economyCalculator", "timeline"];
    const applyHidden = (vis: SectionsVisibility): SectionsVisibility =>
      Object.fromEntries(Object.entries(vis).map(([k, v]) => [k, hidden.includes(k) ? false : v])) as SectionsVisibility;
    const newVis = applyHidden(DEFAULTS.sectionsVisibility);
    setPubSectionsVisibility(newVis);
    setSectionsVisibilityState(newVis);
    ["dodisa_cms_pub_visibility", "dodisa_cms_draft_visibility", "dodisa_cms_visibility"].forEach(
      (key) => localStorage.setItem(key, JSON.stringify(newVis))
    );
    localStorage.setItem("dodisa_visibility_v3", "true");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Migration v4: enable "about" section (previously hidden by v3)
  useEffect(() => {
    if (localStorage.getItem("dodisa_visibility_v4")) return;
    setSectionsVisibilityState((prev) => ({ ...prev, about: true }));
    setPubSectionsVisibility((prev: SectionsVisibility) => ({ ...prev, about: true }));
    ["dodisa_cms_pub_visibility", "dodisa_cms_draft_visibility", "dodisa_cms_visibility"].forEach((key) => {
      try {
        const stored = JSON.parse(localStorage.getItem(key) || "{}");
        localStorage.setItem(key, JSON.stringify({ ...stored, about: true }));
      } catch { /* ignore */ }
    });
    localStorage.setItem("dodisa_visibility_v4", "true");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // One-time migration: inject carrosselGaleria into existing stored sectionsOrder arrays
  useEffect(() => {
    if (localStorage.getItem("dodisa_sections_order_v1")) return;
    const insertAfter = "projects";
    const newKey = "carrosselGaleria";
    const injectKey = (order: string[]): string[] => {
      if (order.includes(newKey)) return order;
      const idx = order.indexOf(insertAfter);
      if (idx === -1) return [...order, newKey];
      return [...order.slice(0, idx + 1), newKey, ...order.slice(idx + 1)];
    };
    const orderKeys = [
      "dodisa_cms_pub_sections_order",
      "dodisa_cms_draft_sections_order",
      "dodisa_cms_sections_order",
    ];
    orderKeys.forEach((key) => {
      try {
        const raw = localStorage.getItem(key);
        if (raw) {
          const updated = injectKey(JSON.parse(raw));
          localStorage.setItem(key, JSON.stringify(updated));
        }
      } catch {}
    });
    const newPubOrder = injectKey(pubSectionsOrder);
    const newDraftOrder = injectKey(sectionsOrder);
    setPubSectionsOrder(newPubOrder);
    setSectionsOrderState(newDraftOrder);
    localStorage.setItem("dodisa_sections_order_v1", "true");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // One-time migration: move containers to right after hero
  useEffect(() => {
    if (localStorage.getItem("dodisa_sections_order_v2")) return;
    const reorder = (order: string[]): string[] => {
      const without = order.filter((k) => k !== "containers");
      const heroIdx = without.indexOf("hero");
      if (heroIdx === -1) return ["containers", ...without];
      return [...without.slice(0, heroIdx + 1), "containers", ...without.slice(heroIdx + 1)];
    };
    const orderKeys = [
      "dodisa_cms_pub_sections_order",
      "dodisa_cms_draft_sections_order",
      "dodisa_cms_sections_order",
    ];
    orderKeys.forEach((key) => {
      try {
        const raw = localStorage.getItem(key);
        if (raw) localStorage.setItem(key, JSON.stringify(reorder(JSON.parse(raw))));
      } catch {}
    });
    setPubSectionsOrder((prev) => reorder(prev));
    setSectionsOrderState((prev) => reorder(prev));
    localStorage.setItem("dodisa_sections_order_v2", "true");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    localStorage.setItem("dodisa_cms_draft_sections_order", JSON.stringify(sectionsOrder));
  }, [sectionsOrder]);

  // Sync state modifications to Supabase database if credentials are valid
  const syncToSupabase = async (table: string, data: any) => {
    const supabase = getSupabase();
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
  // Admin login is authenticated exclusively via Supabase — there is no client-side
  // fallback. A pure SPA has no way to keep a "local" credential check secure: any
  // string compared in this bundle is readable in DevTools, and the comparison
  // itself can be bypassed by driving React state directly from the console. If
  // Supabase can't be reached, we surface a clear error instead of granting access.
  const login = async (email: string, pass: string): Promise<boolean> => {
    setLoginError(null);

    const supabase = getSupabase();
    if (!supabase) {
      setLoginError("Serviço de autenticação indisponível no momento. Verifique sua conexão e tente novamente.");
      return false;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pass
      });
      if (!error && data && data.user) {
        const userObj: AdminUser = { email: data.user.email || email, role: "ADMIN_MASTER" };
        setIsAdminLoggedIn(true);
        setAdminUser(userObj);
        localStorage.setItem("dodisa_admin_logged", "true");
        localStorage.setItem("dodisa_admin_user", JSON.stringify(userObj));
        return true;
      }
      setLoginError("Credenciais inválidas. Verifique seu e-mail e senha.");
      return false;
    } catch {
      setLoginError("Não foi possível conectar ao serviço de autenticação. Tente novamente em instantes.");
      return false;
    }
  };

  const logout = () => {
    const supabase = getSupabase();
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
    const supabase = getSupabase();
    if (!supabase) {
      return "Serviço de recuperação de senha indisponível no momento. Tente novamente em instantes.";
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      return "E-mail de recuperação enviado via Supabase!";
    } catch (e: any) {
      return `Erro: ${e.message}`;
    }
  };

  const changePassword = (newPass: string) => {
    markUpdate();
  };

  const changeCredentials = async (newEmail: string, currentPass: string, newPass: string): Promise<{ success: boolean; message: string }> => {
    const supabase = getSupabase();
    if (!supabase) {
      return { success: false, message: "Serviço de autenticação indisponível no momento. Tente novamente em instantes." };
    }
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
    JSON.stringify(customBlocks) !== JSON.stringify(pubCustomBlocks) ||
    JSON.stringify(materialImages) !== JSON.stringify(pubMaterialImages) ||
    JSON.stringify(about) !== JSON.stringify(pubAbout) ||
    JSON.stringify(timeline) !== JSON.stringify(pubTimeline) ||
    JSON.stringify(cta) !== JSON.stringify(pubCTA) ||
    JSON.stringify(channels) !== JSON.stringify(pubChannels) ||
    JSON.stringify(economyCalculator) !== JSON.stringify(pubEconomyCalculator) ||
    JSON.stringify(sectionsVisibility) !== JSON.stringify(pubSectionsVisibility) ||
    JSON.stringify(sectionsOrder) !== JSON.stringify(pubSectionsOrder);

  const publishChanges = async () => {
    const supabase = getSupabase();

    // Sections are defined fresh each call so `draft`/`pub` reflect current state.
    const sectionDefs = [
      { key: "logo_settings", ls: "logo_settings", draft: logoSettings, pub: pubLogoSettings, setDraft: setLogoSettings, setPub: setPubLogoSettings, isLogo: true },
      { key: "seo", ls: "seo", draft: seo, pub: pubSeo, setDraft: setSeo, setPub: setPubSeo },
      { key: "hero", ls: "hero", draft: hero, pub: pubHero, setDraft: setHero, setPub: setPubHero },
      { key: "differentials", ls: "differentials", draft: differentials, pub: pubDifferentials, setDraft: setDifferentials, setPub: setPubDifferentials },
      { key: "containers", ls: "containers", draft: containers, pub: pubContainers, setDraft: setContainers, setPub: setPubContainers },
      { key: "pronta_entrega", ls: "pronta_entrega", draft: prontaEntrega, pub: pubProntaEntrega, setDraft: setProntaEntrega, setPub: setPubProntaEntrega },
      { key: "projects", ls: "projects", draft: projects, pub: pubProjects, setDraft: setProjects, setPub: setPubProjects },
      { key: "videos", ls: "videos", draft: videos, pub: pubVideos, setDraft: setVideos, setPub: setPubVideos },
      { key: "faq", ls: "faq", draft: faq, pub: pubFaq, setDraft: setFaq, setPub: setPubFaq },
      { key: "testimonials", ls: "testimonials", draft: testimonials, pub: pubTestimonials, setDraft: setTestimonials, setPub: setPubTestimonials },
      { key: "regions", ls: "regions", draft: regions, pub: pubRegions, setDraft: setRegions, setPub: setPubRegions },
      { key: "simulator", ls: "simulator", draft: simulator, pub: pubSimulator, setDraft: setSimulator, setPub: setPubSimulator },
      { key: "whatsapp", ls: "whatsapp", draft: whatsapp, pub: pubWhatsApp, setDraft: setWhatsApp, setPub: setPubWhatsApp },
      { key: "custom_blocks", ls: "custom_blocks", draft: customBlocks, pub: pubCustomBlocks, setDraft: setCustomBlocks, setPub: setPubCustomBlocks },
      { key: "material_images", ls: "material_images", draft: materialImages, pub: pubMaterialImages, setDraft: setMaterialImages, setPub: setPubMaterialImages },
      { key: "about", ls: "about", draft: about, pub: pubAbout, setDraft: setAbout, setPub: setPubAbout },
      { key: "timeline", ls: "timeline", draft: timeline, pub: pubTimeline, setDraft: setTimeline, setPub: setPubTimeline },
      { key: "cta", ls: "cta", draft: cta, pub: pubCTA, setDraft: setCTA, setPub: setPubCTA },
      { key: "channels", ls: "channels", draft: channels, pub: pubChannels, setDraft: setChannels, setPub: setPubChannels },
      { key: "economy_calculator", ls: "economy_calculator", draft: economyCalculator, pub: pubEconomyCalculator, setDraft: setEconomyCalculator, setPub: setPubEconomyCalculator },
      { key: "visibility", ls: "visibility", draft: sectionsVisibility, pub: pubSectionsVisibility, setDraft: setSectionsVisibilityState, setPub: setPubSectionsVisibility },
      { key: "sections_order", ls: "sections_order", draft: sectionsOrder, pub: pubSectionsOrder, setDraft: setSectionsOrderState, setPub: setPubSectionsOrder },
    ];

    // Only sections actually changed on THIS device should be pushed — everything else
    // gets refreshed from Supabase first (below) instead of being blindly republished,
    // so a stale/long-lived admin tab can't stomp on what another device already published.
    const editedHere = sectionDefs.filter((sec) => JSON.stringify(sec.draft) !== JSON.stringify(sec.pub));

    if (supabase) {
      try {
        const { data: remoteRows } = await supabase.from("published_content").select("section_key, content_data");
        const remoteMap = new Map((remoteRows || []).map((r: { section_key: string; content_data: any }) => [r.section_key, r.content_data]));
        const editedKeys = new Set(editedHere.map((s) => s.key));

        for (const sec of sectionDefs) {
          if (editedKeys.has(sec.key)) continue;
          const remote = remoteMap.get(sec.key);
          if (remote == null || JSON.stringify(remote) === JSON.stringify(sec.pub)) continue;

          sec.setPub(remote);
          sec.setDraft(remote);
          localStorage.setItem(`dodisa_cms_pub_${sec.ls}`, JSON.stringify(remote));
          localStorage.setItem(`dodisa_cms_draft_${sec.ls}`, JSON.stringify(remote));
          localStorage.setItem(`dodisa_cms_${sec.ls}`, JSON.stringify(remote));
        }
      } catch (err) {
        console.error("Publish pre-sync issue:", err);
      }
    }

    if (editedHere.length === 0) {
      markUpdate();
      return;
    }

    // 1. Copy this device's edited drafts into Published state
    for (const sec of editedHere) {
      sec.setPub(sec.draft);
      localStorage.setItem(`dodisa_cms_pub_${sec.ls}`, JSON.stringify(sec.draft));
      // Legacy slot (no prefix) so public visitors see it instantly on this instance
      localStorage.setItem(`dodisa_cms_${sec.ls}`, JSON.stringify(sec.draft));
    }

    markUpdate();

    // 2. Sync to Supabase tables draft_content and published_content if configured
    if (supabase) {
      const userEmail = adminUser?.email || "admin@dodisa.com.br";

      for (const sec of editedHere) {
        try {
          await supabase.from("draft_content").upsert({
            section_key: sec.key,
            content_data: sec.draft,
            updated_at: new Date().toISOString(),
            updated_by: userEmail,
            is_published: true
          }, { onConflict: "section_key" });

          await supabase.from("published_content").upsert({
            section_key: sec.key,
            content_data: sec.draft,
            updated_at: new Date().toISOString(),
            updated_by: userEmail,
            is_published: true
          }, { onConflict: "section_key" });

          // Also sync to a specific table site_settings if it exists
          if (sec.isLogo) {
            try {
              await supabase.from("site_settings").upsert({
                id: 1,
                logo_url: sec.draft.logoUrl,
                logo_dark_url: sec.draft.logoDarkUrl,
                favicon_url: sec.draft.faviconUrl,
                logo_alt: sec.draft.logoAlt,
                logo_link: sec.draft.logoLink,
                logo_width_desktop: sec.draft.logoWidthDesktop,
                logo_width_mobile: sec.draft.logoWidthMobile,
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
    setCustomBlocks(pubCustomBlocks);
    setMaterialImages(pubMaterialImages);
    setAbout(pubAbout);
    setTimeline(pubTimeline);
    setCTA(pubCTA);
    setChannels(pubChannels);
    setEconomyCalculator(pubEconomyCalculator);
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
    localStorage.setItem("dodisa_cms_draft_custom_blocks", JSON.stringify(pubCustomBlocks));
    localStorage.setItem("dodisa_cms_draft_material_images", JSON.stringify(pubMaterialImages));
    localStorage.setItem("dodisa_cms_draft_about", JSON.stringify(pubAbout));
    localStorage.setItem("dodisa_cms_draft_timeline", JSON.stringify(pubTimeline));
    localStorage.setItem("dodisa_cms_draft_cta", JSON.stringify(pubCTA));
    localStorage.setItem("dodisa_cms_draft_channels", JSON.stringify(pubChannels));
    localStorage.setItem("dodisa_cms_draft_economy_calculator", JSON.stringify(pubEconomyCalculator));
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
    setCustomBlocks(DEFAULTS.customBlocks);
    setMaterialImages(DEFAULTS.materialImages);
    setAbout(DEFAULTS.about);
    setTimeline(DEFAULTS.timeline);
    setCTA(DEFAULTS.cta);
    setChannels(DEFAULTS.channels);
    setEconomyCalculator(DEFAULTS.economyCalculator);
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
    localStorage.setItem("dodisa_cms_draft_custom_blocks", JSON.stringify(DEFAULTS.customBlocks));
    localStorage.setItem("dodisa_cms_draft_material_images", JSON.stringify(DEFAULTS.materialImages));
    localStorage.setItem("dodisa_cms_draft_about", JSON.stringify(DEFAULTS.about));
    localStorage.setItem("dodisa_cms_draft_timeline", JSON.stringify(DEFAULTS.timeline));
    localStorage.setItem("dodisa_cms_draft_cta", JSON.stringify(DEFAULTS.cta));
    localStorage.setItem("dodisa_cms_draft_channels", JSON.stringify(DEFAULTS.channels));
    localStorage.setItem("dodisa_cms_draft_economy_calculator", JSON.stringify(DEFAULTS.economyCalculator));
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

  // Custom Section Blocks — freeform sections the admin adds/removes from the Landing
  // Page builder, unlike the fixed built-in section types.
  const saveCustomBlocks = (blocks: CustomBlock[]) => {
    setCustomBlocks(blocks);
    markUpdate();
  };
  const addCustomBlock = (): string => {
    const id = `custom-${Date.now()}`;
    const newBlock: CustomBlock = { id, title: "Nova Seção", text: "Edite o texto deste bloco.", image: "", ctaText: "", ctaUrl: "" };
    setCustomBlocks(prev => [...prev, newBlock]);
    markUpdate();
    return id;
  };
  const editCustomBlock = (id: string, partial: Partial<CustomBlock>) => {
    setCustomBlocks(prev => prev.map(b => b.id === id ? { ...b, ...partial } : b));
    markUpdate();
  };
  const deleteCustomBlock = (id: string) => {
    setCustomBlocks(prev => prev.filter(b => b.id !== id));
    markUpdate();
  };

  // Configurator ("Monte seu Container") material photo overrides
  const setMaterialImage = (id: string, url: string) => {
    setMaterialImages((prev) => ({ ...prev, [id]: url }));
    markUpdate();
  };
  const removeMaterialImage = (id: string) => {
    setMaterialImages((prev) => {
      const { [id]: _removed, ...rest } = prev;
      return rest;
    });
    markUpdate();
  };

  // Static-turned-editable sections
  const saveAbout = (newAbout: AboutConfig) => {
    setAbout(newAbout);
    markUpdate();
  };
  const saveTimeline = (newTimeline: TimelineConfig) => {
    setTimeline(newTimeline);
    markUpdate();
  };
  const saveCTA = (newCta: CTAConfig) => {
    setCTA(newCta);
    markUpdate();
  };
  const saveChannels = (newChannels: ChannelsConfig) => {
    setChannels(newChannels);
    markUpdate();
  };
  const saveEconomyCalculator = (newCalc: EconomyCalculatorConfig) => {
    setEconomyCalculator(newCalc);
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

        baseLocation,
        saveBaseLocation,

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
        customBlocks: (isPagePreviewMode || isAdminViewActive) ? (previewDataScope === 'published' ? pubCustomBlocks : customBlocks) : pubCustomBlocks,
        materialImages: (isPagePreviewMode || isAdminViewActive) ? (previewDataScope === 'published' ? pubMaterialImages : materialImages) : pubMaterialImages,
        about: (isPagePreviewMode || isAdminViewActive) ? (previewDataScope === 'published' ? pubAbout : about) : pubAbout,
        timeline: (isPagePreviewMode || isAdminViewActive) ? (previewDataScope === 'published' ? pubTimeline : timeline) : pubTimeline,
        cta: (isPagePreviewMode || isAdminViewActive) ? (previewDataScope === 'published' ? pubCTA : cta) : pubCTA,
        channels: (isPagePreviewMode || isAdminViewActive) ? (previewDataScope === 'published' ? pubChannels : channels) : pubChannels,
        economyCalculator: (isPagePreviewMode || isAdminViewActive) ? (previewDataScope === 'published' ? pubEconomyCalculator : economyCalculator) : pubEconomyCalculator,
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

        saveCustomBlocks,
        addCustomBlock,
        editCustomBlock,
        deleteCustomBlock,

        setMaterialImage,
        removeMaterialImage,

        saveAbout,
        saveTimeline,
        saveCTA,
        saveChannels,
        saveEconomyCalculator,

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
