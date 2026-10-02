import { Text, fontSize, letterSpacing, lineHeight, useTheme } from "@eufaco/design-system/native";
import { ChevronRight } from "lucide-react-native";
import type { ComponentType } from "react";
import { Pressable, View } from "react-native";
import type { ColorToken } from "@eufaco/design-system";

interface Props {
  icon: ComponentType<{ size?: number; color?: string }>;
  title: string;
  description: string;
  /** Cor do disco do ícone e do próprio ícone. Padrão: azul da marca. */
  tone?: { bg: ColorToken; fg: ColorToken };
  /** Cor do título, quando ele carrega estado (como "Aberto agora"). */
  titleColor?: ColorToken;
  /** Mostra a seta e torna o cartão tocável. */
  onPress?: () => void;
}

/**
 * Cartão de benefício/estado do Pen: disco com ícone de 38, título em
 * 13,5 e uma linha de apoio. Aparece na tela do prestador, no convite
 * para virar prestador e nos avisos de horário.
 */
export function InfoCard({ icon: Icon, title, description, tone, titleColor, onPress }: Props) {
  const { colors, radii } = useTheme();
  const bg = colors[tone?.bg ?? "primarySoft"];
  const fg = colors[tone?.fg ?? "primaryStrong"];

  const content = (
    <>
      <View
        style={{
          width: 38,
          height: 38,
          borderRadius: 12,
          backgroundColor: bg,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon size={18} color={fg} />
      </View>

      <View style={{ flex: 1, gap: 2 }}>
        <Text
          variant="titleSm"
          color={titleColor}
          style={{ letterSpacing: letterSpacing.subtle }}
        >
          {title}
        </Text>
        <Text
          color="textSecondary"
          style={{ fontSize: fontSize.caption, lineHeight: fontSize.caption * lineHeight.snug }}
        >
          {description}
        </Text>
      </View>

      {onPress ? <ChevronRight size={18} color={colors.textMuted} /> : null}
    </>
  );

  const style = {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
    padding: 14,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  };

  if (!onPress) return <View style={style}>{content}</View>;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${description}`}
      onPress={onPress}
      style={({ pressed }) => [style, { opacity: pressed ? 0.9 : 1 }]}
    >
      {content}
    </Pressable>
  );
}
