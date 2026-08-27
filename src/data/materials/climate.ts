import { Snowflake, Wind, AirVent, Fan } from "lucide-react";
import type { MaterialItem } from "./types";

export const CLIMATE_ITEMS: MaterialItem[] = [
  {
    id: "ac-prep",
    name: "Preparação para AC",
    category: "climate",
    shortDescription: "Infraestrutura pronta para instalar depois",
    icon: AirVent,
    features: ["Furação e suporte prontos", "Instala quando quiser"],
    available: true,
  },
  {
    id: "ac-installed",
    name: "Ar-condicionado Instalado",
    category: "climate",
    shortDescription: "Split pronto para uso",
    icon: Snowflake,
    features: ["Climatização imediata", "Instalação inclusa"],
    available: true,
    premium: true,
    recommendedFor: ["escritorio", "administrativo", "salatecnica"],
  },
  {
    id: "ventilation",
    name: "Ventilação Natural",
    category: "climate",
    shortDescription: "Aberturas de ventilação cruzada",
    icon: Wind,
    features: ["Baixo custo", "Reduz calor interno"],
    available: true,
    recommendedFor: ["deposito", "almoxarifado"],
  },
  {
    id: "exhaust",
    name: "Exaustor",
    category: "climate",
    shortDescription: "Renovação forçada de ar",
    icon: Fan,
    features: ["Ideal para áreas úmidas", "Reduz odor e umidade"],
    available: true,
    recommendedFor: ["sanitario", "oficina"],
  },
];
