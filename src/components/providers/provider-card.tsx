"use client";

import Link from "next/link";
import { Star, MapPin } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { FavoriteButton } from "@/components/providers/favorite-button";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { BusinessHoursBadge } from "@/components/providers/business-hours-display";
import { BusinessHours } from "@/types/database";

interface ProviderCardProps {
  provider: {
    id: string;
    user: { full_name: string; avatar_url: string | null };
    categories: { id: string; name: string; slug: string }[];
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
  const initials = provider.user.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Link href={`/provider/${provider.id}`} className="block">
      <div className="relative h-full overflow-hidden rounded-xl border border-border bg-white shadow-sm transition-shadow hover:shadow-md">
        <div className="flex gap-3 p-3">
          {/* Square avatar */}
          <div className="relative h-16 w-16 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
            <Avatar className="h-full w-full rounded-lg">
              <AvatarImage
                src={provider.user.avatar_url ?? undefined}
                className="object-cover"
              />
              <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-semibold text-lg">
                {initials}
              </AvatarFallback>
            </Avatar>
            {featured && (
              <div className="absolute bottom-0 left-0 right-0 bg-emerald-500 px-1.5 py-0.5 text-center">
                <span className="text-[10px] font-semibold text-white">
                  Destaque
                </span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-1 flex-col justify-center min-w-0">
            <div className="flex items-start gap-1 min-w-0">
              <h3 className="min-w-0 font-semibold text-foreground leading-tight truncate">
                {provider.user.full_name}
              </h3>
              {provider.is_verified && <VerifiedBadge size="sm" className="shrink-0 mt-0.5" />}
              {userId !== undefined && (
                <div className="ml-auto shrink-0">
                  <FavoriteButton
                    providerId={provider.id}
                    userId={userId}
                    isFavorited={isFavorited ?? false}
                    className="h-7 w-7"
                  />
                </div>
              )}
            </div>

            {provider.categories.length > 0 && (
              <div className="mt-1">
                <Badge
                  variant="secondary"
                  className="rounded-md bg-accent text-accent-foreground text-[11px] font-medium px-2 py-0"
                >
                  {provider.categories[0].name}
                </Badge>
              </div>
            )}

            <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
              {provider.average_rating !== null && (
                <span className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span className="font-medium text-foreground">
                    {provider.average_rating}
                  </span>
                  <span>({provider.review_count})</span>
                </span>
              )}
              {(provider.city || provider.distance_km != null) && (
                <span className="flex items-center gap-1 truncate">
                  <MapPin className="h-3 w-3 shrink-0" />
                  {provider.distance_km != null
                    ? `${provider.distance_km < 1
                        ? `${Math.round(provider.distance_km * 1000)}m`
                        : `${provider.distance_km.toFixed(1)} km`
                      }${provider.city ? ` - ${provider.city}` : ""}`
                    : `${provider.city}${provider.state ? `/${provider.state}` : ""}`}
                </span>
              )}
            </div>
            {provider.business_hours && provider.business_hours.length > 0 && (
              <div className="mt-1.5">
                <BusinessHoursBadge hours={provider.business_hours} />
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
