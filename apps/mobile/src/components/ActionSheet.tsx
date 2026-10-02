import {
  Text,
  fontSize,
  letterSpacing,
  nativeFonts,
  useShadow,
  useTheme,
} from "@eufaco/design-system/native";
import type { ComponentType, ReactNode } from "react";
import { Modal, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export interface SheetAction {
  label: string;
  icon: ComponentType<{ size?: number; color?: string }>;
  destructive?: boolean;
  onPress: () => void;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  /** Bloco fixo no topo, normalmente identificando o alvo das ações. */
  header?: ReactNode;
  actions: SheetAction[];
}

/**
 * Folha de ações ancorada na base, sobre o conteúdo escurecido.
 *
 * Usa Modal em vez de rota própria porque a folha é sempre acessória a uma
 * tela: voltar precisa fechá-la, não navegar para trás no histórico.
 */
export function ActionSheet({ visible, onClose, header, actions }: Props) {
  const { colors, radii, layout } = useTheme();
  const insets = useSafeAreaInsets();
  const sheetShadow = useShadow("sheet");

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      {/* Tocar fora fecha, comportamento esperado de bottom sheet */}
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

        {header}

        <ScrollView bounces={false} style={{ maxHeight: 320 }}>
          <View style={{ gap: 4 }}>
            {actions.map((action) => (
              <Pressable
                key={action.label}
                accessibilityRole="button"
                accessibilityLabel={action.label}
                onPress={() => {
                  onClose();
                  action.onPress();
                }}
                style={({ pressed }) => ({
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 13,
                  paddingVertical: 12,
                  paddingHorizontal: 4,
                  borderRadius: radii.md,
                  backgroundColor: pressed ? colors.surface2 : "transparent",
                })}
              >
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 11,
                    backgroundColor: action.destructive ? colors.dangerSoft : colors.surface2,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <action.icon
                    size={17}
                    color={action.destructive ? colors.danger : colors.textSecondary}
                  />
                </View>
                <Text
                  color={action.destructive ? "danger" : "textPrimary"}
                  style={{
                    flex: 1,
                    fontFamily: nativeFonts.bodySemiBold,
                    fontSize: fontSize.field,
                  }}
                >
                  {action.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        <Pressable
          accessibilityRole="button"
          onPress={onClose}
          style={{
            height: 54,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: radii.md,
            backgroundColor: colors.surface2,
          }}
        >
          <Text
            variant="title"
            style={{ fontSize: fontSize.button, letterSpacing: letterSpacing.hairline }}
          >
            Cancelar
          </Text>
        </Pressable>
      </View>
    </Modal>
  );
}
