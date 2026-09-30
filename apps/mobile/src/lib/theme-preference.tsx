import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ColorScheme } from "@eufaco/design-system";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useColorScheme } from "react-native";

const STORAGE_KEY = "eufaco.theme";

/** `null` significa "seguir o sistema", que é o padrão. */
type Preference = ColorScheme | null;

interface State {
  /** Tema em vigor, já resolvido contra o do sistema. */
  scheme: ColorScheme;
  preference: Preference;
  /** Alterna claro/escuro e grava a escolha. */
  toggle: () => void;
}

const ThemePreferenceContext = createContext<State | null>(null);

/**
 * Preferência de tema da pessoa.
 *
 * O protótipo põe um botão de lua na app bar do Perfil, então a escolha
 * precisa sobreviver ao fechamento do app — daí o AsyncStorage. Sem
 * escolha gravada, o app continua seguindo o tema do sistema.
 */
export function ThemePreferenceProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const [preference, setPreference] = useState<Preference>(null);

  useEffect(() => {
    let active = true;
    void AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (active && (stored === "light" || stored === "dark")) setPreference(stored);
    });
    return () => {
      active = false;
    };
  }, []);

  const scheme: ColorScheme = preference ?? (system === "dark" ? "dark" : "light");

  const toggle = useCallback(() => {
    const next: ColorScheme = scheme === "dark" ? "light" : "dark";
    setPreference(next);
    void AsyncStorage.setItem(STORAGE_KEY, next);
  }, [scheme]);

  const value = useMemo<State>(() => ({ scheme, preference, toggle }), [scheme, preference, toggle]);

  return (
    <ThemePreferenceContext.Provider value={value}>{children}</ThemePreferenceContext.Provider>
  );
}

export function useThemePreference(): State {
  const state = useContext(ThemePreferenceContext);
  if (!state) {
    throw new Error("useThemePreference foi chamado fora do ThemePreferenceProvider.");
  }
  return state;
}
