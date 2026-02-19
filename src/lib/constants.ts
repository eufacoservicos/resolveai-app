export function getWhatsAppUrl(
  phone: string,
  providerName?: string,
  message?: string,
) {
  const cleanPhone = phone.replace(/\D/g, "");
  const defaultMessage = providerName
    ? `Olá, ${providerName}! Encontrei o seu perfil na plataforma *eufaço!* e tenho interesse em solicitar um orçamento. Podemos conversar sobre o serviço?`
    : "Olá! Encontrei o seu perfil na plataforma *eufaço!* e tenho interesse em solicitar um orçamento. Podemos conversar sobre o serviço?";
  const encodedMessage = encodeURIComponent(message ?? defaultMessage);
  return `https://wa.me/55${cleanPhone}?text=${encodedMessage}`;
}

export const MAX_PORTFOLIO_IMAGES = 10;

// Parent category groups for hierarchical filtering
export const CATEGORY_GROUPS = [
  {
    name: "Construção e Reformas",
    slug: "construcao-reformas",
    subcategories: [
      "pedreiro", "pintor", "gesseiro", "azulejista", "vidraceiro",
      "serralheiro", "marceneiro", "carpinteiro", "impermeabilizador", "mestre-de-obras",
    ],
  },
  {
    name: "Instalações",
    slug: "instalacoes",
    subcategories: [
      "eletricista", "encanador", "instalador-ar-condicionado",
      "instalador-tv-antenas", "instalador-cameras", "instalador-redes",
    ],
  },
  {
    name: "Limpeza e Organização",
    slug: "limpeza-organizacao",
    subcategories: [
      "diarista", "faxineira", "lavador-estofados", "dedetizador", "jardineiro", "piscineiro",
    ],
  },
  {
    name: "Manutenção e Reparos",
    slug: "manutencao-reparos",
    subcategories: [
      "chaveiro", "montador-moveis", "tecnico-eletrodomesticos",
      "tecnico-celular", "tecnico-informatica", "mecanico",
      "eletricista-automotivo", "borracheiro",
    ],
  },
  {
    name: "Beleza e Estética",
    slug: "beleza-estetica",
    subcategories: [
      "cabeleireira", "manicure", "maquiadora", "barbeiro",
      "designer-sobrancelhas", "esteticista", "massagista",
    ],
  },
  {
    name: "Saúde e Bem-Estar",
    slug: "saude-bem-estar",
    subcategories: [
      "personal-trainer", "fisioterapeuta", "nutricionista",
      "cuidador-idosos", "enfermeiro",
    ],
  },
  {
    name: "Educação e Aulas",
    slug: "educacao-aulas",
    subcategories: [
      "professor-particular", "professor-musica", "professor-idiomas", "instrutor-autoescola",
    ],
  },
  {
    name: "Eventos e Gastronomia",
    slug: "eventos-gastronomia",
    subcategories: [
      "cozinheira", "confeiteira", "buffet", "bartender", "dj", "fotografo", "decorador-festas",
    ],
  },
  {
    name: "Transporte e Mudanças",
    slug: "transporte-mudancas",
    subcategories: [
      "motorista-particular", "freteiro", "mudancas", "motoboy",
    ],
  },
  {
    name: "Serviços Profissionais",
    slug: "servicos-profissionais",
    subcategories: [
      "contador", "advogado", "despachante", "designer-grafico",
      "desenvolvedor-sites", "social-media",
    ],
  },
  {
    name: "Pets",
    slug: "pets",
    subcategories: [
      "pet-sitter", "dog-walker", "banho-tosa", "veterinario",
    ],
  },
] as const;

