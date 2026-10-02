import { Text, fontSize, nativeFonts, useTheme } from "@eufaco/design-system/native";
import { Eye, EyeOff } from "lucide-react-native";
import type { ComponentType } from "react";
import { useState } from "react";
import { Pressable, TextInput, View, type TextInputProps } from "react-native";

interface Props extends Omit<TextInputProps, "style"> {
  label: string;
  icon?: ComponentType<{ size?: number; color?: string }>;
  /** Mensagem de validação. Fica presa ao campo até a pessoa corrigir. */
  error?: string | null;
  /** Adiciona o botão de mostrar/ocultar e liga secureTextEntry. */
  password?: boolean;
  /** Borda vermelha permanente, para confirmações destrutivas. */
  danger?: boolean;
}

export function Field({ label, icon: Icon, error, password = false, danger = false, ...rest }: Props) {
  const { colors, radii, spacing } = useTheme();
  const [visible, setVisible] = useState(false);

  // O Pen desenha o campo travado com fundo apagado, não com opacidade
  const locked = rest.editable === false;

  return (
    <View style={{ gap: spacing[1] + 3 }}>
      <Text variant="label" color="textSecondary" style={{ letterSpacing: 0.1 }}>
        {label}
      </Text>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: spacing[2] + 2,
          height: 52,
          paddingHorizontal: 15,
          borderRadius: radii.md,
          backgroundColor: locked ? colors.surface2 : colors.surface,
          borderWidth: 1.5,
          borderColor: error || danger ? colors.danger : colors.border,
        }}
      >
        {Icon ? <Icon size={18} color={colors.textMuted} /> : null}
        <TextInput
          accessibilityLabel={label}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={password && !visible}
          style={{
            flex: 1,
            color: locked ? colors.textMuted : colors.textPrimary,
            // Valor preenchido é semibold no Pen; travado, regular e apagado
            fontFamily: locked ? nativeFonts.bodyRegular : nativeFonts.bodySemiBold,
            fontSize: fontSize.field,
          }}
          {...rest}
        />
        {password ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={visible ? "Ocultar senha" : "Mostrar senha"}
            onPress={() => setVisible((v) => !v)}
            hitSlop={8}
          >
            {visible ? (
              <EyeOff size={17} color={colors.textMuted} />
            ) : (
              <Eye size={17} color={colors.textMuted} />
            )}
          </Pressable>
        ) : null}
      </View>

      {error ? (
        <Text variant="caption" color="danger">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
