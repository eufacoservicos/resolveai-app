import { Pressable, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import type { LucideIcon } from "lucide-react-native";
import { Text } from "@/components/ui/text";
import { cn } from "@resolveai/shared/cn";

type Props = {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
  active?: boolean;
  /** Ícone renderizado com tint (aumenta contraste no gradient). */
  tint?: "cyan" | "violet" | "amber" | "emerald" | "rose";
};

const TINTS: Record<
  NonNullable<Props["tint"]>,
  { colors: [string, string]; icon: string }
> = {
  cyan: { colors: ["rgba(34,211,238,0.18)", "rgba(56,189,248,0.10)"], icon: "#22d3ee" },
  violet: { colors: ["rgba(139,92,246,0.20)", "rgba(167,139,250,0.10)"], icon: "#a78bfa" },
  amber: { colors: ["rgba(251,191,36,0.18)", "rgba(245,158,11,0.10)"], icon: "#fbbf24" },
  emerald: { colors: ["rgba(52,211,153,0.18)", "rgba(16,185,129,0.10)"], icon: "#34d399" },
  rose: { colors: ["rgba(244,63,94,0.16)", "rgba(251,113,133,0.10)"], icon: "#fb7185" },
};

/** Círculo de categoria estilo delivery: bolinha grande com ícone + label abaixo. */
export function CategoryCircle({
  icon: Icon,
  label,
  onPress,
  active,
  tint = "cyan",
}: Props) {
  const palette = TINTS[tint];

  return (
    <Pressable
      onPress={onPress}
      className="w-[86px] items-center gap-2.5 active:opacity-70"
    >
      <View
        className={cn(
          "h-[68px] w-[68px] items-center justify-center overflow-hidden rounded-full border",
          active
            ? "border-primary/60"
            : "border-white/10"
        )}
      >
        <LinearGradient
          colors={palette.colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        />
        <Icon size={28} color={palette.icon} strokeWidth={2.2} />
        {active && (
          <View className="absolute -bottom-0.5 h-1 w-6 rounded-full bg-primary" />
        )}
      </View>
      <Text
        numberOfLines={2}
        className={cn(
          "h-8 text-center text-[13px] font-semibold leading-4",
          active ? "text-primary" : "text-foreground/90"
        )}
      >
        {label}
      </Text>
    </Pressable>
  );
}
