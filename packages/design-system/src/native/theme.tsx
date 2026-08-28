import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useColorScheme } from "react-native";
import {
  fonts,
  fontSize,
  fontWeight,
  layout,
  minTouchTarget,
  radii,
  spacing,
  type ColorScheme,
  type Colors,
} from "../tokens";
import { resolveColors } from "../index";

export interface Theme {
  scheme: ColorScheme;
  colors: Colors;
  spacing: typeof spacing;
  radii: typeof radii;
  fonts: typeof fonts;
  fontSize: typeof fontSize;
  fontWeight: typeof fontWeight;
  layout: typeof layout;
  minTouchTarget: typeof minTouchTarget;
}

const ThemeContext = createContext<Theme | null>(null);

export interface ThemeProviderProps {
  children: ReactNode;
  /** Força um tema. Sem isso, segue o tema do sistema. */
  scheme?: ColorScheme;
}

export function ThemeProvider({ children, scheme: forced }: ThemeProviderProps) {
  const system = useColorScheme();
  const scheme: ColorScheme = forced ?? (system === "dark" ? "dark" : "light");

  const value = useMemo<Theme>(
    () => ({
      scheme,
      colors: resolveColors(scheme),
      spacing,
      radii,
      fonts,
      fontSize,
      fontWeight,
      layout,
      minTouchTarget,
    }),
    [scheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  const theme = useContext(ThemeContext);
  if (!theme) {
    throw new Error(
      "useTheme foi chamado fora do ThemeProvider. Envolva a árvore em <ThemeProvider> (normalmente em app/_layout.tsx).",
    );
  }
  return theme;
}
