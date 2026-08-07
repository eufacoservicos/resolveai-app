import { View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

/**
 * Fundo ambiente com dois "orbs" de gradient blur.
 * Usado em telas hero, auth e onboarding para dar profundidade.
 * Coloque como primeiro filho de um container `relative` com `overflow-hidden`.
 */
export function AmbientBg({
  variant = "primary",
}: {
  variant?: "primary" | "violet" | "warm";
}) {
  const palettes = {
    primary: ["rgba(34, 211, 238, 0.22)", "rgba(99, 102, 241, 0.20)"],
    violet: ["rgba(139, 92, 246, 0.22)", "rgba(34, 211, 238, 0.18)"],
    warm: ["rgba(251, 191, 36, 0.20)", "rgba(244, 114, 182, 0.18)"],
  } as const;
  const [c1, c2] = palettes[variant];

  return (
    <View pointerEvents="none" className="absolute inset-0">
      <LinearGradient
        colors={[c1, "transparent"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          position: "absolute",
          top: -140,
          left: -140,
          width: 420,
          height: 420,
          borderRadius: 420,
          opacity: 0.9,
        }}
      />
      <LinearGradient
        colors={[c2, "transparent"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          position: "absolute",
          top: 60,
          right: -160,
          width: 380,
          height: 380,
          borderRadius: 380,
          opacity: 0.8,
        }}
      />
    </View>
  );
}
