import { View, type ViewProps } from "react-native";
import { fontSize, radii, spacing } from "../tokens";
import { nativeFonts } from "./fonts";
import { useTheme } from "./theme";
import { Text } from "./Text";
import type { ColorToken } from "../tokens";

export type BadgeTone = "primary" | "success" | "accent" | "danger" | "neutral";

export interface BadgeProps extends ViewProps {
  label: string;
  tone?: BadgeTone;
}

const tones: Record<BadgeTone, { bg: ColorToken; fg: ColorToken }> = {
  primary: { bg: "primarySoft", fg: "primaryStrong" },
  success: { bg: "successSoft", fg: "success" },
  accent: { bg: "accentSoft", fg: "accent" },
  danger: { bg: "dangerSoft", fg: "danger" },
  neutral: { bg: "surface2", fg: "textSecondary" },
};

export function Badge({ label, tone = "neutral", style, ...rest }: BadgeProps) {
  const { colors } = useTheme();
  const t = tones[tone];
  return (
    <View
      style={[
        {
          backgroundColor: colors[t.bg],
          borderRadius: radii.full,
          paddingVertical: spacing[1],
          paddingHorizontal: spacing[2] + 1,
          alignSelf: "flex-start",
        },
        style,
      ]}
      {...rest}
    >
      <Text
        color={t.fg}
        style={{
          fontFamily: nativeFonts.bodyBold,
          fontSize: fontSize.xs - 1,
        }}
      >
        {label}
      </Text>
    </View>
  );
}
