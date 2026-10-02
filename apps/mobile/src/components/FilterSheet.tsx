import {
  Button,
  Text,
  Toggle,
  fontSize,
  letterSpacing,
  lineHeight,
  nativeFonts,
  useShadow,
  useTheme,
} from "@eufaco/design-system/native";
import { Star, X } from "lucide-react-native";
import { useState } from "react";
import { Modal, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export interface SearchFilters {
  minRating: number;
  providerType: "all" | "individual" | "company";
  openNow: boolean;
  onlyWithOffer: boolean;
  radiusKm: number;
}

export const DEFAULT_FILTERS: SearchFilters = {
  minRating: 0,
  providerType: "all",
  openNow: false,
  onlyWithOffer: false,
  radiusKm: 10,
};

/** Quantos filtros estão diferentes do padrão — vira o número no chip. */
export function countActiveFilters(filters: SearchFilters): number {
  let count = 0;
  if (filters.minRating > 0) count++;
  if (filters.providerType !== "all") count++;
  if (filters.openNow) count++;
  if (filters.onlyWithOffer) count++;
  if (filters.radiusKm !== DEFAULT_FILTERS.radiusKm) count++;
  return count;
}

const RATINGS = [
  { value: 0, label: "Qualquer" },
  { value: 3, label: "3,0+" },
  { value: 4, label: "4,0+" },
  { value: 4.5, label: "4,5+" },
];

const TYPES = [
  { value: "all" as const, label: "Todos" },
  { value: "individual" as const, label: "Autônomo" },
  { value: "company" as const, label: "Empresa" },
];

const RADII = [5, 10, 25, 50];

interface Props {
  visible: boolean;
  initial: SearchFilters;
  resultCount: number;
  onClose: () => void;
  onApply: (filters: SearchFilters) => void;
  /** Sem localização por GPS o raio não tem de onde partir. */
  radiusEnabled: boolean;
}

export function FilterSheet({ visible, initial, resultCount, onClose, onApply, radiusEnabled }: Props) {
  const { colors, radii, spacing, layout } = useTheme();
  const insets = useSafeAreaInsets();
  const segmentShadow = useShadow("hairline");
  const [draft, setDraft] = useState<SearchFilters>(initial);

  // Reabrir sempre parte do que está valendo, não do último rascunho
  const open = () => setDraft(initial);

  return (
    <Modal visible={visible} animationType="slide" onShow={open} onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: spacing[3],
            height: 56,
            paddingHorizontal: layout.screenPadding,
          }}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Fechar filtros"
            onPress={onClose}
            style={{
              width: 38,
              height: 38,
              borderRadius: radii.full,
              backgroundColor: colors.surface2,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={19} color={colors.textPrimary} />
          </Pressable>

          <Text variant="screenTitle" style={{ flex: 1, textAlign: "center" }}>
            Filtros
          </Text>

          <Pressable
            accessibilityRole="button"
            onPress={() => setDraft(DEFAULT_FILTERS)}
            hitSlop={8}
            style={{ width: 60, alignItems: "flex-end" }}
          >
            <Text variant="label" color="primaryStrong">
              Limpar
            </Text>
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: layout.screenPadding,
            paddingTop: 8,
            paddingBottom: 20,
            gap: 22,
          }}
          showsVerticalScrollIndicator={false}
        >
          {radiusEnabled ? (
            <View style={{ gap: 11 }}>
              <Text variant="title">Distância máxima</Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                {RADII.map((km) => {
                  const selected = draft.radiusKm === km;
                  return (
                    <Pressable
                      key={km}
                      accessibilityRole="radio"
                      accessibilityState={{ selected }}
                      onPress={() => setDraft({ ...draft, radiusKm: km })}
                      style={{
                        flex: 1,
                        paddingVertical: 11,
                        alignItems: "center",
                        borderRadius: radii.full,
                        backgroundColor: selected ? colors.primary : colors.surface,
                        borderWidth: 1,
                        borderColor: selected ? colors.primary : colors.border,
                      }}
                    >
                      <Text variant="label" color={selected ? "onPrimary" : "textSecondary"}>
                        {km} km
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ) : null}

          <View style={{ gap: 11 }}>
            <Text variant="title">Avaliação mínima</Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {RATINGS.map((option) => {
                const selected = draft.minRating === option.value;
                return (
                  <Pressable
                    key={option.label}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    onPress={() => setDraft({ ...draft, minRating: option.value })}
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 4,
                      paddingVertical: 11,
                      borderRadius: radii.full,
                      backgroundColor: selected ? colors.primary : colors.surface,
                      borderWidth: 1,
                      borderColor: selected ? colors.primary : colors.border,
                    }}
                  >
                    {option.value > 0 ? (
                      <Star
                        size={12}
                        color={selected ? colors.onPrimary : colors.textSecondary}
                        fill={selected ? colors.onPrimary : "transparent"}
                      />
                    ) : null}
                    <Text variant="label" color={selected ? "onPrimary" : "textSecondary"}>
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={{ gap: 11 }}>
            <Text variant="title">Tipo de profissional</Text>
            <View
              style={{
                flexDirection: "row",
                gap: 4,
                padding: 4,
                borderRadius: radii.full,
                backgroundColor: colors.surface2,
              }}
            >
              {TYPES.map((option) => {
                const selected = draft.providerType === option.value;
                return (
                  <Pressable
                    key={option.value}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    onPress={() => setDraft({ ...draft, providerType: option.value })}
                    style={[
                      selected ? segmentShadow : null,
                      {
                        flex: 1,
                        height: 38,
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: radii.full,
                        backgroundColor: selected ? colors.surface : "transparent",
                      },
                    ]}
                  >
                    <Text
                      color={selected ? "textPrimary" : "textMuted"}
                      style={{
                        fontFamily: selected ? nativeFonts.bodyBold : nativeFonts.bodyMedium,
                        fontSize: fontSize.chip,
                      }}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={{ gap: 11 }}>
            <Text variant="title">Disponibilidade e ofertas</Text>

            {(
              [
                { key: "openNow" as const, label: "Aberto agora", hint: "Só quem atende neste horário" },
                {
                  key: "onlyWithOffer" as const,
                  label: "Só com desconto ativo",
                  hint: "Profissionais com oferta no perfil",
                },
              ]
            ).map((item) => (
              <View
                key={item.key}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  paddingVertical: 13,
                  paddingHorizontal: 14,
                  borderRadius: radii.md,
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <View style={{ flex: 1, gap: 2 }}>
                  <Text variant="bodyStrong">{item.label}</Text>
                  <Text
                    color="textMuted"
                    style={{
                      fontSize: fontSize.caption,
                      lineHeight: fontSize.caption * lineHeight.snug,
                    }}
                  >
                    {item.hint}
                  </Text>
                </View>
                <Toggle
                  accessibilityLabel={item.label}
                  value={draft[item.key]}
                  onValueChange={(value) => setDraft({ ...draft, [item.key]: value })}
                />
              </View>
            ))}
          </View>
        </ScrollView>

        <View
          style={{
            flexDirection: "row",
            gap: 10,
            paddingHorizontal: layout.screenPadding,
            paddingTop: 12,
            paddingBottom: Math.max(insets.bottom, 16),
            backgroundColor: colors.surface,
            borderTopWidth: 1,
            borderTopColor: colors.border,
          }}
        >
          <View style={{ width: 126 }}>
            <Button label="Limpar" variant="secondary" onPress={() => setDraft(DEFAULT_FILTERS)} />
          </View>
          <View style={{ flex: 1 }}>
            <Button
              label={`Ver ${resultCount} ${resultCount === 1 ? "profissional" : "profissionais"}`}
              onPress={() => onApply(draft)}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}
