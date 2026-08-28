import { Text as RNText, type TextProps as RNTextProps, type TextStyle } from "react-native";
import { fontSize, letterSpacing, lineHeight, type ColorToken } from "../tokens";
import { nativeFonts } from "./fonts";
import { useTheme } from "./theme";

/** Papéis de texto do produto. Escolha pelo papel, não pelo tamanho. */
export type TextVariant =
  | "h1"
  | "h2"
  | "h3"
  | "title"
  | "body"
  | "bodyStrong"
  | "label"
  | "caption";

const variants: Record<TextVariant, TextStyle> = {
  h1: {
    fontFamily: nativeFonts.displayExtraBold,
    fontSize: fontSize["3xl"],
    letterSpacing: letterSpacing.tighter,
    lineHeight: fontSize["3xl"] * lineHeight.tight,
  },
  h2: {
    fontFamily: nativeFonts.displayExtraBold,
    fontSize: fontSize.xl,
    letterSpacing: letterSpacing.tight,
    lineHeight: fontSize.xl * lineHeight.tight,
  },
  h3: {
    fontFamily: nativeFonts.displayBold,
    fontSize: fontSize.lg,
    letterSpacing: letterSpacing.tight,
    lineHeight: fontSize.lg * lineHeight.tight,
  },
  title: {
    fontFamily: nativeFonts.displayBold,
    fontSize: fontSize.md,
    letterSpacing: letterSpacing.tight,
    lineHeight: fontSize.md * lineHeight.snug,
  },
  body: {
    fontFamily: nativeFonts.bodyRegular,
    fontSize: fontSize.base,
    lineHeight: fontSize.base * lineHeight.normal,
  },
  bodyStrong: {
    fontFamily: nativeFonts.bodySemiBold,
    fontSize: fontSize.base,
    lineHeight: fontSize.base * lineHeight.normal,
  },
  label: {
    fontFamily: nativeFonts.bodySemiBold,
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * lineHeight.snug,
  },
  caption: {
    fontFamily: nativeFonts.bodyRegular,
    fontSize: fontSize.xs,
    lineHeight: fontSize.xs * lineHeight.snug,
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
