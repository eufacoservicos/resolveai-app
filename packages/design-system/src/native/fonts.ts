/**
 * No React Native a fonte customizada não sintetiza peso: pedir
 * fontWeight "800" numa família que só tem o regular não engorda nada
 * no Android — cai silenciosamente no peso disponível.
 * Por isso cada peso é uma família própria, com o nome exato do arquivo
 * carregado em apps/mobile/app/_layout.tsx.
 */
export const nativeFonts = {
  displayBold: "PlusJakartaSans_700Bold",
  displayExtraBold: "PlusJakartaSans_800ExtraBold",
  bodyRegular: "Inter_400Regular",
  bodyMedium: "Inter_500Medium",
  bodySemiBold: "Inter_600SemiBold",
  bodyBold: "Inter_700Bold",
} as const;

export type NativeFont = (typeof nativeFonts)[keyof typeof nativeFonts];
