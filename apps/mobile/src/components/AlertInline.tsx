import { Text, fontSize, lineHeight, useTheme } from "@eufaco/design-system/native";
import { CircleAlert, CircleCheck, Info } from "lucide-react-native";
import { View } from "react-native";
import type { ColorToken } from "@eufaco/design-system";

export type AlertTone = "danger" | "success" | "info";

interface Props {
  tone?: AlertTone;
  title: string;
  /** Linha de apoio que diz como resolver. */
  description?: string;
}

const tones: Record<AlertTone, { bg: ColorToken; fg: ColorToken }> = {
  danger: { bg: "dangerSoft", fg: "danger" },
  success: { bg: "successSoft", fg: "success" },
  info: { bg: "primarySoft", fg: "primaryStrong" },
};

/**
 * Aviso preso ao formulário (`C / Alert Inline`).
 * Fica junto do campo que precisa de correção, ao contrário do toast,
 * que passa. O título carrega a cor do estado; a explicação, não.
 */
export function AlertInline({ tone = "danger", title, description }: Props) {
  const { colors, radii } = useTheme();
  const t = tones[tone];
  const Icon = tone === "success" ? CircleCheck : tone === "info" ? Info : CircleAlert;

  return (
    <View
      style={{
        flexDirection: "row",
        gap: 10,
        padding: 13,
        borderRadius: radii.md,
        backgroundColor: colors[t.bg],
      }}
    >
      <Icon size={17} color={colors[t.fg]} />
      <View style={{ flex: 1, gap: 2 }}>
        <Text
          variant="titleSm"
          color={t.fg}
          style={{ fontSize: fontSize.chip, lineHeight: fontSize.chip * 1.3 }}
        >
          {title}
        </Text>
        {description ? (
          <Text
            color="textSecondary"
            style={{ fontSize: fontSize.note, lineHeight: fontSize.note * 1.4 }}
          >
            {description}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
