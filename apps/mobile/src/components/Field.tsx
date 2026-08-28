import { Text, nativeFonts, useTheme } from "@eufaco/design-system/native";
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
}

export function Field({ label, icon: Icon, error, password = false, ...rest }: Props) {
  const { colors, radii, spacing } = useTheme();
  const [visible, setVisible] = useState(false);

  return (
    <View style={{ gap: spacing[1] + 3 }}>
      <Text variant="label" color="textSecondary">
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
          backgroundColor: colors.surface,
          borderWidth: 1.5,
          borderColor: error ? colors.danger : colors.border,
        }}
      >
        {Icon ? <Icon size={18} color={colors.textMuted} /> : null}
        <TextInput
          accessibilityLabel={label}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={password && !visible}
          style={{
            flex: 1,
            color: colors.textPrimary,
            fontFamily: nativeFonts.bodyRegular,
            fontSize: 14.5,
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
