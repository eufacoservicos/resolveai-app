"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Star,
  MapPin,
  MessageCircle,
  ImageIcon,
  MessageSquare,
  Share2,
  X,
  ChevronLeft,
  ChevronRight,
  Camera,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ReviewCard } from "@/components/reviews/review-card";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { BusinessHoursDisplay } from "@/components/providers/business-hours-display";
import { BusinessHours } from "@/types/database";
import { getWhatsAppUrl } from "@/lib/constants";
import { isProviderOpenNow } from "@/lib/business-hours";
import { cn } from "@/lib/utils";

interface ProviderDetailProps {
  provider: {
    id: string;
    description: string;
    neighborhood: string;
    city: string;
    state: string | null;
    whatsapp: string;
    instagram?: string | null;
    is_verified?: boolean;
    user: { full_name: string; avatar_url: string | null };
    categories: { id: string; name: string; slug: string }[];
    portfolio: { id: string; image_url: string; created_at: string }[];
    average_rating: number | null;
    review_count: number;
    business_hours?: BusinessHours[];
  };
  reviews: {
    id: string;
    rating: number;
    comment: string | null;
    created_at: string;
    client: { full_name: string; avatar_url: string | null };
    reply?: { content: string; created_at: string } | null;
  }[];
  currentUser: { id: string; role: string } | null;
  alreadyReviewed: boolean;
}

