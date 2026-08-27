import type { MaterialItem } from "./types";

export const STRUCTURE_OPTIONS: MaterialItem[] = [
  {
    id: "novo",
    name: "Container Novo",
    category: "structure",
    shortDescription: "1ª viagem, sem uso anterior",
    description: "Container fabricado sob medida, sem histórico de uso. Melhor acabamento estrutural e maior vida útil.",
    features: ["Estrutura impecável", "Maior vida útil", "Ideal para projetos permanentes"],
    available: true,
    premium: true,
  },
  {
    id: "seminovo",
    name: "Container Seminovo",
    category: "structure",
    shortDescription: "Revisado e certificado",
    description: "Container usado, totalmente revisado (estrutura, solda e estanqueidade) antes da customização.",
    features: ["Custo-benefício", "Revisão estrutural completa", "Entrega mais rápida"],
    available: true,
  },
  {
    id: "reforcada",
    name: "Estrutura Reforçada",
    category: "structure",
    shortDescription: "Reforço estrutural para uso intenso",
    description: "Reforços adicionais na estrutura para suportar cargas, vãos maiores de portas/janelas ou uso comercial intenso.",
    features: ["Maior resistência", "Suporta mais aberturas", "Indicado para uso comercial"],
    available: true,
  },
  {
    id: "acoplado",
    name: "Modular / Acoplado",
    category: "structure",
    shortDescription: "Múltiplos módulos conectados",
    description: "Dois ou mais containers unidos, formando ambientes maiores e integrados — projeto sob medida.",
    features: ["Ambientes amplos", "Projeto sob medida", "Escalável"],
    available: true,
    premium: true,
  },
];

export const MODALITIES = ["Compra", "Aluguel"] as const;
export type Modality = (typeof MODALITIES)[number];
