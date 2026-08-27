import {
  Utensils, Droplet, Archive, Rows3, ShowerHead, Toilet, Waves,
  Umbrella, Tent, WavesLadder, ShieldCheck, Grid3x3, Blinds, LayoutGrid,
  Image as ImageIcon, Tag, Sofa,
} from "lucide-react";
import type { MaterialItem } from "./types";

export interface ExtraCategory {
  id: string;
  label: string;
  items: MaterialItem[];
}

export const EXTRA_CATEGORIES: ExtraCategory[] = [
  {
    id: "mobiliario",
    label: "Copa & Mobiliário",
    items: [
      { id: "bancada", name: "Bancada", category: "extra", shortDescription: "Bancada de apoio", icon: Utensils, features: [], available: true },
      { id: "pia", name: "Pia", category: "extra", shortDescription: "Ponto de pia com hidráulica", icon: Droplet, features: [], available: true },
      { id: "armarios", name: "Armários", category: "extra", shortDescription: "Armários planejados", icon: Archive, features: [], available: true },
      { id: "divisorias", name: "Divisórias", category: "extra", shortDescription: "Separação de ambientes", icon: Rows3, features: [], available: true },
      { id: "prateleiras", name: "Prateleiras", category: "extra", shortDescription: "Prateleiras de apoio", icon: LayoutGrid, features: [], available: true },
      { id: "mobiliario-geral", name: "Mobiliário", category: "extra", shortDescription: "Mesas e cadeiras sob demanda", icon: Sofa, features: [], available: true },
    ],
  },
  {
    id: "banheiro",
    label: "Banheiro",
    items: [
      { id: "banheiro-completo", name: "Banheiro Completo", category: "extra", shortDescription: "Ambiente hidrossanitário completo", icon: ShowerHead, features: [], available: true },
      { id: "chuveiro", name: "Chuveiro", category: "extra", shortDescription: "Ponto de chuveiro", icon: Waves, features: [], available: true },
      { id: "vaso", name: "Vaso Sanitário", category: "extra", shortDescription: "Instalação hidrossanitária", icon: Toilet, features: [], available: true },
      { id: "lavatorio", name: "Lavatório", category: "extra", shortDescription: "Pia de banheiro", icon: Droplet, features: [], available: true },
    ],
  },
  {
    id: "cobertura",
    label: "Cobertura & Acesso",
    items: [
      { id: "cobertura", name: "Cobertura", category: "extra", shortDescription: "Telhado de proteção", icon: Tent, features: [], available: true },
      { id: "toldo", name: "Toldo", category: "extra", shortDescription: "Proteção solar na entrada", icon: Umbrella, features: [], available: true },
      { id: "escada", name: "Escada", category: "extra", shortDescription: "Acesso elevado", icon: WavesLadder, features: [], available: true },
      { id: "guarda-corpo", name: "Guarda-corpo", category: "extra", shortDescription: "Proteção em desníveis", icon: ShieldCheck, features: [], available: true },
    ],
  },
  {
    id: "seguranca",
    label: "Segurança & Estética",
    items: [
      { id: "grades", name: "Grades", category: "extra", shortDescription: "Proteção de janelas", icon: Grid3x3, features: [], available: true },
      { id: "persianas", name: "Persianas", category: "extra", shortDescription: "Controle de luz e privacidade", icon: Blinds, features: [], available: true },
      { id: "comunicacao-visual", name: "Comunicação Visual", category: "extra", shortDescription: "Placas e sinalização", icon: ImageIcon, features: [], available: true },
      { id: "adesivacao", name: "Adesivação", category: "extra", shortDescription: "Aplicação de adesivo/marca", icon: Tag, features: [], available: true },
      { id: "logotipo", name: "Logotipo", category: "extra", shortDescription: "Aplicação da sua marca", icon: Tag, features: [], available: true },
    ],
  },
];

export const ALL_EXTRAS: MaterialItem[] = EXTRA_CATEGORIES.flatMap((c) => c.items);
