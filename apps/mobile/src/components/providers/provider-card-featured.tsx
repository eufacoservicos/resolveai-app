import { useState } from "react";
import { Pressable, View } from "react-native";
import { router } from "expo-router";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { MapPin, Star } from "lucide-react-native";
import { isProviderOpenNow } from "@resolveai/shared/business-hours";
import type { BusinessHours } from "@resolveai/shared/supabase/types";
import { Text } from "@/components/ui/text";
import { cn } from "@resolveai/shared/cn";
import type { ProviderCardData } from "./provider-card";

type Props = {
  provider: ProviderCardData & {
    portfolio?: { id: string; image_url: string }[];
  };
  className?: string;
};

/**
 * Card destacado (estilo iFood restaurante) para carrosséis horizontais.
 * Foto grande da primeira imagem do portfólio (ou avatar), info sobreposta.
 * Usado em "Perto de você" / "Mais bem avaliados" na home.
 */
export function ProviderCardFeatured({ provider, className }: Props) {
  const [imgError, setImgError] = useState(false);

  const cover =
    !imgError && provider.portfolio && provider.portfolio.length > 0
      ? provider.portfolio[0].image_url
      : provider.user.avatar_url;

  const initials = provider.user.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const availability = provider.business_hours?.length
    ? isProviderOpenNow(provider.business_hours as BusinessHours[])
    : null;

  return (
    <Pressable
      onPress={() => router.push(`/provider/${provider.id}`)}
      className={cn(
        "w-[264px] overflow-hidden rounded-3xl border border-white/10 bg-card/60 active:opacity-95",
        className
      )}
    >
      {/* Cover */}
      <View className="relative h-[152px] w-full overflow-hidden bg-secondary">
        {cover ? (
          <Image
            source={{ uri: cover }}
            contentFit="cover"
            style={{ width: "100%", height: "100%" }}
            onError={() => setImgError(true)}
          />
        ) : (
          <View className="h-full w-full items-center justify-center bg-primary/15">
            <Text className="text-3xl font-black text-primary">{initials}</Text>
          </View>
        )}
        <LinearGradient
          colors={["transparent", "rgba(15,17,22,0.65)"]}
          start={{ x: 0, y: 0.4 }}
          end={{ x: 0, y: 1 }}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        />

        {/* Availability chip */}
        {availability && (
          <View
            className={cn(
              "absolute left-3 top-3 flex-row items-center gap-1.5 rounded-full px-3 py-1.5",
              availability.isOpen
                ? "bg-emerald-500/95"
                : "bg-slate-900/70"
            )}
          >
            <View
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                availability.isOpen ? "bg-white" : "bg-white/60"
              )}
            />
            <Text
              className={cn(
                "text-[11px] font-bold uppercase tracking-wide",
                availability.isOpen ? "text-white" : "text-white/80"
              )}
            >
              {availability.isOpen ? "Disponível" : "Fechado"}
            </Text>
          </View>
        )}

        {/* Rating badge */}
        {provider.average_rating != null && (
          <View className="absolute right-3 top-3 flex-row items-center gap-1 rounded-full bg-slate-950/80 px-3 py-1.5 backdrop-blur">
            <Star size={13} color="#fbbf24" fill="#fbbf24" />
            <Text className="text-[13px] font-black text-white">
              {provider.average_rating}
            </Text>
          </View>
        )}
      </View>

      {/* Info */}
      <View className="gap-1.5 px-4 pb-4 pt-3.5">
        <Text
          numberOfLines={1}
          className="text-[17px] font-black tracking-tight text-foreground"
        >
          {provider.user.full_name}
        </Text>
        {provider.categories.length > 0 && (
          <Text
            numberOfLines={1}
            className="text-[14px] font-semibold text-primary"
          >
            {provider.categories[0].name}
            {provider.categories.length > 1 && (
              <Text className="text-[14px] font-normal text-muted-foreground">
                {"  ·  "}+{provider.categories.length - 1}
              </Text>
            )}
          </Text>
        )}
        <View className="mt-0.5 flex-row items-center gap-1.5">
          <MapPin size={13} color="#8891a4" />
          <Text
            numberOfLines={1}
            className="text-[13px] text-muted-foreground"
          >
            {provider.distance_km != null
              ? provider.distance_km < 1
                ? `${Math.round(provider.distance_km * 1000)} m`
                : `${provider.distance_km.toFixed(1)} km`
              : `${provider.city}${provider.state ? `/${provider.state}` : ""}`}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
