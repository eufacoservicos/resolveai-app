import {
  Text,
  fontSize,
  letterSpacing,
  lineHeight,
  nativeFonts,
  radii,
  useShadow,
  useTheme,
} from "@eufaco/design-system/native";
import type { ComponentType } from "react";
import { Modal, Pressable, View } from "react-native";

interface Props {
  visible: boolean;
  icon: ComponentType<{ size?: number; color?: string }>;
  title: string;
  body: string;
  /** Rótulo da ação que confirma. */
  confirmLabel: string;
  /** Rótulo da saída. O Pen sempre nomeia o que acontece, não "Cancelar". */
  cancelLabel: string;
  /** Ação irreversível: pinta o botão e o disco de vermelho. */
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Diálogo de confirmação do Pen (`C / Dialog`).
 *
 * Substitui o `Alert.alert` do sistema nas decisões que o design desenhou:
 * o alerta nativo tem a cara do aparelho, não a do produto, e não aceita
 * o ícone nem a hierarquia de botões que o protótipo define.
 */
export function ConfirmDialog({
  visible,
  icon: Icon,
  title,
  body,
  confirmLabel,
  cancelLabel,
  destructive = false,
  onConfirm,
  onCancel,
}: Props) {
  const { colors } = useTheme();
  const dialogShadow = useShadow("modal");

  const accent = destructive ? colors.danger : colors.primary;
  const accentSoft = destructive ? colors.dangerSoft : colors.primarySoft;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View
        style={{
          flex: 1,
          backgroundColor: colors.overlay,
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <View
          style={[
            {
              width: "100%",
              maxWidth: 318,
              alignItems: "center",
              gap: 16,
              paddingTop: 26,
              paddingHorizontal: 24,
              paddingBottom: 22,
              borderRadius: radii.xl,
              backgroundColor: colors.surface,
            },
            dialogShadow,
          ]}
        >
          <View
            style={{
              width: 54,
              height: 54,
              borderRadius: 18,
              backgroundColor: accentSoft,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon size={24} color={accent} />
          </View>

          <View style={{ alignItems: "center", gap: 7 }}>
            <Text
              variant="h2"
              style={{ textAlign: "center", lineHeight: fontSize.xl * lineHeight.tight }}
            >
              {title}
            </Text>
            <Text
              color="textSecondary"
              style={{
                textAlign: "center",
                fontSize: fontSize.name,
                lineHeight: fontSize.name * lineHeight.normal,
              }}
            >
              {body}
            </Text>
          </View>

          <View style={{ alignSelf: "stretch", gap: 8, paddingTop: 4 }}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={confirmLabel}
              onPress={onConfirm}
              style={({ pressed }) => ({
                height: 50,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: radii.md,
                backgroundColor: accent,
                opacity: pressed ? 0.88 : 1,
              })}
            >
              <Text
                style={{
                  color: destructive ? "#FFFFFF" : colors.onPrimary,
                  fontFamily: nativeFonts.displayBold,
                  fontSize: fontSize.md,
                  letterSpacing: letterSpacing.hairline,
                }}
              >
                {confirmLabel}
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={cancelLabel}
              onPress={onCancel}
              style={({ pressed }) => ({
                height: 50,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: radii.md,
                backgroundColor: colors.surface2,
                opacity: pressed ? 0.88 : 1,
              })}
            >
              <Text
                variant="title"
                style={{ fontSize: fontSize.md, letterSpacing: letterSpacing.hairline }}
              >
                {cancelLabel}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
