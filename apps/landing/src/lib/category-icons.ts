import {
  Paintbrush,
  Zap,
  Droplets,
  Sparkles,
  HardHat,
  LayoutGrid,
  Hammer,
  Layers,
  GlassWater,
  Shield,
  Ruler,
  Axe,
  Umbrella,
  Building2,
  Wind,
  Tv,
  Camera,
  Wifi,
  SprayCan,
  Bug,
  TreePine,
  Waves,
  Key,
  Armchair,
  Wrench,
  Smartphone,
  Monitor,
  Car,
  CircleDot,
  Scissors,
  Hand,
  Palette,
  Dumbbell,
  Activity,
  Apple,
  Heart,
  Stethoscope,
  BookOpen,
  Music,
  Languages,
  Navigation,
  CookingPot,
  Cake,
  UtensilsCrossed,
  Wine,
  Disc3,
  CameraIcon,
  PartyPopper,
  CarFront,
  Truck,
  Package,
  Bike,
  Calculator,
  Scale,
  FileText,
  PenTool,
  Globe,
  Share2,
  PawPrint,
  Footprints,
  Bath,
  Dog,
  Shirt,
  Footprints as Shoe,
  WashingMachine,
  Flame,
  CircleHelp,
  Compass,
  Lamp,
} from "lucide-react";
import type React from "react";

export const categoryIconMap: Record<string, React.ElementType> = {
  // Construção e Reformas
  pintor: Paintbrush,
  eletricista: Zap,
  encanador: Droplets,
  diarista: Sparkles,
  pedreiro: HardHat,
  gesseiro: Layers,
  azulejista: GlassWater,
  vidraceiro: Shield,
  serralheiro: Hammer,
  marceneiro: Ruler,
  carpinteiro: Axe,
  impermeabilizador: Umbrella,
  "mestre-de-obras": Building2,
  arquiteto: Compass,
  "engenheiro-civil": HardHat,
  "designer-de-interiores": Lamp,
  paisagista: TreePine,

  // Instalações
  "instalador-ar-condicionado": Wind,
  "instalador-tv-antenas": Tv,
  "instalador-cameras": Camera,
  "instalador-redes": Wifi,

  // Limpeza e Manutenção
  faxineira: SprayCan,
  "lavador-estofados": Armchair,
  dedetizador: Bug,
  jardineiro: TreePine,
  piscineiro: Waves,

  // Serviços Gerais
  chaveiro: Key,
  "montador-moveis": Wrench,

  // Reparos Técnicos
  "tecnico-eletrodomesticos": Wrench,
  "tecnico-celular": Smartphone,
  "tecnico-informatica": Monitor,

  // Automotivo
  mecanico: Car,
  "eletricista-automotivo": CircleDot,
  borracheiro: CircleDot,

  // Beleza
  cabeleireira: Scissors,
  manicure: Hand,
  maquiadora: Palette,
  barbeiro: Scissors,
  "designer-sobrancelhas": PenTool,
  esteticista: Sparkles,

  // Saúde e Bem-estar
  massagista: Activity,
  "personal-trainer": Dumbbell,
  fisioterapeuta: Activity,
  nutricionista: Apple,
  "cuidador-idosos": Heart,
  enfermeiro: Stethoscope,

  // Educação
  "professor-particular": BookOpen,
  "professor-musica": Music,
  "professor-idiomas": Languages,
  "instrutor-autoescola": Navigation,

  // Alimentação e Eventos
  cozinheira: CookingPot,
  confeiteira: Cake,
  buffet: UtensilsCrossed,
  bartender: Wine,
  dj: Disc3,
  fotografo: CameraIcon,
  "decorador-festas": PartyPopper,

  // Transporte
  "motorista-particular": CarFront,
  freteiro: Truck,
  mudancas: Package,
  motoboy: Bike,

  // Profissionais Liberais
  contador: Calculator,
  advogado: Scale,
  despachante: FileText,

  // Digital
  "designer-grafico": PenTool,
  "desenvolvedor-sites": Globe,
  "social-media": Share2,

  // Pet
  "pet-sitter": PawPrint,
  "dog-walker": Footprints,
  "banho-tosa": Bath,
  veterinario: Stethoscope,

  // Outros Serviços
  costureira: Shirt,
  sapateiro: Shoe,
  lavanderia: WashingMachine,
  soldador: Flame,
  outros: CircleHelp,

  // Parent category groups
  "construcao-reformas": HardHat,
  "instalacoes": Zap,
  "limpeza-organizacao": Sparkles,
  "manutencao-reparos": Wrench,
  "beleza-estetica": Scissors,
  "saude-bem-estar": Heart,
  "educacao-aulas": BookOpen,
  "eventos-gastronomia": PartyPopper,
  "transporte-mudancas": Truck,
  "servicos-profissionais": FileText,
  "pets": PawPrint,
  "outros-servicos": CircleHelp,
};

export function getCategoryIcon(slug: string): React.ElementType {
  return categoryIconMap[slug] || LayoutGrid;
}
