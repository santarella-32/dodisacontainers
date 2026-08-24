import { ContainerItem, Project, Testimonial, ProcessStep } from "./types";

export const CUSTOMER_WHATSAPP_NUMBER = "5555991667786"; 

export const APP_INFO = {
  phone: "(55) 99166-7786",
  whatsapp: "+55 (55) 99166-7786",
  instagram: "@dodisa_containers",
  instagramUrl: "https://instagram.com/dodisa_containers",
  email: "contato@dodisa.com.br",
  address: "Rua Julio Gaviragui, Santa Rosa, Rio Grande do Sul, Brasil - CEP: 98790-146",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Rua+Julio+Gaviragui,+Santa+Rosa,+RS,+98790-146",
  cnpj: "00.000.000/0001-00", // TODO: substituir pelo CNPJ real da Dodisa
  workingHours: "Segunda a Sexta, das 08:00 às 18:00",
};

export const CONTAINERS_DATA: ContainerItem[] = [
  {
    id: "deposito",
    title: "Container Depósito Blindado d-20",
    category: "Depósito",
    description: "Altíssima segurança para armazenamento de ferramentas, insumos, e maquinários em canteiros de obra ou galpões fabris.",
    specs: [
      "Aço corten reforçado e pintura marítima premium",
      "Duas portas traseiras de abertura total com trinco anti-vandalismo",
      "Piso compensado naval de 18mm antiderrapante",
      "Ponto de fixação de cadeado reforçado e proteção de chave"
    ],
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80",
    whatsappMsg: "Olá! Gostaria de mais informações e um orçamento para o Container Depósito Blindado d-20."
  },
  {
    id: "escritorio",
    title: "Container Escritório Premium e-30",
    category: "Escritório",
    description: "Ambiente corporativo projetado para canteiros de obra, plantões de venda e salas de supervisão totalmente isoladas.",
    specs: [
      "Isolamento térmico e acústico com lã de rocha de alta densidade",
      "Janelas de alumínio de correr de alta vedação",
      "Instalação elétrica completa: lâmpadas LED, tomadas e disjuntores",
      "Suporte embutido para ar-condicionado split com fiação dedicada"
    ],
    image: "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=800&q=80",
    whatsappMsg: "Olá! Quero um orçamento para o Container Escritório Premium e-30."
  },
  {
    id: "banheiro",
    title: "Container Banheiro e Sanitário b-15",
    category: "Banheiro",
    description: "Unidade sanitária premium com excelentes acabamentos e conexões descomplicadas de esgoto e água encanada.",
    specs: [
      "Vasos sanitários com caixa acoplada de descarga dual eco",
      "Chuveiros elétricos de alta vazão pré-instalados",
      "Cubas lavatórias em cerâmica com torneiras metálicas robustas",
      "Piso manta vinílica impermeável facilmente lavável"
    ],
    image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80",
    whatsappMsg: "Olá! Gostaria de cotar o Container Banheiro e Sanitário b-15 para o meu projeto."
  },
  {
    id: "vestiario",
    title: "Container Vestiário e Refeitório v-40",
    category: "Vestiário",
    description: "Conforto e dignidade para a equipe operacional. Layout amplo com armários e bancos de madeira nobre maciça.",
    specs: [
      "Janelas venezianas otimizadas para circulação de ar natural",
      "Pontos integrados de drenagem e ralo de limpeza rápida",
      "Piso antiderrapante e divisórias de privacidade de metal",
      "Cabides reforçados soldados e armários numerados"
    ],
    image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80",
    whatsappMsg: "Olá! Favor enviar informações e valores para o Container Vestiário e Refeitório v-40."
  },
  {
    id: "almoxarifado",
    title: "Container Almoxarifado Inteligente a-25",
    category: "Almoxarifado",
    description: "Organização estratégica para estoque de peças, cablagens e itens valiosos com prateleiras e divisórias metálicas soldadas.",
    specs: [
      "Prateleiras modulares ajustáveis de alta carga",
      "Suporte duplo para trincas e cadeados externos integrados",
      "Iluminação LED interna blindada à prova de intempéries",
      "Rampas em aço para carregamento manual de carrinhos e paletes"
    ],
    image: "https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=800&q=80",
    whatsappMsg: "Olá! Gostaria de um orçamento do Container Almoxarifado Inteligente a-25."
  },
  {
    id: "habitacional",
    title: "Container Habitacional Studio h-50",
    category: "Habitacional",
    description: "Módulo residencial completo e compacto. Ideal para alojamentos executivos, pousadas ou moradia temporária de alto nível.",
    specs: [
      "Forro e paredes revestidos em termo-painéis acústicos",
      "Instalação hidro-sanitária e elétrica de altíssimo acabamento",
      "Esquadrias integradas com vidros temperados blindex",
      "Copa americana de apoio e banheiro completo com bancadas"
    ],
    image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80",
    whatsappMsg: "Olá! Solicito detalhes técnicos e orçamento para o Container Habitacional Studio h-50."
  },
  {
    id: "personalizado",
    title: "Projetos Especiais & Modulares Sob Medida",
    category: "Projetos Personalizados",
    description: "Engenharia de precisão para estandes de venda multi-andares, lanchonetes luxuosas, ou sedes empresariais completas.",
    specs: [
      "Equipe interna de arquitetos e engenheiros estruturais",
      "Modularidade inteligente com possibilidade de sobrepor até 3 níveis",
      "Acompanha memorial de cálculo estrutural e ART oficial",
      "Entrega chave na mão com todo projeto de serralheria executora"
    ],
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    whatsappMsg: "Olá! Tenho uma ideia inovadora de container e pretendo fazer um Projeto Personalizado sob medida. Podem me ajudar?"
  }
];

