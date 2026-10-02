export * from "./tokens";

import { palette, staticColors, type ColorScheme, type Colors } from "./tokens";

/** Resolve a paleta completa de um tema, já com as cores fixas. */
export function resolveColors(scheme: ColorScheme): Colors {
  return { ...palette[scheme], ...staticColors };
}
