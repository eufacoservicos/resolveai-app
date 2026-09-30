import { Text, fontSize, useTheme } from "@eufaco/design-system/native";
import { ChevronRight } from "lucide-react-native";
import type { ComponentType } from "react";
import { Pressable, View } from "react-native";

export interface ListRowProps {
  label: string;
  icon: ComponentType<{ size?: number; color?: string }>;
  /** Pinta ícone e rótulo de vermelho, como "Sair da conta" no Pen. */
  danger?: boolean;
  /** Selo à direita do rótulo, antes da seta. */
  badge?: string;
  onPress?: () => void;
}

/**
 * Linha de navegação do Pen (`C / List Row`): disco com ícone, rótulo e
 * seta. É o tijolo das listas de Perfil, Ajustes e Meu negócio.
 */
export function ListRow({ label, icon: Icon, danger = false, badge, onPress }: ListRowProps) {
  const { colors, radii } = useTheme();
  const tint = danger ? colors.danger : colors.textSecondary;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={badge ? `${label}, ${badge}` : label}
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 13,
        paddingHorizontal: 14,
        borderRadius: radii.md,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <View
        style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          backgroundColor: danger ? colors.dangerSoft : colors.surface2,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon size={17} color={tint} />
      </View>

      <Text variant="bodyStrong" color={danger ? "danger" : "textPrimary"} style={{ flex: 1 }}>
        {label}
      </Text>

      {badge ? (
        <View
          style={{
            paddingVertical: 4,
            paddingHorizontal: 9,
            borderRadius: radii.full,
            backgroundColor: colors.surface2,
          }}
        >
          <Text variant="microStrong" color="textSecondary" style={{ fontSize: fontSize.mini }}>
            {badge}
          </Text>
        </View>
      ) : null}

      <ChevronRight size={17} color={colors.textMuted} />
    </Pressable>
  );
}
