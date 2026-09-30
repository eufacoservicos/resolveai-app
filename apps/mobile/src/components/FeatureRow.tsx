import { Text, fontSize, lineHeight, useTheme } from "@eufaco/design-system/native";
import { CircleAlert, CircleCheck, X } from "lucide-react-native";
import { View } from "react-native";

/** Os três estados que o Pen usa numa lista de recursos de plano. */
export type FeatureTone = "included" | "limited" | "missing" | "highlight";

interface Props {
  label: string;
  tone?: FeatureTone;
}

/**
 * Item de lista de recursos: ícone de 15 e uma linha de texto.
 * O ícone conta o estado — check verde, alerta âmbar ou x apagado.
 */
export function FeatureRow({ label, tone = "included" }: Props) {
  const { colors } = useTheme();

  const Icon = tone === "missing" ? X : tone === "limited" ? CircleAlert : CircleCheck;
  const tint =
    tone === "missing"
      ? colors.textMuted
      : tone === "limited"
        ? colors.accent
        : tone === "highlight"
          ? colors.primary
          : colors.success;

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 9 }}>
      <Icon size={15} color={tint} />
      <Text
        color="textSecondary"
        style={{ flex: 1, fontSize: fontSize.sm, lineHeight: fontSize.sm * lineHeight.snug }}
      >
        {label}
      </Text>
    </View>
  );
}
