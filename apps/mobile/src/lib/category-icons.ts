import {
  AirVent,
  Baby,
  Bug,
  Camera,
  Car,
  Dog,
  Droplets,
  Dumbbell,
  Hammer,
  Hand,
  HardHat,
  Heart,
  HeartPulse,
  Leaf,
  Lock,
  Monitor,
  Music,
  Paintbrush,
  PaintRoller,
  Ruler,
  Scissors,
  Shirt,
  Sparkles,
  Truck,
  Utensils,
  Wrench,
  Zap,
} from "lucide-react-native";
import type { ComponentType } from "react";

type Icon = ComponentType<{ size?: number; color?: string }>;

/**
 * Ícone por categoria de serviço.
 *
 * O mapa vive no app porque `lucide-react-native` não roda na web da
 * landing, que usa `lucide-react`. O que é compartilhado são os slugs,
 * em packages/shared.
 */
const BY_SLUG: Record<string, Icon> = {
  // Construção e reformas
  pedreiro: Hammer,
  pintor: Paintbrush,
  gesseiro: HardHat,
  azulejista: HardHat,
  marceneiro: Ruler,
  carpinteiro: Ruler,
  serralheiro: Hammer,
  vidraceiro: Hammer,
  arquiteto: Ruler,
  "engenheiro-civil": HardHat,
  "designer-de-interiores": Ruler,
  paisagista: Leaf,
  "mestre-de-obras": HardHat,
  impermeabilizador: Droplets,

  // Instalações
  eletricista: Zap,
  encanador: Droplets,
  "instalador-ar-condicionado": AirVent,
  "instalador-tv-antenas": Monitor,
  "instalador-cameras": Camera,
  "instalador-redes": Monitor,

  // Limpeza
  diarista: Sparkles,
  faxineira: Sparkles,
  "lavador-estofados": Droplets,
  dedetizador: Bug,
  jardineiro: Leaf,
  piscineiro: Droplets,

  // Manutenção
  chaveiro: Lock,
  "montador-moveis": Wrench,
  "tecnico-eletrodomesticos": Wrench,
  "tecnico-celular": Monitor,
  "tecnico-informatica": Monitor,
  mecanico: Car,
  "eletricista-automotivo": Car,
  borracheiro: Car,

  // Beleza
  cabeleireira: Scissors,
  manicure: Hand,
  maquiadora: Sparkles,
  barbeiro: Scissors,
  "designer-sobrancelhas": Scissors,
  esteticista: Sparkles,
  massagista: HeartPulse,

  // Saúde
  "personal-trainer": Dumbbell,
  fisioterapeuta: Heart,
  nutricionista: Utensils,
  "cuidador-idosos": Heart,
  enfermeiro: Heart,

  // Educação
  "professor-particular": Monitor,
  "professor-musica": Music,
  "professor-idiomas": Monitor,
  "instrutor-autoescola": Car,

  // Eventos
  cozinheira: Utensils,
  confeiteira: Utensils,
  buffet: Utensils,
  bartender: Utensils,
  dj: Music,
  fotografo: Camera,
  "decorador-festas": Sparkles,

  // Transporte
  "motorista-particular": Car,
  freteiro: Truck,
  mudancas: Truck,
  motoboy: Truck,

  // Pets e outros
  "pet-sitter": Dog,
  "dog-walker": Dog,
  "banho-tosa": Dog,
  veterinario: Dog,
  costureira: Shirt,
  sapateiro: Shirt,
  lavanderia: Shirt,
  babá: Baby,
};

/** Ícone da categoria, com a chave inglesa como padrão neutro. */
export function iconForCategory(slug: string | null | undefined): Icon {
  if (!slug) return Wrench;
  return BY_SLUG[slug] ?? Wrench;
}
