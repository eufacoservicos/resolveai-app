import { useMemo, useState } from "react";
import {
  Dimensions,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  Share,
  View,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowLeft,
  Briefcase,
  Camera,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  Info,
  Instagram,
  Lock,
  MapPin,
  MessageCircle,
  MessageSquare,
  Share2,
  Star,
  User,
  X,
} from "lucide-react-native";
import { usePostHog } from "posthog-react-native";
import { getWhatsAppUrl } from "@resolveai/shared/constants";
import { isProviderOpenNow } from "@resolveai/shared/business-hours";
import type { BusinessHours } from "@resolveai/shared/supabase/types";
import { trackWhatsAppClick } from "@/lib/tracking";
import { TAB_BAR_HEIGHT } from "@/lib/layout";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Muted, Text } from "@/components/ui/text";
import { BusinessHoursDisplay } from "./business-hours-display";
import { FavoriteButton } from "./favorite-button";
import { ReviewCard, type ReviewData } from "@/components/reviews/review-card";
import { cn } from "@resolveai/shared/cn";

const COVER_HEIGHT = 260;
const REVIEWS_PER_PAGE = 5;

export type ProviderDetailData = {
  id: string;
  description: string | null;
  neighborhood: string | null;
  city: string;
  state: string | null;
  whatsapp: string | null;
  instagram?: string | null;
  provider_type?: "individual" | "company" | null;
  is_verified?: boolean;
  user: { full_name: string; avatar_url: string | null };
  categories: { id: string; name: string; slug: string }[];
  portfolio: { id: string; image_url: string; created_at: string }[];
  average_rating: number | null;
  review_count: number;
  business_hours?: BusinessHours[];
};

type Props = {
  provider: ProviderDetailData;
  reviews: ReviewData[];
  currentUser: { id: string; role: string } | null;
  alreadyReviewed: boolean;
};

type TabKey = "sobre" | "portfolio" | "avaliacoes";

