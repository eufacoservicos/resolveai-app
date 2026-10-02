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

/**
 * Escala tipográfica das telas do Pen.
 *
 * O protótipo trabalha em meios-pontos: 11,5 e 12,5 são corpos
 * distintos e aparecem lado a lado no mesmo card. Os apelidos de
 * camiseta cobrem a escala principal; os nomes por papel cobrem os
 * degraus intermediários, que existem para um uso específico.
 */
export const fontSize = {
  /** Selos sobre foto e rótulos da tab bar. */
  micro: 9.5,
  /** Rótulo do stat card. */
  mini: 10.5,
  /** Datas e contadores de avaliação. */
  xs: 11,
  /** Legendas e metadados — o corpo pequeno mais usado do app. */
  caption: 11.5,
  /** Texto auxiliar de banner e apoio de bloco. */
  note: 12,
  /** Rótulos, links de seção e categorias. */
  sm: 12.5,
  /** Chips, listas densas e comentários. */
  chip: 13,
  /** Nomes em cards compactos. */
  name: 13.5,
  /** Texto corrido. */
  base: 14,
  /** Campos de formulário, busca e nome do card em destaque. */
  field: 14.5,
  /** Títulos de card. */
  md: 15,
  /** Rótulo de botão. */
  button: 15.5,
  /** Subtítulos de bloco. */
  subtitle: 16,
  /** Títulos de seção e da app bar. */
  lg: 17,
  /** Cabeçalho de folha e de diálogo. */
  sheet: 18,
  /** Títulos de destaque. */
  xl: 19,
  /** Número do stat card. */
  stat: 21,
  /** Iniciais grandes de avatar. */
  "2xl": 22,
  /** Headline de tela. */
  "3xl": 25,
  /** Headline de tela vazia e de sucesso. */
  hero: 26,
  /** Títulos da landing. */
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
  /** Headline de tela: o Pen aperta mais que o `tight`. */
  headline: 1.18,
  tight: 1.2,
  /** Rótulo de duas linhas em tile de categoria. */
  compact: 1.25,
  snug: 1.35,
  normal: 1.5,
  relaxed: 1.6,
} as const;

/** Ajuste ótico: quanto maior o corpo, mais negativo o tracking. */
export const letterSpacing = {
  tighter: -0.9,
  /** Headline de tela. */
  headline: -0.8,
  tight: -0.5,
  /** Títulos de seção. */
  snug: -0.3,
  /** Títulos de card e da app bar. */
  subtle: -0.2,
  /** Rótulo de botão. */
  hairline: -0.1,
  normal: 0,
  /** Rótulos de campo e da tab bar. */
  nudge: 0.1,
  wide: 1.4,
  wider: 2.4,
} as const;

/**
 * Sombras do protótipo, em pixels. A cor sai do token `shadow` do tema,
 * que já carrega a opacidade — por isso só a geometria mora aqui.
 *
 * O `spread` é parte do desenho: sem ele a sombra do Pen fica larga
 * demais na base dos cards. Use `useShadow` para montar o estilo.
 */
export const elevation = {
  /** Divisórias e barras coladas no conteúdo. */
  hairline: { y: 1, blur: 3, spread: 0 },
  /** Selos e pílulas soltas. */
  sm: { y: 2, blur: 6, spread: -2 },
  /** Campo de busca. */
  card: { y: 2, blur: 10, spread: -2 },
  /** Card do carrossel de destaque. */
  raised: { y: 4, blur: 14, spread: -4 },
  /** Botão primário. */
  button: { y: 6, blur: 16, spread: -4 },
  /** Painel de cabeçalho da Home. */
  panel: { y: 6, blur: 20, spread: -6 },
  /** Tab bar flutuante. */
  bar: { y: 8, blur: 24, spread: -4 },
  /** Bottom sheet. */
  sheet: { y: 8, blur: 24, spread: -6 },
  /** Diálogo modal. */
  modal: { y: 20, blur: 50, spread: -12 },
} as const;

export type ElevationName = keyof typeof elevation;

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
