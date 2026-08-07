import { Pressable, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowRight, Sparkles } from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";
import { Text } from "@/components/ui/text";

export type PromoBannerData = {
  id: string;
  title: string;
  subtitle: string;
  cta: string;
  icon?: LucideIcon;
  palette: "cyan" | "violet" | "sunset" | "emerald";
  onPress: () => void;
};

const PALETTES: Record<
  PromoBannerData["palette"],
  { colors: [string, string, string]; accent: string; iconBg: string }
> = {
  cyan: {
    colors: ["#0e7490", "#22d3ee", "#6366f1"],
    accent: "#e0f7ff",
    iconBg: "rgba(255,255,255,0.22)",
  },
  violet: {
    colors: ["#4c1d95", "#8b5cf6", "#ec4899"],
    accent: "#fce7f3",
    iconBg: "rgba(255,255,255,0.22)",
  },
  sunset: {
    colors: ["#7c2d12", "#f97316", "#fbbf24"],
    accent: "#fef3c7",
    iconBg: "rgba(0,0,0,0.15)",
  },
  emerald: {
    colors: ["#064e3b", "#10b981", "#22d3ee"],
    accent: "#d1fae5",
    iconBg: "rgba(255,255,255,0.22)",
  },
};

/**
 * Banner promocional horizontal grande no estilo iFood.
 * Usado dentro de um FlatList horizontal (carrossel).
 */
export function PromoBanner({ banner }: { banner: PromoBannerData }) {
  const Icon = banner.icon ?? Sparkles;
  const p = PALETTES[banner.palette];

  return (
    <Pressable
      onPress={banner.onPress}
      className="w-[308px] overflow-hidden rounded-3xl active:opacity-90"
    >
      <LinearGradient
        colors={p.colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          padding: 22,
          minHeight: 164,
          justifyContent: "space-between",
        }}
      >
        {/* Decorative circles */}
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            right: -30,
            top: -30,
            width: 120,
            height: 120,
            borderRadius: 120,
            backgroundColor: "rgba(255,255,255,0.10)",
          }}
        />
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            right: 20,
            bottom: -50,
            width: 100,
            height: 100,
            borderRadius: 100,
            backgroundColor: "rgba(0,0,0,0.12)",
          }}
        />

        <View className="flex-row items-center gap-2.5">
          <View
            style={{ backgroundColor: p.iconBg }}
            className="h-9 w-9 items-center justify-center rounded-xl"
          >
            <Icon size={18} color="#ffffff" />
          </View>
          <Text className="text-[11px] font-bold uppercase tracking-widest text-white/90">
            {banner.subtitle}
          </Text>
        </View>

        <View className="mt-3">
          <Text
            numberOfLines={2}
            className="text-[21px] font-black leading-[26px] tracking-tight text-white"
          >
            {banner.title}
          </Text>
          <View className="mt-3.5 flex-row items-center gap-1.5 self-start rounded-full bg-white/20 px-3.5 py-2">
            <Text className="text-[13px] font-bold text-white">
              {banner.cta}
            </Text>
            <ArrowRight size={14} color="#ffffff" />
          </View>
        </View>
      </LinearGradient>
    </Pressable>
  );
}
