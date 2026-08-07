import { useState } from "react";
import { Pressable, View } from "react-native";
import { router } from "expo-router";
import { Image } from "expo-image";
import { Briefcase, MapPin, Star, User } from "lucide-react-native";
import { isProviderOpenNow } from "@resolveai/shared/business-hours";
import type { BusinessHours } from "@resolveai/shared/supabase/types";
import { Text, Muted } from "@/components/ui/text";
import { FavoriteButton } from "./favorite-button";
import { cn } from "@resolveai/shared/cn";

export type ProviderCardData = {
  id: string;
  user: { full_name: string; avatar_url: string | null };
  categories: { id: string; name: string; slug: string }[];
  description?: string | null;
  city: string;
  state?: string | null;
  average_rating: number | null;
  review_count: number;
  is_verified?: boolean;
  provider_type?: "individual" | "company" | null;
  business_hours?: BusinessHours[];
  distance_km?: number | null;
};

type Props = {
  provider: ProviderCardData;
  featured?: boolean;
  /** undefined esconde o botao de favorito (igual ao PWA) */
  userId?: string | null;
  isFavorited?: boolean;
  className?: string;
  /** Notifica a tela quando o favorito muda (usado na lista de favoritos) */
  onFavoriteToggled?: (isFavorited: boolean) => void;
};

function formatDistance(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)}m` : `${km.toFixed(1)} km`;
}

export function ProviderCard({
  provider,
  featured,
  userId,
  isFavorited,
  className,
  onFavoriteToggled,
}: Props) {
  const [imgError, setImgError] = useState(false);
  const hasImage = Boolean(provider.user.avatar_url) && !imgError;

  const initials = provider.user.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const availability = provider.business_hours?.length
    ? isProviderOpenNow(provider.business_hours)
    : null;

  return (
    <Pressable
      onPress={() => router.push(`/provider/${provider.id}`)}
      className={cn(
        "flex-row gap-4 overflow-hidden rounded-2xl border border-white/10 bg-card/60 p-4 active:bg-card active:border-primary/30",
        className
      )}
    >
      {/* Foto quadrada */}
      <View className="h-18 w-18 overflow-hidden rounded-2xl border border-white/10 bg-muted">
        {hasImage ? (
          <Image
            source={{ uri: provider.user.avatar_url! }}
            contentFit="cover"
            style={{ width: "100%", height: "100%" }}
            onError={() => setImgError(true)}
          />
        ) : (
          <View className="h-full w-full items-center justify-center bg-primary/15">
            <Text className="text-lg font-black text-primary">{initials}</Text>
          </View>
        )}
        {featured && (
          <View className="absolute left-0 top-0 rounded-br-xl bg-emerald-500 px-1.5 py-0.5">
            <Text className="text-[9px] font-bold uppercase tracking-wider text-white">
              Top
            </Text>
          </View>
        )}
      </View>

      {/* Info */}
      <View className="flex-1 justify-center gap-1.5">
        {/* Nome + tipo */}
        <View className="flex-row items-center gap-1.5">
          <Text
            numberOfLines={1}
            className="shrink text-[16px] font-bold leading-5"
          >
            {provider.user.full_name}
          </Text>
          {provider.provider_type && (
            <View
              className={cn(
                "flex-row items-center gap-0.5 rounded-full border px-1.5 py-0.5",
                provider.provider_type === "company"
                  ? "border-sky-400/30 bg-sky-400/10"
                  : "border-amber-400/30 bg-amber-400/10"
              )}
            >
              {provider.provider_type === "company" ? (
                <Briefcase size={10} color="#38bdf8" />
              ) : (
                <User size={10} color="#fbbf24" />
              )}
              <Text
                className={cn(
                  "text-[11px] font-semibold",
                  provider.provider_type === "company"
                    ? "text-sky-400"
                    : "text-amber-400"
                )}
              >
                {provider.provider_type === "company" ? "Empresa" : "Autônomo"}
              </Text>
            </View>
          )}
        </View>

        {/* Categoria + nota */}
        <View className="flex-row items-center gap-1.5">
          {provider.categories.length > 0 && (
            <Text
              numberOfLines={1}
              className="shrink text-[14px] font-semibold text-primary"
            >
              {provider.categories[0].name}
              {provider.categories.length > 1 && (
                <Text className="text-[14px] font-normal text-muted-foreground">
                  {" "}
                  +{provider.categories.length - 1}
                </Text>
              )}
            </Text>
          )}
          {provider.average_rating !== null && (
            <>
              <Text className="text-sm text-muted-foreground/40">·</Text>
              <View className="flex-row items-center gap-0.5">
                <Star size={14} color="#fbbf24" fill="#fbbf24" />
                <Text className="text-[14px] font-bold">
                  {provider.average_rating}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Localizacao + disponibilidade */}
        <View className="flex-row items-center gap-2">
          {(provider.city || provider.distance_km != null) && (
            <View className="flex-row items-center gap-1">
              <MapPin size={13} color="#8891a4" />
              <Muted numberOfLines={1} className="text-[13px]">
                {provider.distance_km != null
                  ? formatDistance(provider.distance_km)
                  : `${provider.city}${provider.state ? `/${provider.state}` : ""}`}
              </Muted>
            </View>
          )}
          {availability && (
            <View className="flex-row items-center gap-1">
              <View
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  availability.isOpen ? "bg-emerald-400" : "bg-muted-foreground/40"
                )}
              />
              <Text
                className={cn(
                  "text-[13px] font-semibold",
                  availability.isOpen ? "text-emerald-400" : "text-muted-foreground"
                )}
              >
                {availability.isOpen ? "Disponível" : "Fechado"}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Favorito */}
      {userId !== undefined && (
        <View className="self-start">
          <FavoriteButton
            providerId={provider.id}
            userId={userId}
            isFavorited={isFavorited ?? false}
            className="h-8 w-8"
            size={18}
            onToggled={onFavoriteToggled}
          />
        </View>
      )}
    </Pressable>
  );
}
