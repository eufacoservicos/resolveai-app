/**
 * Design tokens do eufaço!
 *
 * Fonte da verdade: documento Pen `eufaco-app`, seção de variáveis.
 * Qualquer cor, raio ou espaçamento usado no app ou na landing sai daqui.
 * Nunca escreva um hex direto num componente.
 */

/** Paleta clara e escura. As chaves são idênticas nos dois temas. */
export const palette = {
  light: {
    bg: "#F5F8FC",
    surface: "#FFFFFF",
    surface2: "#EEF3F9",
    surface3: "#E3EBF4",
    border: "#E2EAF3",
    borderStrong: "#CBD8E6",
    textPrimary: "#0B1421",
    textSecondary: "#54677F",
    textMuted: "#8698AF",
    primary: "#0EA5E9",
    primaryStrong: "#0273AB",
    primarySoft: "#E1F3FD",
    onPrimary: "#FFFFFF",
    accent: "#F59E0B",
    accentSoft: "#FEF3DC",
    success: "#0F9D6E",
    successSoft: "#DCF5EC",
    danger: "#E23D3D",
    dangerSoft: "#FDE7E7",
    whatsapp: "#1FB855",
    shadow: "#0B142112",
    overlay: "#0B1421A6",
  },
  dark: {
    bg: "#070C14",
    surface: "#111A25",
    surface2: "#18232F",
    surface3: "#1F2C3A",
    border: "#22303F",
    borderStrong: "#2E3E4F",
    textPrimary: "#F2F6FA",
    textSecondary: "#9DB0C6",
    textMuted: "#63768C",
    primary: "#38BDF8",
    primaryStrong: "#7DD3FC",
    primarySoft: "#0C2C40",
    onPrimary: "#04212F",
    accent: "#FBBF24",
    accentSoft: "#3A2C0C",
    success: "#34D399",
    successSoft: "#0B2E24",
    danger: "#F87171",
    dangerSoft: "#3A1616",
    whatsapp: "#25D366",
    shadow: "#00000055",
    overlay: "#000000C4",
  },
} as const;

/**
 * Cores que não mudam com o tema.
 * `ink` é o fundo escuro fixo usado em seções de credibilidade da landing
 * e na lock screen das notificações.
 */
export const staticColors = {
  ink: "#0A1220",
  ink2: "#141F30",
  onInk: "#F2F6FA",
  onInkMuted: "#8DA2BC",
} as const;

export type ColorScheme = keyof typeof palette;
export type ColorName = keyof (typeof palette)["light"];
export type StaticColorName = keyof typeof staticColors;

/**
 * Paleta resolvida de um tema. Os valores são `string` de propósito:
 * o tipo descreve o contrato de cores, não os hexadecimais de um tema.
 */
export type Colors = Record<ColorName | StaticColorName, string>;

/** Escala de espaçamento. Múltiplos de 4. */
export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;

/** Raios de canto. `full` produz cápsula em qualquer altura. */
export const radii = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  full: 999,
} as const;

export const fonts = {
  /** Títulos, botões e números. */
  display: "Plus Jakarta Sans",
  /** Texto corrido, rótulos e campos. */
  body: "Inter",
} as const;

/** Escala tipográfica derivada das telas do Pen. */
export const fontSize = {
  xs: 11,
  sm: 12.5,
  base: 14,
  md: 15,
  lg: 17,
  xl: 19,
  "2xl": 22,
  "3xl": 25,
  "4xl": 30,
  "5xl": 38,
} as const;

export const fontWeight = {
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
  extrabold: "800",
} as const;

export const lineHeight = {
  tight: 1.2,
  snug: 1.35,
  normal: 1.5,
  relaxed: 1.6,
} as const;

/** Ajuste ótico: quanto maior o corpo, mais negativo o tracking. */
export const letterSpacing = {
  tighter: -0.9,
  tight: -0.3,
  normal: 0,
  wide: 1.4,
  wider: 2.4,
} as const;

/** Alvo mínimo de toque recomendado pelas diretrizes de acessibilidade. */
export const minTouchTarget = 44;

export const layout = {
  /** Respiro horizontal padrão das telas. */
  screenPadding: spacing[4],
  /** Distância entre blocos de conteúdo distintos. */
  sectionGap: spacing[6],
  /** Distância entre itens relacionados. */
  itemGap: spacing[3],
} as const;

/** Qualquer cor utilizável num componente, incluindo as fixas. */
export type ColorToken = keyof Colors;
