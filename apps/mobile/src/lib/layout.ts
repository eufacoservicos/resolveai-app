import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * Barra de abas floating (delivery-style):
 *   [ ---- (barra) ---- ]
 *      ^ bottom = max(insets.bottom, TAB_BAR_MARGIN)
 *
 * Altura interna 64px + margem base 12 = 76.
 * `TAB_BAR_HEIGHT` mantido para compat com código que somava insets.bottom.
 */
export const TAB_BAR_INNER_HEIGHT = 64;
export const TAB_BAR_MARGIN = 12;
export const TAB_BAR_HEIGHT = TAB_BAR_INNER_HEIGHT + TAB_BAR_MARGIN;

/**
 * Espaço a somar no fim de um ScrollView para não passar por baixo da
 * tab bar floating. Passa `extra` para folga extra (padrão 16px).
 */
export function useTabBarPadding(extra = 16) {
  const insets = useSafeAreaInsets();
  return (
    Math.max(insets.bottom, TAB_BAR_MARGIN) + TAB_BAR_INNER_HEIGHT + extra
  );
}
