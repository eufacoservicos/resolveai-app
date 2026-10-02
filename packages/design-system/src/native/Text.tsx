import { Text as RNText, type TextProps as RNTextProps, type TextStyle } from "react-native";
import { fontSize, letterSpacing, lineHeight, type ColorToken } from "../tokens";
import { nativeFonts } from "./fonts";
import { useTheme } from "./theme";

/**
 * Papéis de texto do produto. Escolha pelo papel, não pelo tamanho.
 *
 * Cada papel reproduz um estilo de texto do documento Pen, incluindo os
 * meios-pontos: o protótipo usa 11,5 e 12,5 como corpos diferentes no
 * mesmo card, e arredondar os dois para o mesmo valor achata a hierarquia.
 */
export type TextVariant =
  | "h1"
  | "h2"
  | "h3"
  | "screenTitle"
  | "title"
  | "titleSm"
  | "initials"
  | "initialsLg"
  | "body"
  | "bodyStrong"
  | "bodySm"
  | "chip"
  | "label"
  | "labelStrong"
  | "caption"
  | "captionStrong"
  | "micro"
  | "microStrong";

const variants: Record<TextVariant, TextStyle> = {
  /** Headline da tela. */
  h1: {
    fontFamily: nativeFonts.displayExtraBold,
    fontSize: fontSize["3xl"],
    letterSpacing: letterSpacing.headline,
    lineHeight: fontSize["3xl"] * lineHeight.headline,
  },
  /** Título de bloco destacado, hero de folha. */
  h2: {
    fontFamily: nativeFonts.displayExtraBold,
    fontSize: fontSize.xl,
    letterSpacing: letterSpacing.tight,
    lineHeight: fontSize.xl * lineHeight.tight,
  },
  /** Cabeçalho de seção. */
  h3: {
    fontFamily: nativeFonts.displayBold,
    fontSize: fontSize.lg,
    letterSpacing: letterSpacing.snug,
    lineHeight: fontSize.lg * lineHeight.tight,
  },
  /** Título centralizado da app bar. */
  screenTitle: {
    fontFamily: nativeFonts.displayBold,
    fontSize: fontSize.lg,
    letterSpacing: letterSpacing.subtle,
    lineHeight: fontSize.lg * lineHeight.tight,
  },
  /** Nome do profissional em card de lista. */
  title: {
    fontFamily: nativeFonts.displayBold,
    fontSize: fontSize.md,
    letterSpacing: letterSpacing.subtle,
    lineHeight: fontSize.md * lineHeight.snug,
  },
  /** Nome em card compacto e em linha de avaliação. */
  titleSm: {
    fontFamily: nativeFonts.displayBold,
    fontSize: fontSize.name,
    lineHeight: fontSize.name * lineHeight.snug,
  },
  /** Iniciais no avatar de 38 px. */
  initials: {
    fontFamily: nativeFonts.displayBold,
    fontSize: fontSize.chip,
  },
  /** Iniciais no avatar de 70 px. */
  initialsLg: {
    fontFamily: nativeFonts.displayBold,
    fontSize: fontSize["2xl"],
  },
  body: {
    fontFamily: nativeFonts.bodyRegular,
    fontSize: fontSize.base,
    lineHeight: fontSize.base * lineHeight.normal,
  },
  bodyStrong: {
    fontFamily: nativeFonts.bodySemiBold,
    fontSize: fontSize.base,
    lineHeight: fontSize.base * lineHeight.snug,
  },
  /** Texto corrido denso: comentários e descrições dentro de cards. */
  bodySm: {
    fontFamily: nativeFonts.bodyRegular,
    fontSize: fontSize.chip,
    lineHeight: fontSize.chip * lineHeight.normal,
  },
  /** Rótulo de chip de categoria e de botão pequeno. */
  chip: {
    fontFamily: nativeFonts.bodySemiBold,
    fontSize: fontSize.chip,
    lineHeight: fontSize.chip * lineHeight.snug,
  },
  /** Rótulo de campo, categoria e link "Ver todos". */
  label: {
    fontFamily: nativeFonts.bodySemiBold,
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * lineHeight.snug,
  },
  /** Nota de avaliação e valores dentro de uma linha de metadados. */
  labelStrong: {
    fontFamily: nativeFonts.bodyBold,
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * lineHeight.snug,
  },
  /** Metadado e legenda — o corpo pequeno mais usado do app. */
  caption: {
    fontFamily: nativeFonts.bodyRegular,
    fontSize: fontSize.caption,
    lineHeight: fontSize.caption * lineHeight.snug,
  },
  captionStrong: {
    fontFamily: nativeFonts.bodySemiBold,
    fontSize: fontSize.caption,
    lineHeight: fontSize.caption * lineHeight.snug,
  },
  /** Selo sobre foto e rótulo da tab bar. */
  micro: {
    fontFamily: nativeFonts.bodySemiBold,
    fontSize: fontSize.micro,
    lineHeight: fontSize.micro * lineHeight.snug,
  },
  microStrong: {
    fontFamily: nativeFonts.bodyBold,
    fontSize: fontSize.micro,
    lineHeight: fontSize.micro * lineHeight.snug,
  },
};

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  /** Nome de um token de cor. Evita hex solto no componente. */
  color?: ColorToken;
}

export function Text({ variant = "body", color = "textPrimary", style, ...rest }: TextProps) {
  const { colors } = useTheme();
  return <RNText style={[variants[variant], { color: colors[color] }, style]} {...rest} />;
}