export const DIFFERENTIALS_DATA = [
  {
    title: "Alta Durabilidade",
    description: "Estruturas em liga de aço resistente à corrosão e intempéries duras.",
    icon: "ShieldAlert"
  },
  {
    title: "Estrutura Reforçada",
    description: "Perfis e vigas estruturais robustas unidas em soldagem mig certificada.",
    icon: "Hammer"
  },
  {
    title: "Pronta Entrega",
    description: "Amplo pátio com estoque estratégico para despacho imediato do seu pedido.",
    icon: "Zap"
  },
  {
    title: "Personalização Completa",
    description: "Layouts, vãos, janelas e revestimentos adaptados à sua demanda.",
    icon: "Sliders"
  },
  {
    title: "Transporte Facilitado",
    description: "Padrões dimensionais ISO que facilitam içamento e transporte por caminhão munck.",
    icon: "Truck"
  },
  {
    title: "Excelente Custo Benefício",
    description: "Até 45% mais econômico e 70% mais rápido que construções civis tradicionais.",
    icon: "TrendingUp"
  },
  {
    title: "Atendimento Especializado",
    description: "Consultoria técnica com engenheiros para desenhar a melhor solução operacional.",
    icon: "Users"
  },
  {
    title: "Suporte Pós Venda",
    description: "Compromisso integral em assistência e manutenções adicionais do container.",
    icon: "Wrench"
  }
];

export const PROJECTS_DATA: Project[] = [
  {
    id: "proj1",
    title: "Módulo Administrativo Corporativo",
    category: "Projetos Personalizados",
    imageBefore: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=600&q=80", // Construction state
    imageAfter: "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&w=800&q=80", // Converted container design
    description: "Montagem de conjunto integrado de 4 containers conectados para servir como pátio executivo e administrativo na mineradora.",
    specs: ["Área total: 60m²", "Isolamento acústico total", "Esquadrias blindex sob medida"]
  },
  {
    id: "proj2",
    title: "Almoxarifado e Suporte de Usina",
    category: "Almoxarifado",
    imageBefore: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80",
    imageAfter: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80",
    description: "Estruturas reforçadas em aço escurecido para alojar material eletrônico especializado em usina eólica.",
    specs: ["Controle de temperatura interno", "Serralheria anti-furto especializada", "Prateleiras bipartidas"]
  },
  {
    id: "proj3",
    title: "Estande Comercial de Vendas de Luxo",
    category: "Projetos Personalizados",
    imageBefore: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=600&q=80",
    imageAfter: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    description: "Uma imponente estrutura sobreposta com mezanino e detalhes em madeira para comercialização de loteamentos imobiliários de luxo.",
    specs: ["Terraço de madeira marinizado", "Instalação fotovoltaica sustentável", "Vidreira panorâmica"]
  }
];

export const TESTIMONIALS_DATA: Testimonial[] = [
  {
    id: "t1",
    name: "Eng. Marcos Vinícius",
    role: "Diretor de Obras",
    company: "Construtora AlfaTec",
    content: "Adquirimos 12 containers escritórios e depósitos com a Dodisa. A robustez do aço e os acabamentos internos surpreenderam nossos engenheiros. O pós-venda deles é excelente, entregaram tudo no prazo prometido.",
    rating: 5
  },
  {
    id: "t2",
    name: "Tatiana Rezende",
    role: "Diretora de Logística",
    company: "LogMax Brasil",
    content: "Excelente custo-benefício. Precisávamos expandir nosso almoxarifado de forma ultra rápida devido a um surto nas vendas. A Dodisa montou e entregou os módulos em tempo recorde.",
    rating: 5
  },
  {
    id: "t3",
    name: "Carlos Eduardo Santos",
    role: "Gestor Comercial",
    company: "Grupo MultiPlantas",
    content: "O nosso estande comercial personalizado de três andares modulares virou referência. Fomos muito bem atendidos do desenho inicial CAD à entrega com caminhão munck próprio.",
    rating: 5
  }
];

export const STEPS_DATA: ProcessStep[] = [
  {
    number: 1,
    title: "Você entra em contato",
    description: "Clique em nossos botões de WhatsApp ou preencha nosso formulário em poucos segundos. Um técnico qualificado estará pronto para lhe atender."
  },
  {
    number: 2,
    title: "Entendemos sua necessidade",
    description: "Analisamos as medidas ideais, finalidade (escritório, sanitário, depósito, etc.), locais de entrega e se necessitará de projetos customizados."
  },
  {
    number: 3,
    title: "Montamos a melhor solução",
    description: "Desenvolvemos o layout sob medida e montamos a proposta técnica-comercial com os melhores prazos e as opções de acabamento que você preferir."
  },
  {
    number: 4,
    title: "Entregamos seu container pronto",
    description: "Efetuamos o carregamento especializado, transporte seguro e o içamento cuidadoso na sua obra ou localização. Pronto para usar no mesmo dia!"
  }
];
