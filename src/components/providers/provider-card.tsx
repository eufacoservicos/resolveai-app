"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Star, MapPin } from "lucide-react";
import { FavoriteButton } from "@/components/providers/favorite-button";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { BusinessHours } from "@/types/database";
import { isProviderOpenNow } from "@/lib/business-hours";

interface ProviderCardProps {
  provider: {
    id: string;
    user: { full_name: string; avatar_url: string | null };
    categories: { id: string; name: string; slug: string }[];
    description?: string;
    city: string;
    state?: string | null;
    average_rating: number | null;
    review_count: number;
    is_verified?: boolean;
    business_hours?: BusinessHours[];
    distance_km?: number | null;
  };
  featured?: boolean;
  userId?: string | null;
  isFavorited?: boolean;
}

export function ProviderCard({ provider, featured, userId, isFavorited }: ProviderCardProps) {
  const [imgError, setImgError] = useState(false);
  const hasImage = provider.user.avatar_url && !imgError;

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
    <Link href={`/provider/${provider.id}`} className="block">
      <div className="flex gap-3 rounded-xl border border-border bg-card p-3 transition-all hover:shadow-md hover:border-border/80">
        {/* Square photo */}
        <div className="relative h-18 w-18 shrink-0 overflow-hidden rounded-lg bg-muted">
          {hasImage ? (
            <Image
              src={provider.user.avatar_url!}
              alt={provider.user.full_name}
              fill
              sizes="72px"
              loading="lazy"
              className="object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-primary/10">
              <span className="text-lg font-bold text-primary">{initials}</span>
            </div>
          )}
          {featured && (
            <div className="absolute top-0 left-0 rounded-br-lg bg-emerald-500 px-1.5 py-0.5">
              <span className="text-[9px] font-bold text-white uppercase tracking-wider">Top</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
          {/* Name + verified */}
          <div className="flex items-center gap-1 min-w-0">
            <h3 className="font-semibold text-sm text-foreground leading-tight truncate">
              {provider.user.full_name}
            </h3>
            {provider.is_verified && <VerifiedBadge size="sm" className="shrink-0" />}
          </div>

          {/* Category + rating */}
          <div className="flex items-center gap-1.5 text-xs min-w-0">
            {provider.categories.length > 0 && (
              <span className="font-medium text-primary truncate">
                {provider.categories[0].name}
                {provider.categories.length > 1 && (
                  <span className="text-muted-foreground font-normal"> +{provider.categories.length - 1}</span>
                )}
              </span>
            )}
            {provider.average_rating !== null && (
              <>
                <span className="text-muted-foreground/40">·</span>
                <span className="flex items-center gap-0.5 shrink-0">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  <span className="font-bold text-foreground">{provider.average_rating}</span>
                </span>
              </>
            )}
          </div>

          {/* Location + availability */}
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            {(provider.city || provider.distance_km != null) && (
              <span className="flex items-center gap-0.5 truncate">
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="truncate">
                  {provider.distance_km != null
                    ? `${provider.distance_km < 1
                        ? `${Math.round(provider.distance_km * 1000)}m`
                        : `${provider.distance_km.toFixed(1)} km`
                      }`
                    : `${provider.city}${provider.state ? `/${provider.state}` : ""}`}
                </span>
              </span>
            )}
            {availability && (
              <span className={`flex items-center gap-1 shrink-0 ${availability.isOpen ? "text-emerald-600" : "text-muted-foreground"}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${availability.isOpen ? "bg-emerald-500" : "bg-gray-400"}`} />
                {availability.isOpen ? "Disponível" : "Fechado"}
              </span>
            )}
          </div>
        </div>

        {/* Favorite */}
        {userId !== undefined && (
          <div className="shrink-0 self-start">
            <FavoriteButton
              providerId={provider.id}
              userId={userId}
              isFavorited={isFavorited ?? false}
              className="h-7 w-7"
            />
          </div>
        )}
      </div>
    </Link>
  );
}
