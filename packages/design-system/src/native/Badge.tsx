import { View, type ViewProps } from "react-native";
import type { ReactNode } from "react";
import { radii } from "../tokens";
import { useTheme } from "./theme";
import { Text } from "./Text";
import type { ColorToken } from "../tokens";

export type BadgeTone =
  | "primary"
  | "success"
  | "accent"
  | "danger"
  | "neutral"
  /** Fundo cheio: usado sobre foto, onde o tom suave sumiria. */
  | "primarySolid";

export interface BadgeProps extends ViewProps {
  label: string;
  tone?: BadgeTone;
  /** Ícone de 9–10 px antes do rótulo. Quase todo selo do Pen tem um. */
  icon?: ReactNode;
  /** Ponto colorido no lugar do ícone, como no selo de disponibilidade. */
  dot?: boolean;
  /** Forma apertada do selo de desconto dentro da linha de metadados. */
  compact?: boolean;
}

const tones: Record<BadgeTone, { bg: ColorToken; fg: ColorToken }> = {
  primary: { bg: "primarySoft", fg: "primaryStrong" },
  success: { bg: "successSoft", fg: "success" },
  accent: { bg: "accentSoft", fg: "accent" },
  danger: { bg: "dangerSoft", fg: "danger" },
  neutral: { bg: "surface2", fg: "textMuted" },
  primarySolid: { bg: "primary", fg: "onPrimary" },
};

export function Badge({
  label,
  tone = "neutral",
  icon,
  dot = false,
  compact = false,
  style,
  ...rest
}: BadgeProps) {
  const { colors } = useTheme();
  const t = tones[tone];

  return (
    <View
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          gap: dot ? 4 : 3,
          backgroundColor: colors[t.bg],
          borderRadius: radii.full,
          paddingVertical: compact ? 2 : 3,
          paddingLeft: dot ? 6 : compact ? 6 : 7,
          paddingRight: compact ? 6 : 7,
          alignSelf: "flex-start",
        },
        style,
      ]}
      {...rest}
    >
      {dot ? (
        <View
          style={{ width: 5, height: 5, borderRadius: radii.full, backgroundColor: colors[t.fg] }}
        />
      ) : (
        icon
      )}
      <Text variant={compact ? "microStrong" : "micro"} color={t.fg}>
        {label}
      </Text>
    </View>
  );
}
