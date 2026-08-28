import { ActivityIndicator, Pressable, StyleSheet, View, type PressableProps } from "react-native";
import type { ReactNode } from "react";
import { fontSize, letterSpacing, radii, spacing } from "../tokens";
import { nativeFonts } from "./fonts";
import { useTheme } from "./theme";
import { Text } from "./Text";
import type { ColorToken } from "../tokens";

export type ButtonVariant = "primary" | "secondary" | "danger" | "whatsapp" | "ghost";
export type ButtonSize = "md" | "lg";

const heights: Record<ButtonSize, number> = { md: 46, lg: 54 };

export interface ButtonProps extends Omit<PressableProps, "style" | "children"> {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  /** Ícone à esquerda do rótulo. */
  icon?: ReactNode;
  fullWidth?: boolean;
}

export function Button({
  label,
  variant = "primary",
  size = "lg",
  loading = false,
  icon,
  fullWidth = true,
  disabled,
  ...rest
}: ButtonProps) {
  const { colors } = useTheme();

  const surface: Record<ButtonVariant, { bg: string; fg: ColorToken; border?: string }> = {
    primary: { bg: colors.primary, fg: "onPrimary" },
    secondary: { bg: colors.surface, fg: "textPrimary", border: colors.borderStrong },
    danger: { bg: colors.danger, fg: "onPrimary" },
    whatsapp: { bg: colors.whatsapp, fg: "onPrimary" },
    ghost: { bg: "transparent", fg: "primaryStrong" },
  };

  const tone = surface[variant];
  const isInactive = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!isInactive, busy: loading }}
      disabled={isInactive}
      style={({ pressed }) => [
        styles.base,
        {
          height: heights[size],
          backgroundColor: tone.bg,
          borderRadius: radii.md,
          borderWidth: tone.border ? 1.5 : 0,
          borderColor: tone.border,
          opacity: isInactive ? 0.55 : pressed ? 0.88 : 1,
          alignSelf: fullWidth ? "stretch" : "flex-start",
          paddingHorizontal: fullWidth ? spacing[4] : spacing[6],
        },
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={colors[tone.fg]} />
      ) : (
        <View style={styles.content}>
          {icon}
          <Text
            variant="title"
            color={tone.fg}
            style={{
              fontFamily: nativeFonts.displayBold,
              fontSize: size === "lg" ? fontSize.md + 0.5 : fontSize.base,
              letterSpacing: letterSpacing.tight,
            }}
          >
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: "center", justifyContent: "center", flexDirection: "row" },
  content: { flexDirection: "row", alignItems: "center", gap: spacing[2] },
});