// All service categories available in the platform
// These must match the categories seeded in the database
export const SERVICE_CATEGORIES = [
  // Construção e Reformas
  { name: "Pedreiro", slug: "pedreiro" },
  { name: "Pintor", slug: "pintor" },
  { name: "Gesseiro", slug: "gesseiro" },
  { name: "Azulejista", slug: "azulejista" },
  { name: "Vidraceiro", slug: "vidraceiro" },
  { name: "Serralheiro", slug: "serralheiro" },
  { name: "Marceneiro", slug: "marceneiro" },
  { name: "Carpinteiro", slug: "carpinteiro" },
  { name: "Impermeabilizador", slug: "impermeabilizador" },
  { name: "Mestre de Obras", slug: "mestre-de-obras" },

  // Instalações
  { name: "Eletricista", slug: "eletricista" },
  { name: "Encanador", slug: "encanador" },
  { name: "Instalador de Ar-Condicionado", slug: "instalador-ar-condicionado" },
  { name: "Instalador de TV e Antenas", slug: "instalador-tv-antenas" },
  { name: "Instalador de Câmeras", slug: "instalador-cameras" },
  { name: "Instalador de Redes e Internet", slug: "instalador-redes" },

  // Limpeza e Organização
  { name: "Diarista", slug: "diarista" },
  { name: "Faxineira", slug: "faxineira" },
  { name: "Lavador de Estofados", slug: "lavador-estofados" },
  { name: "Dedetizador", slug: "dedetizador" },
  { name: "Jardineiro", slug: "jardineiro" },
  { name: "Piscineiro", slug: "piscineiro" },

  // Manutenção e Reparos
  { name: "Chaveiro", slug: "chaveiro" },
  { name: "Montador de Móveis", slug: "montador-moveis" },
  { name: "Técnico em Eletrodomésticos", slug: "tecnico-eletrodomesticos" },
  { name: "Técnico em Celular", slug: "tecnico-celular" },
  { name: "Técnico em Informática", slug: "tecnico-informatica" },
  { name: "Mecânico", slug: "mecanico" },
  { name: "Eletricista Automotivo", slug: "eletricista-automotivo" },
  { name: "Borracheiro", slug: "borracheiro" },

  // Beleza e Estética
  { name: "Cabeleireira", slug: "cabeleireira" },
  { name: "Manicure", slug: "manicure" },
  { name: "Maquiadora", slug: "maquiadora" },
  { name: "Barbeiro", slug: "barbeiro" },
  { name: "Designer de Sobrancelhas", slug: "designer-sobrancelhas" },
  { name: "Esteticista", slug: "esteticista" },
  { name: "Massagista", slug: "massagista" },

  // Saúde e Bem-Estar
  { name: "Personal Trainer", slug: "personal-trainer" },
  { name: "Fisioterapeuta", slug: "fisioterapeuta" },
  { name: "Nutricionista", slug: "nutricionista" },
  { name: "Cuidador de Idosos", slug: "cuidador-idosos" },
  { name: "Enfermeiro(a)", slug: "enfermeiro" },

  // Educação e Aulas
  { name: "Professor Particular", slug: "professor-particular" },
  { name: "Professor de Música", slug: "professor-musica" },
  { name: "Professor de Idiomas", slug: "professor-idiomas" },
  { name: "Instrutor de Autoescola", slug: "instrutor-autoescola" },

  // Eventos e Gastronomia
  { name: "Cozinheira", slug: "cozinheira" },
  { name: "Confeiteira", slug: "confeiteira" },
  { name: "Buffet", slug: "buffet" },
  { name: "Bartender", slug: "bartender" },
  { name: "DJ", slug: "dj" },
  { name: "Fotógrafo", slug: "fotografo" },
  { name: "Decorador de Festas", slug: "decorador-festas" },

  // Transporte e Mudanças
  { name: "Motorista Particular", slug: "motorista-particular" },
  { name: "Freteiro", slug: "freteiro" },
  { name: "Mudanças", slug: "mudancas" },
  { name: "Motoboy", slug: "motoboy" },

  // Serviços Profissionais
  { name: "Contador", slug: "contador" },
  { name: "Advogado", slug: "advogado" },
  { name: "Despachante", slug: "despachante" },
  { name: "Designer Gráfico", slug: "designer-grafico" },
  { name: "Desenvolvedor de Sites", slug: "desenvolvedor-sites" },
  { name: "Social Media", slug: "social-media" },

  // Pets
  { name: "Pet Sitter", slug: "pet-sitter" },
  { name: "Dog Walker", slug: "dog-walker" },
  { name: "Banho e Tosa", slug: "banho-tosa" },
  { name: "Veterinário", slug: "veterinario" },

  // Outros
  { name: "Costureira", slug: "costureira" },
  { name: "Sapateiro", slug: "sapateiro" },
  { name: "Lavanderia", slug: "lavanderia" },
  { name: "Soldador", slug: "soldador" },
  { name: "Outros", slug: "outros" },
] as const;

// Helper to find which group a subcategory belongs to
export function getCategoryGroup(subcategorySlug: string) {
  return CATEGORY_GROUPS.find((g) =>
    (g.subcategories as readonly string[]).includes(subcategorySlug)
  );
}

// Helper to get subcategories for a group
export function getSubcategorySlugs(groupSlug: string): string[] {
  const group = CATEGORY_GROUPS.find((g) => g.slug === groupSlug);
  return group ? [...group.subcategories] : [];
}

// Helper to check if a slug is in a group's subcategories
export function isInGroup(groupSlug: string, slug: string): boolean {
  const group = CATEGORY_GROUPS.find((g) => g.slug === groupSlug);
  return group ? (group.subcategories as readonly string[]).includes(slug) : false;
}
