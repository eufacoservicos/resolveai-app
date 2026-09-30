import {
  Text,
  fontSize,
  lineHeight,
  nativeFonts,
  useShadow,
  useTheme,
} from "@eufaco/design-system/native";
import { Check, MapPin, MessageCircle, Sparkles, Star } from "lucide-react-native";
import type { ComponentType } from "react";
import { Modal, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type SortOption = "distance" | "rating" | "reviews" | "recent";

interface Option {
  value: SortOption;
  label: string;
  hint: string;
  icon: ComponentType<{ size?: number; color?: string }>;
}

const OPTIONS: Option[] = [
  { value: "distance", label: "Mais próximos", hint: "Do mais perto ao mais distante", icon: MapPin },
  { value: "rating", label: "Melhor avaliados", hint: "Maior nota média primeiro", icon: Star },
  { value: "reviews", label: "Mais avaliados", hint: "Quem tem mais avaliações", icon: MessageCircle },
  { value: "recent", label: "Mais recentes", hint: "Cadastrados há menos tempo", icon: Sparkles },
];

export const SORT_LABELS: Record<SortOption, string> = {
  distance: "Distância",
  rating: "Avaliação",
  reviews: "Nº avaliações",
  recent: "Recentes",
};

interface Props {
  visible: boolean;
  value: SortOption;
  /** Ordenar por distância exige localização por GPS. */
  distanceEnabled: boolean;
  onClose: () => void;
  onSelect: (option: SortOption) => void;
}

export function SortSheet({ visible, value, distanceEnabled, onClose, onSelect }: Props) {
  const { colors, radii, layout } = useTheme();
  const insets = useSafeAreaInsets();
  const sheetShadow = useShadow("sheet");

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Fechar"
        onPress={onClose}
        style={{ flex: 1, backgroundColor: colors.overlay }}
      />

      <View
        style={[
          {
            backgroundColor: colors.surface,
            borderTopLeftRadius: 26,
            borderTopRightRadius: 26,
            paddingTop: 10,
            paddingHorizontal: layout.screenPadding,
            paddingBottom: Math.max(insets.bottom, 26),
            gap: 16,
          },
          sheetShadow,
        ]}
      >
        <View style={{ alignItems: "center" }}>
          <View style={{ width: 38, height: 4, borderRadius: 2, backgroundColor: colors.borderStrong }} />
        </View>

        <Text
          variant="h2"
          style={{
            fontSize: fontSize.sheet,
            letterSpacing: -0.4,
            lineHeight: fontSize.sheet * lineHeight.tight,
          }}
        >
          Ordenar por
        </Text>

        <View style={{ gap: 6 }}>
          {OPTIONS.map((option) => {
            const selected = value === option.value;
            const disabled = option.value === "distance" && !distanceEnabled;

            return (
              <Pressable
                key={option.value}
                accessibilityRole="radio"
                accessibilityState={{ selected, disabled }}
                accessibilityLabel={option.label}
                disabled={disabled}
                onPress={() => {
                  onSelect(option.value);
                  onClose();
                }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  paddingVertical: 13,
                  paddingHorizontal: 14,
                  borderRadius: radii.md,
                  backgroundColor: selected ? colors.primarySoft : "transparent",
                  opacity: disabled ? 0.45 : 1,
                }}
              >
                <View
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 11,
                    backgroundColor: selected ? colors.primary : colors.surface2,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <option.icon size={16} color={selected ? colors.onPrimary : colors.textSecondary} />
                </View>

                <View style={{ flex: 1, gap: 1 }}>
                  <Text
                    style={{
                      fontFamily: selected ? nativeFonts.bodyBold : nativeFonts.bodyMedium,
                      fontSize: fontSize.field,
                      color: colors.textPrimary,
                    }}
                  >
                    {option.label}
                  </Text>
                  <Text variant="caption" color="textMuted">
                    {disabled ? "Escolha sua localização para usar" : option.hint}
                  </Text>
                </View>

                {selected ? <Check size={19} color={colors.primaryStrong} /> : null}
              </Pressable>
            );
          })}
        </View>
      </View>
    </Modal>
  );
}
