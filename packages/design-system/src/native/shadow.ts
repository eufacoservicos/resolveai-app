import type { ViewStyle } from "react-native";
import { elevation, type ElevationName } from "../tokens";
import { useTheme } from "./theme";

/**
 * Sombra do protótipo pronta para o estilo de uma View.
 *
 * Usa `boxShadow` em vez do quarteto `shadow*` porque só ele aceita
 * `spread`, e o spread negativo é o que segura a sombra sob o card em
 * vez de vazá-la pelas laterais — exatamente como o Pen desenha.
 */
export function shadow(name: ElevationName, color: string): ViewStyle {
  const { y, blur, spread } = elevation[name];
  return { boxShadow: `0px ${y}px ${blur}px ${spread}px ${color}` };
}

/** A mesma sombra, já com a cor do tema atual. */
export function useShadow(name: ElevationName): ViewStyle {
  const { colors } = useTheme();
  return shadow(name, colors.shadow);
}
