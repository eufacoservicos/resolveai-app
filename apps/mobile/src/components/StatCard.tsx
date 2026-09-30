import { Text, fontSize, letterSpacing, nativeFonts, useTheme } from "@eufaco/design-system/native";
import type { ComponentType } from "react";
import { View } from "react-native";

interface Props {
  icon: ComponentType<{ size?: number; color?: string }>;
  value: string;
  label: string;
}

/**
 * Cartão de número do Pen (`C / Stat Card`): ícone, valor grande e
 * rótulo. Usado nas linhas de estatística do painel do prestador.
 */
export function StatCard({ icon: Icon, value, label }: Props) {
  const { colors, radii } = useTheme();

  return (
    <View
      style={{
        flex: 1,
        gap: 6,
        padding: 14,
        borderRadius: radii.md,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <Icon size={18} color={colors.primaryStrong} />
      <Text
        variant="h2"
        numberOfLines={1}
        style={{
          fontFamily: nativeFonts.displayBold,
          fontSize: fontSize.stat,
          letterSpacing: letterSpacing.tight,
        }}
      >
        {value}
      </Text>
      <Text
        color="textMuted"
        numberOfLines={1}
        style={{ fontFamily: nativeFonts.bodyMedium, fontSize: fontSize.mini }}
      >
        {label}
      </Text>
    </View>
  );
}