function getInstagramHandle(value: string): string {
  let handle = value.trim().replace(/^@/, "");
  const urlMatch = handle.match(/instagram\.com\/([^/?#]+)/i);
  if (urlMatch) handle = urlMatch[1];
  return handle.split(/[/?#]/)[0].replace(/^@/, "");
}

// ─── Header pill button (back / share) ─────────────────────────────
function HeaderPillButton({
  onPress,
  children,
  accessibilityLabel,
}: {
  onPress: () => void;
  children: React.ReactNode;
  accessibilityLabel: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={6}
      className="h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-slate-950/60 active:bg-slate-950/80"
      style={{
        shadowColor: "#000",
        shadowOpacity: 0.4,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
      }}
    >
      {children}
    </Pressable>
  );
}

// ─── Tabs stick ─────────────────────────────────────────────────────
function TabBar({
  active,
  onChange,
  counts,
}: {
  active: TabKey;
  onChange: (t: TabKey) => void;
  counts: { portfolio: number; reviews: number };
}) {
  const tabs: { key: TabKey; label: string; badge?: number }[] = [
    { key: "sobre", label: "Sobre" },
    { key: "portfolio", label: "Portfólio", badge: counts.portfolio },
    { key: "avaliacoes", label: "Avaliações", badge: counts.reviews },
  ];
  return (
    <View className="flex-row items-center gap-2 border-b border-white/10 bg-background/95 px-5 pb-3 pt-4 backdrop-blur">
      {tabs.map((t) => {
        const isActive = active === t.key;
        return (
          <Pressable
            key={t.key}
            onPress={() => onChange(t.key)}
            className={cn(
              "flex-row items-center gap-1.5 rounded-full px-4 py-2",
              isActive
                ? "bg-primary/15 border border-primary/40"
                : "border border-white/10 bg-white/[0.03]"
            )}
          >
            <Text
              className={cn(
                "text-sm font-bold",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              {t.label}
            </Text>
            {t.badge != null && t.badge > 0 && (
              <View
                className={cn(
                  "rounded-full px-1.5",
                  isActive ? "bg-primary/25" : "bg-white/[0.06]"
                )}
              >
                <Text
                  className={cn(
                    "text-[10px] font-black",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {t.badge}
                </Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

// ─── Main component ────────────────────────────────────────────────
export function ProviderDetail({
  provider,
  reviews,
  currentUser,
  alreadyReviewed,
}: Props) {
  const posthog = usePostHog();
  const insets = useSafeAreaInsets();
  const ctaOffset = TAB_BAR_HEIGHT + insets.bottom + 12;

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [visibleReviewCount, setVisibleReviewCount] = useState(REVIEWS_PER_PAGE);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("sobre");

  const canReview =
    !!currentUser && currentUser.role === "CLIENT" && !alreadyReviewed;
  const isOwnProfile = currentUser?.role === "PROVIDER";

  const availability = useMemo(
    () =>
      provider.business_hours?.length
        ? isProviderOpenNow(provider.business_hours)
        : null,
    [provider.business_hours]
  );

  const location = [provider.neighborhood, provider.city, provider.state]
    .filter(Boolean)
    .join(", ");

  const coverImage =
    provider.portfolio[0]?.image_url ?? provider.user.avatar_url ?? null;

  async function handleShare() {
    const url = `https://www.eufacooservico.com.br/provider/${provider.id}`;
    try {
      const result = await Share.share({
        message: `Confira o perfil de ${provider.user.full_name} no eufaço! ${url}`,
        url,
        title: `${provider.user.full_name} - eufaço!`,
      });
      if (result.action === Share.sharedAction) {
        posthog?.capture("provider_profile_shared", {
          provider_id: provider.id,
          method: "native_share",
        });
      }
    } catch {
      // cancelado
    }
  }

  function handleWhatsapp() {
    if (!currentUser) {
      setShowLoginDialog(true);
      return;
    }
    if (!provider.whatsapp) return;

    void trackWhatsAppClick(provider.id, currentUser.id);
    posthog?.capture("whatsapp_contact_clicked", {
      provider_id: provider.id,
      provider_name: provider.user.full_name,
    });
    void Linking.openURL(
      getWhatsAppUrl(provider.whatsapp, provider.user.full_name)
    );
  }

  return (
    <>
      {/* ═══════ HEADER FLOATING (back / share / favorite) ═══════ */}
      <View
        pointerEvents="box-none"
        style={{ top: insets.top + 8 }}
        className="absolute left-0 right-0 z-20 flex-row items-center justify-between px-4"
      >
        <HeaderPillButton
          onPress={() => router.back()}
          accessibilityLabel="Voltar"
        >
          <ArrowLeft size={18} color="#f5f7fb" />
        </HeaderPillButton>

        <View className="flex-row items-center gap-2">
          <HeaderPillButton
            onPress={handleShare}
            accessibilityLabel="Compartilhar"
          >
            <Share2 size={16} color="#f5f7fb" />
          </HeaderPillButton>
          {currentUser && (
            <FavoriteButton
              providerId={provider.id}
              userId={currentUser.id}
              isFavorited={false}
              size={16}
              className="h-10 w-10 border-white/15 bg-slate-950/60"
            />
          )}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: ctaOffset + 90 }}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[2]}
      >
        {/* ═══════ COVER ═══════ */}
        <View
          style={{ height: COVER_HEIGHT + insets.top }}
          className="relative w-full bg-secondary"
        >
          {coverImage ? (
            <Image
              source={{ uri: coverImage }}
              contentFit="cover"
              style={{ width: "100%", height: "100%" }}
            />
          ) : (
            <View className="h-full w-full items-center justify-center bg-primary/10">
              <Text className="text-5xl font-black text-primary/40">
                {provider.user.full_name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </Text>
            </View>
          )}
          {/* dark overlay */}
          <LinearGradient
            colors={[
              "rgba(8,9,12,0.6)",
              "transparent",
              "rgba(8,9,12,0.4)",
              "rgba(8,9,12,0.95)",
            ]}
            locations={[0, 0.35, 0.7, 1]}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          />
        </View>

        {/* ═══════ INFO CARD (sobrepõe o cover) ═══════ */}
        <View className="-mt-16 px-5">
          <View className="rounded-3xl border border-white/10 bg-card/95 p-5 backdrop-blur">
            <View className="flex-row items-start gap-4">
              <View className="rounded-full border-2 border-background bg-primary/10 p-0.5">
                <Avatar
                  src={provider.user.avatar_url}
                  fallback={provider.user.full_name}
                  size={72}
                />
              </View>

              <View className="flex-1 pt-1">
                <Text
                  numberOfLines={2}
                  className="text-xl font-black tracking-tight text-foreground"
                >
                  {provider.user.full_name}
                </Text>

                {provider.categories.length > 0 && (
                  <View className="mt-1.5 flex-row flex-wrap items-center gap-1.5">
                    <Text
                      numberOfLines={1}
                      className="text-sm font-bold text-primary"
                    >
                      {provider.categories[0].name}
                    </Text>
                    {provider.categories.length > 1 && (
                      <View className="rounded-full bg-primary/15 px-2">
                        <Text className="text-[10px] font-black text-primary">
                          +{provider.categories.length - 1}
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                {provider.provider_type && (
                  <View
                    className={cn(
                      "mt-2 flex-row items-center gap-1 self-start rounded-full border px-2.5 py-0.5",
                      provider.provider_type === "company"
                        ? "border-sky-400/30 bg-sky-400/10"
                        : "border-amber-400/30 bg-amber-400/10"
                    )}
                  >
                    {provider.provider_type === "company" ? (
                      <Briefcase size={11} color="#38bdf8" />
                    ) : (
                      <User size={11} color="#fbbf24" />
                    )}
                    <Text
                      className={cn(
                        "text-[10px] font-bold",
                        provider.provider_type === "company"
                          ? "text-sky-400"
                          : "text-amber-400"
                      )}
                    >
                      {provider.provider_type === "company"
                        ? "Empresa"
                        : "Autônomo"}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Meta row */}
            <View className="mt-4 flex-row flex-wrap items-center gap-2">
              {availability && (
                <View
                  className={cn(
                    "flex-row items-center gap-1.5 rounded-full border px-3 py-1",
                    availability.isOpen
                      ? "border-emerald-400/40 bg-emerald-400/15"
                      : "border-white/10 bg-white/5"
                  )}
                >
                  <View
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      availability.isOpen
                        ? "bg-emerald-400"
                        : "bg-muted-foreground/50"
                    )}
                  />
                  <Text
                    className={cn(
                      "text-xs font-bold",
                      availability.isOpen
                        ? "text-emerald-400"
                        : "text-muted-foreground"
                    )}
                  >
                    {availability.label}
                  </Text>
                </View>
              )}

              {provider.average_rating != null && (
                <View className="flex-row items-center gap-1 rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1">
                  <Star size={11} color="#fbbf24" fill="#fbbf24" />
                  <Text className="text-xs font-black text-amber-400">
                    {provider.average_rating}
                  </Text>
                  <Text className="text-xs font-semibold text-amber-400/70">
                    · {provider.review_count}
                  </Text>
                </View>
              )}

              {provider.instagram && (
                <Pressable
                  onPress={() =>
                    Linking.openURL(
                      `https://instagram.com/${getInstagramHandle(provider.instagram!)}`
                    )
                  }
                  className="flex-row items-center gap-1 rounded-full border border-pink-400/40 bg-pink-400/10 px-3 py-1"
                >
                  <Instagram size={11} color="#f472b6" />
                  <Text className="text-xs font-bold text-pink-400">
                    @{getInstagramHandle(provider.instagram)}
                  </Text>
                </Pressable>
              )}
            </View>

            {/* Location */}
            {location && (
              <View className="mt-4 flex-row items-center gap-2 border-t border-white/5 pt-4">
                <View className="h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03]">
                  <MapPin size={14} color="#22d3ee" />
                </View>
                <View className="flex-1">
                  <Text
                    numberOfLines={1}
                    className="text-sm font-semibold text-foreground"
                  >
                    {location}
                  </Text>
                  <Muted className="text-xs">Atende na sua região</Muted>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* ═══════ STICKY TABS ═══════ */}
        <TabBar
          active={activeTab}
          onChange={setActiveTab}
          counts={{
            portfolio: provider.portfolio.length,
            reviews: currentUser ? reviews.length : 0,
          }}
        />

        {/* ═══════ TAB CONTENT ═══════ */}
        <View className="px-5 pt-6">
          {activeTab === "sobre" && (
            <View className="gap-5">
              {/* Sobre / bio */}
              <View className="rounded-2xl border border-white/10 bg-card/60 p-5">
                <View className="mb-3 flex-row items-center gap-2">
                  <View className="h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
                    <Info size={14} color="#22d3ee" />
                  </View>
                  <Text className="text-base font-bold">Sobre</Text>
                </View>
                <Muted className="text-[15px] leading-relaxed text-foreground/85">
                  {provider.description ||
                    "Este profissional ainda não escreveu uma descrição."}
                </Muted>
              </View>

              {/* Horário */}
              {provider.business_hours && provider.business_hours.length > 0 && (
                <BusinessHoursDisplay hours={provider.business_hours} />
              )}

              {/* Categorias completas */}
              {provider.categories.length > 1 && (
                <View className="rounded-2xl border border-white/10 bg-card/60 p-5">
                  <View className="mb-3 flex-row items-center gap-2">
                    <View className="h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
                      <Briefcase size={14} color="#22d3ee" />
                    </View>
                    <Text className="text-base font-bold">
                      Categorias de serviço
                    </Text>
                  </View>
                  <View className="flex-row flex-wrap gap-1.5">
                    {provider.categories.map((cat) => (
                      <View
                        key={cat.id}
                        className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5"
                      >
                        <Text className="text-xs font-bold text-primary">
                          {cat.name}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          )}

          {activeTab === "portfolio" && (
            <View className="gap-3">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <View className="h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
                    <ImageIcon size={14} color="#22d3ee" />
                  </View>
                  <Text className="text-base font-bold">Portfólio</Text>
                </View>
                {provider.portfolio.length > 0 && (
                  <Muted className="text-xs">
                    {provider.portfolio.length}{" "}
                    {provider.portfolio.length === 1 ? "foto" : "fotos"}
                  </Muted>
                )}
              </View>

              {provider.portfolio.length === 0 ? (
                <View className="items-center rounded-2xl border border-dashed border-white/15 bg-card/40 py-16">
                  <View className="mb-3 h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
                    <Camera size={26} color="#3a4258" />
                  </View>
                  <Muted className="mt-1 text-center text-sm">
                    Nenhuma foto no portfólio ainda
                  </Muted>
                </View>
              ) : (
                <View className="flex-row flex-wrap" style={{ gap: 6 }}>
                  {provider.portfolio.map((img, idx) => (
                    <Pressable
                      key={img.id}
                      onPress={() => setLightboxIndex(idx)}
                      style={{ width: "32.4%", aspectRatio: 1 }}
                      className="overflow-hidden rounded-xl border border-white/10"
                    >
                      <Image
                        source={{ uri: img.image_url }}
                        style={{ width: "100%", height: "100%" }}
                        contentFit="cover"
                      />
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          )}

          {activeTab === "avaliacoes" && (
            <View className="gap-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <View className="h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
                    <MessageSquare size={14} color="#22d3ee" />
                  </View>
                  <Text className="text-base font-bold">Avaliações</Text>
                </View>
                {canReview && (
                  <Button
                    variant="gradient"
                    size="sm"
                    onPress={() =>
                      router.push(`/provider/${provider.id}/review`)
                    }
                  >
                    Avaliar
                  </Button>
                )}
              </View>

              {!currentUser ? (
                <View className="items-center rounded-2xl border border-dashed border-white/15 bg-card/40 py-10">
                  <View className="mb-3 h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.03]">
                    <Lock size={26} color="#3a4258" />
                  </View>
                  <Text className="text-center text-sm font-bold">
                    Avaliações para cadastrados
                  </Text>
                  <Muted className="mb-4 mt-1.5 max-w-xs text-center text-xs">
                    Crie sua conta para ver a nota e as avaliações deste
                    profissional.
                  </Muted>
                  <View className="flex-row gap-2">
                    <Button
                      variant="gradient"
                      size="sm"
                      onPress={() => router.push("/register")}
                    >
                      Criar conta grátis
                    </Button>
                    <Button
                      variant="glass"
                      size="sm"
                      onPress={() => router.push("/login")}
                    >
                      Entrar
                    </Button>
                  </View>
                </View>
              ) : (
                <>
                  {provider.review_count > 0 && (
                    <View className="flex-row items-center gap-4 rounded-2xl border border-amber-400/25 bg-amber-400/10 p-4">
                      <View className="items-center rounded-xl bg-amber-400/15 p-3">
                        <Star size={22} color="#fbbf24" fill="#fbbf24" />
                        <Text className="mt-1 text-2xl font-black text-amber-400">
                          {provider.average_rating}
                        </Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-sm font-bold text-foreground">
                          {provider.review_count}{" "}
                          {provider.review_count === 1
                            ? "avaliação"
                            : "avaliações"}
                        </Text>
                        <Muted className="text-xs">
                          Baseado em clientes reais
                        </Muted>
                      </View>
                    </View>
                  )}

                  {reviews.length === 0 ? (
                    <View className="items-center rounded-2xl border border-dashed border-white/15 bg-card/40 py-10">
                      <MessageSquare size={30} color="#3a4258" />
                      <Muted className="mt-3 text-center text-sm">
                        Nenhuma avaliação ainda.{"\n"}
                        {canReview && "Seja o primeiro!"}
                      </Muted>
                    </View>
                  ) : (
                    <View className="gap-3">
                      {reviews.slice(0, visibleReviewCount).map((review) => (
                        <ReviewCard
                          key={review.id}
                          review={review}
                          canReply={isOwnProfile}
                          providerId={provider.id}
                        />
                      ))}
                      {visibleReviewCount < reviews.length && (
                        <Pressable
                          onPress={() =>
                            setVisibleReviewCount(
                              (prev) => prev + REVIEWS_PER_PAGE
                            )
                          }
                          className="items-center rounded-full border border-white/10 bg-card/60 py-3 active:bg-card"
                        >
                          <Text className="text-sm font-semibold text-muted-foreground">
                            Ver mais avaliações (
                            {reviews.length - visibleReviewCount} restantes)
                          </Text>
                        </Pressable>
                      )}
                    </View>
                  )}
                </>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* ═══════ CTA FIXO ═══════ */}
      <View
        pointerEvents="box-none"
        className="absolute left-0 right-0"
        style={{ bottom: ctaOffset }}
      >
        {/* Fade atrás do CTA para melhorar contraste sobre imagens */}
        <LinearGradient
          colors={["transparent", "rgba(8,9,12,0.95)"]}
          locations={[0, 0.4]}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: -20,
            height: 100,
          }}
          pointerEvents="none"
        />
        <View className="flex-row gap-2 px-4">
          <Button
            onPress={handleWhatsapp}
            size="lg"
            className="flex-1 border-0 bg-emerald-500 shadow-2xl shadow-emerald-500/40 active:bg-emerald-600"
          >
            <MessageCircle size={20} color="#ffffff" />
            <Text className="text-base font-bold text-white">
              Chamar no WhatsApp
            </Text>
          </Button>
        </View>
      </View>

      <Lightbox
        images={provider.portfolio}
        index={lightboxIndex}
        onChangeIndex={setLightboxIndex}
      />

      {/* ═══════ DIALOG DE LOGIN ═══════ */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogHeader>
          <DialogTitle>Entre para ver o contato</DialogTitle>
          <DialogDescription>
            Para acessar o WhatsApp de {provider.user.full_name}, você precisa
            ter uma conta no eufaço!
          </DialogDescription>
        </DialogHeader>
        <View className="gap-2">
          <Button
            variant="gradient"
            size="lg"
            onPress={() => {
              setShowLoginDialog(false);
              router.push("/register");
            }}
          >
            Criar conta grátis
          </Button>
          <Button
            variant="glass"
            size="lg"
            onPress={() => {
              setShowLoginDialog(false);
              router.push("/login");
            }}
          >
            Já tenho conta
          </Button>
        </View>
      </Dialog>
    </>
  );
}

function Lightbox({
  images,
  index,
  onChangeIndex,
}: {
  images: { id: string; image_url: string }[];
  index: number | null;
  onChangeIndex: (index: number | null) => void;
}) {
  const { width, height } = Dimensions.get("window");

  if (index === null || images.length === 0) return null;

  const go = (delta: number) =>
    onChangeIndex((index + delta + images.length) % images.length);

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => onChangeIndex(null)}
    >
      <Pressable
        className="flex-1 items-center justify-center bg-black/95"
        onPress={() => onChangeIndex(null)}
      >
        <Image
          source={{ uri: images[index].image_url }}
          style={{ width: width * 0.92, height: height * 0.8 }}
          contentFit="contain"
        />

        {images.length > 1 && (
          <>
            <Pressable
              onPress={() => go(-1)}
              className="absolute left-3 h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-slate-950/70"
            >
              <ChevronLeft size={22} color="#ffffff" />
            </Pressable>
            <Pressable
              onPress={() => go(1)}
              className="absolute right-3 h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-slate-950/70"
            >
              <ChevronRight size={22} color="#ffffff" />
            </Pressable>
          </>
        )}

        <Pressable
          onPress={() => onChangeIndex(null)}
          className="absolute right-4 top-14 h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-slate-950/70"
        >
          <X size={20} color="#ffffff" />
        </Pressable>

        <View className="absolute bottom-10 rounded-full bg-black/60 px-4 py-1.5">
          <Text className="text-sm font-bold text-white">
            {index + 1} / {images.length}
          </Text>
        </View>
      </Pressable>
    </Modal>
  );
}
