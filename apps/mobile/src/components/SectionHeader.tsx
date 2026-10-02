import { Text, useTheme } from "@eufaco/design-system/native";
import { ChevronRight } from "lucide-react-native";
import { Pressable, View } from "react-native";

interface Props {
  title: string;
  /** Linha de apoio sob o título, como no bloco de recomendados. */
  subtitle?: string;
  /** Rótulo do link à direita. Sem ele o cabeçalho fica só com o título. */
  actionLabel?: string;
  onAction?: () => void;
}

/** Cabeçalho de seção do Pen: título à esquerda, link "Ver todos" à direita. */
export function SectionHeader({ title, subtitle, actionLabel, onAction }: Props) {
  const { colors } = useTheme();

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
      }}
    >
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="h3">{title}</Text>
        {subtitle ? (
          <Text variant="caption" color="textMuted">
            {subtitle}
          </Text>
        ) : null}
      </View>

      {actionLabel ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${actionLabel}: ${title}`}
          onPress={onAction}
          hitSlop={8}
          style={({ pressed }) => ({
            flexDirection: "row",
            alignItems: "center",
            gap: 2,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text variant="label" color="primaryStrong">
            {actionLabel}
          </Text>
          <ChevronRight size={14} color={colors.primaryStrong} />
        </Pressable>
      ) : null}
    </View>
  );
}