export function ProviderDetail({
  provider,
  reviews,
  currentUser,
  alreadyReviewed,
}: ProviderDetailProps) {
  const REVIEWS_PER_PAGE = 5;
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [visibleReviewCount, setVisibleReviewCount] = useState(REVIEWS_PER_PAGE);
  const touchStartX = useRef<number>(0);

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (lightboxIndex === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    const threshold = 50;
    if (diff > threshold) {
      setLightboxIndex((lightboxIndex + 1) % provider.portfolio.length);
    } else if (diff < -threshold) {
      setLightboxIndex(
        (lightboxIndex - 1 + provider.portfolio.length) %
          provider.portfolio.length
      );
    }
  }

  const initials = provider.user.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const canReview =
    currentUser && currentUser.role === "CLIENT" && !alreadyReviewed;
  const isOwnProfile =
    currentUser?.role === "PROVIDER";

  const availability = provider.business_hours?.length
    ? isProviderOpenNow(provider.business_hours)
    : null;

  async function handleShare() {
    const url = `${window.location.origin}/provider/${provider.id}`;
    const shareData = {
      title: `${provider.user.full_name} - eufaço!`,
      text: `Confira o perfil de ${provider.user.full_name} no eufaço!`,
      url,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copiado!");
    }
  }

  return (
    <div className="pb-24">
      {/* ======== HERO ======== */}
      <div className="flex flex-col items-center text-center">
        <Avatar className="h-24 w-24 border-4 border-background shadow-lg ring-2 ring-border">
          <AvatarImage src={provider.user.avatar_url ?? undefined} />
          <AvatarFallback className="bg-primary/10 text-primary font-bold text-2xl">
            {initials}
          </AvatarFallback>
        </Avatar>

        <h1 className="mt-3 text-xl font-bold tracking-tight flex items-center gap-1.5">
          {provider.user.full_name}
          {provider.is_verified && <VerifiedBadge size="md" className="shrink-0" />}
        </h1>

        {provider.categories.length > 0 && (
          <div className="mt-1.5 flex flex-wrap justify-center gap-1.5">
            {provider.categories.map((cat) => (
              <Badge
                key={cat.id}
                className="rounded-full bg-primary/10 text-primary text-xs font-medium border-0 hover:bg-primary/10 px-3 py-0.5"
              >
                {cat.name}
              </Badge>
            ))}
          </div>
        )}

        {provider.city && (
          <p className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            {[provider.neighborhood, provider.city, provider.state]
              .filter(Boolean)
              .join(", ")}
          </p>
        )}

        {/* Availability badge */}
        {availability && (
          <div className={cn(
            "mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
            availability.isOpen
              ? "bg-emerald-50 text-emerald-700"
              : "bg-muted text-muted-foreground"
          )}>
            <span className={cn(
              "h-2 w-2 rounded-full",
              availability.isOpen ? "bg-emerald-500 animate-pulse" : "bg-gray-400"
            )} />
            {availability.label}
          </div>
        )}

        {provider.instagram && (
          <a
            href={`https://instagram.com/${provider.instagram}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-xs text-pink-600 hover:underline"
          >
            <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
            </svg>
            @{provider.instagram}
          </a>
        )}
      </div>

      {/* ======== STATS ======== */}
      <div className="mt-5 grid grid-cols-3 gap-2">
        <div className="flex flex-col items-center rounded-xl bg-muted/50 py-3">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="text-lg font-bold">{provider.average_rating ?? "-"}</span>
          </div>
          <span className="text-[11px] text-muted-foreground">Nota</span>
        </div>
        <div className="flex flex-col items-center rounded-xl bg-muted/50 py-3">
          <span className="text-lg font-bold">{provider.review_count}</span>
          <span className="text-[11px] text-muted-foreground">Avaliações</span>
        </div>
        <div className="flex flex-col items-center rounded-xl bg-muted/50 py-3">
          <div className="flex items-center gap-1">
            <Camera className="h-4 w-4 text-muted-foreground" />
            <span className="text-lg font-bold">{provider.portfolio.length}</span>
          </div>
          <span className="text-[11px] text-muted-foreground">Fotos</span>
        </div>
      </div>

      {/* ======== ABOUT ======== */}
      {provider.description && (
        <section className="mt-6">
          <h2 className="text-sm font-semibold text-foreground mb-2">Sobre</h2>
          <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
            {provider.description}
          </p>
        </section>
      )}

      {/* ======== BUSINESS HOURS ======== */}
      {provider.business_hours && provider.business_hours.length > 0 && (
        <section className="mt-4">
          <BusinessHoursDisplay hours={provider.business_hours} />
        </section>
      )}

      {/* ======== PORTFOLIO ======== */}
      <section className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
            Portfólio
          </h2>
          {provider.portfolio.length > 0 && (
            <span className="text-xs text-muted-foreground">{provider.portfolio.length} fotos</span>
          )}
        </div>

        {provider.portfolio.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-center rounded-xl bg-muted/30 border border-dashed border-border">
            <ImageIcon className="h-8 w-8 text-muted-foreground/40 mb-2" />
            <p className="text-xs text-muted-foreground">
              Nenhuma foto no portfólio ainda
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-1">
            {provider.portfolio.map((img, idx) => (
              <button
                key={img.id}
                onClick={() => setLightboxIndex(idx)}
                className="relative aspect-square overflow-hidden rounded-md"
              >
                <Image
                  src={img.image_url}
                  alt="Trabalho do portfólio"
                  fill
                  className="object-cover transition-transform hover:scale-105"
                  sizes="(max-width: 640px) 25vw, 25vw"
                />
              </button>
            ))}
          </div>
        )}
      </section>

      {/* ======== REVIEWS (sempre visível) ======== */}
      <section className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            Avaliações
          </h2>
          {canReview ? (
            <Link href={`/provider/${provider.id}/review`}>
              <Button size="sm" className="rounded-lg font-medium gradient-bg h-8 text-xs">
                Avaliar
              </Button>
            </Link>
          ) : !currentUser ? (
            <Button
              size="sm"
              className="rounded-lg font-medium gradient-bg h-8 text-xs"
              onClick={() =>
                toast(
                  <div className="text-sm">
                    <p>Para avaliar, você precisa ter uma conta.</p>
                    <div className="mt-2 flex gap-3">
                      <a href="/register" className="font-semibold text-primary hover:underline">Criar conta</a>
                      <a href="/login" className="font-semibold text-primary hover:underline">Entrar</a>
                    </div>
                  </div>
                )
              }
            >
              Avaliar
            </Button>
          ) : null}
        </div>

        {/* Rating summary */}
        {provider.review_count > 0 && (
          <div className="flex items-center gap-3 mb-3 p-3 rounded-xl bg-muted/50">
            <div className="flex items-center gap-1.5">
              <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
              <span className="text-2xl font-bold">{provider.average_rating}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{provider.review_count}</span> avaliações
            </div>
          </div>
        )}

        {reviews.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-center rounded-xl bg-muted/30 border border-dashed border-border">
            <MessageSquare className="h-8 w-8 text-muted-foreground/40 mb-2" />
            <p className="text-xs text-muted-foreground">
              Nenhuma avaliação ainda. Seja o primeiro!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {reviews.slice(0, visibleReviewCount).map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                canReply={isOwnProfile}
                providerId={provider.id}
              />
            ))}
            {visibleReviewCount < reviews.length && (
              <button
                onClick={() => setVisibleReviewCount((prev) => prev + REVIEWS_PER_PAGE)}
                className="w-full rounded-lg border border-border py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted/50 transition-colors"
              >
                Ver mais avaliações ({reviews.length - visibleReviewCount} restantes)
              </button>
            )}
          </div>
        )}
      </section>

      {/* ======== LIGHTBOX ======== */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setLightboxIndex(null)}
        >
          <div
            className="relative h-[80vh] w-[90vw] max-w-3xl"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <Image
              src={provider.portfolio[lightboxIndex].image_url}
              alt="Portfólio"
              fill
              className="object-contain"
              sizes="90vw"
            />
          </div>

          {provider.portfolio.length > 1 && (
            <>
              <button
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex(
                    (lightboxIndex - 1 + provider.portfolio.length) %
                      provider.portfolio.length
                  );
                }}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex(
                    (lightboxIndex + 1) % provider.portfolio.length
                  );
                }}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          <button
            className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            onClick={() => setLightboxIndex(null)}
          >
            <X className="h-5 w-5" />
          </button>

          <div className="absolute bottom-4 z-10 text-sm text-white/60">
            {lightboxIndex + 1} / {provider.portfolio.length}
          </div>
        </div>
      )}

      {/* ======== FIXED CTA ======== */}
      {provider.whatsapp && (
        <div className="fixed bottom-20 left-0 right-0 z-40 px-4 md:bottom-6">
          <div className="mx-auto flex max-w-5xl gap-2">
            <a
              href={getWhatsAppUrl(provider.whatsapp, provider.user.full_name)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1"
            >
              <Button className="w-full h-12 rounded-xl gap-2.5 bg-emerald-500 text-white font-semibold text-base shadow-lg hover:bg-emerald-600 transition-colors">
                <MessageCircle className="h-5 w-5" />
                Chamar no WhatsApp
              </Button>
            </a>
            <Button
              onClick={handleShare}
              variant="outline"
              className="h-12 w-12 shrink-0 rounded-xl border-border shadow-lg bg-card"
            >
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
