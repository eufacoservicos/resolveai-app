import {
  DAYS_OF_WEEK,
  blockUser,
  formatTimeRange,
  getActiveOffer,
  getProviderById,
  trackProfileView,
  trackWhatsAppClick,
  getProviderReviews,
  getWhatsAppUrl,
  isProviderOpenNow,
  providerAcceptsQuotes,
  type ProviderOffer,
  type ProviderWithDetails,
} from "@eufaco/shared";
import {
  Button,
  Card,
  Text,
  fontSize,
  letterSpacing,
  lineHeight,
  nativeFonts,
  useTheme,
} from "@eufaco/design-system/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Ban,
  ChevronDown,
  ChevronUp,
  Clock3,
  Flag,
  Heart,
  Link2,
  MapPin,
  MessageCircle,
  Share2,
  Sparkles,
  Star,
  Tag,
  Timer,
} from "lucide-react-native";
import * as Clipboard from "expo-clipboard";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  Pressable,
  ScrollView,
  Share,
  View,
} from "react-native";
import { ActionSheet } from "@/components/ActionSheet";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useToast } from "@/components/Toast";
import { useFavorites } from "@/hooks/useFavorites";
import { useSession } from "@/lib/session";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppBar } from "@/components/AppBar";
import { SectionHeader } from "@/components/SectionHeader";
import {
  formatDistance,
  formatRating,
  formatRelativeDate,
  formatShortDate,
  formatTenure,
  initialsOf,
} from "@/lib/format";
import { supabase } from "@/lib/supabase";

type Review = Awaited<ReturnType<typeof getProviderReviews>>[number];

/** Quando a cota do prestador vira, no mês seguinte. */
function nextMonthLabel(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 1).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
  });
}

/** Avaliações mostradas antes de "Ver todas". */
const VISIBLE_REVIEWS = 5;

/** Tamanho da foto no carrossel de portfólio, como no Pen. */
const PHOTO_WIDTH = 130;
const PHOTO_HEIGHT = 104;

export default function ProviderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, radii, spacing, layout } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { session } = useSession();
  const { favoriteIds, toggle: toggleFavorite } = useFavorites();
  const toast = useToast();

  const [provider, setProvider] = useState<ProviderWithDetails | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [offer, setOffer] = useState<ProviderOffer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [blockOpen, setBlockOpen] = useState(false);
  const [hoursOpen, setHoursOpen] = useState(false);
  const [allReviews, setAllReviews] = useState(false);
  // Prestador do plano grátis que já usou os 10 orçamentos do mês tem o
  // botão pausado, como a tela de limite promete a ele. Começa como `true`
  // para o botão não piscar de pausado a disponível no carregamento.
  const [acceptsQuotes, setAcceptsQuotes] = useState(true);

  const viewerId = session?.user.id ?? null;

  useEffect(() => {
    if (!id) return;
    let active = true;
    setLoading(true);
    setError(null);

    Promise.all([getProviderById(supabase, id), getProviderReviews(supabase, id)])
      .then(([p, r]) => {
        if (!active) return;
        const found = p as ProviderWithDetails | null;
        setProvider(found);
        setReviews(r);

        // Visita registrada aqui e não na landing só: sem isso o painel do
        // prestador conta apenas o tráfego da web. O dono não conta a si mesmo.
        if (found && found.user_id !== viewerId) {
          void trackProfileView(supabase, id, viewerId);
        }
      })
      .catch(() => {
        if (active) setError("Não foi possível carregar este perfil. Tente de novo.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    // A oferta é acessória: se falhar, o perfil continua completo
    void getActiveOffer(supabase, id).then((result) => {
      if (active) setOffer(result);
    });

    void providerAcceptsQuotes(supabase, id).then((accepts) => {
      if (active) setAcceptsQuotes(accepts);
    });

    return () => {
      active = false;
    };
  }, [id, viewerId]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <AppBar />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </View>
    );
  }

  if (error || !provider) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <AppBar />
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            gap: spacing[3],
            paddingHorizontal: layout.screenPadding,
          }}
        >
          <Text variant="title" style={{ textAlign: "center" }}>
            {error ?? "Este perfil não está mais disponível."}
          </Text>
        </View>
      </View>
    );
  }

  const name = provider.user.full_name;
  const rating = formatRating(provider.average_rating);
  const distance = formatDistance(provider.distance_km);
  const { isOpen, label: hoursLabel } = isProviderOpenNow(provider.business_hours);
  // Mesmo fuso que isProviderOpenNow usa, senão o dia destacado e o
  // "aberto agora" discordam para quem está fora do Brasil.
  const today = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }),
  ).getDay();
  const favorited = favoriteIds.has(provider.id);
  const place = [provider.neighborhood, provider.city].filter(Boolean).join(", ");

  const openWhatsApp = () => {
    // Registrado antes de sair do app: alimenta o histórico do cliente e a
    // cota do prestador. Falha aqui não pode impedir o contato.
    void trackWhatsAppClick(supabase, provider.id, viewerId);
    void Linking.openURL(getWhatsAppUrl(provider.whatsapp, name));
  };

  const profileUrl = `https://eufaco.com.br/provider/${provider.id}`;

  const shareProfile = () => {
    void Share.share({
      message: `Encontrei ${name}, ${provider.categories[0]?.name ?? "profissional"} no eufaço! ${profileUrl}`,
    });
  };

  const copyLink = () => {
    void Clipboard.setStringAsync(profileUrl);
    toast.show({ title: "Link copiado", description: "Agora é só colar onde quiser." });
  };

  const runBlock = () => {
    setBlockOpen(false);
    if (!session) return;
    void blockUser(supabase, session.user.id, provider.user_id).then(({ error: blockError }) => {
      if (blockError) {
        setError("Não foi possível bloquear. Verifique sua conexão e tente de novo.");
        return;
      }
      router.back();
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <AppBar
        action={
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: favorited }}
            accessibilityLabel={favorited ? "Remover dos favoritos" : "Salvar nos favoritos"}
            onPress={() => {
              if (!session) {
                router.push("/login");
                return;
              }
              void toggleFavorite(provider.id);
            }}
            style={{
              width: 38,
              height: 38,
              borderRadius: radii.full,
              backgroundColor: colors.surface2,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Heart
              size={19}
              color={favorited ? colors.danger : colors.textPrimary}
              fill={favorited ? colors.danger : "transparent"}
            />
          </Pressable>
        }
      />

      <ScrollView
        contentContainerStyle={{ paddingTop: 20, paddingBottom: spacing[6], gap: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={{ alignItems: "center", gap: 12, paddingHorizontal: layout.screenPadding }}>
          <View
            style={{
              width: 94,
              height: 94,
              borderRadius: 26,
              backgroundColor: colors.primarySoft,
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            {provider.user.avatar_url ? (
              <Image
                source={{ uri: provider.user.avatar_url }}
                style={{ width: "100%", height: "100%" }}
                resizeMode="cover"
                accessibilityIgnoresInvertColors
              />
            ) : (
              <Text
                variant="h1"
                color="primaryStrong"
                style={{ fontSize: fontSize["4xl"], letterSpacing: letterSpacing.tighter }}
              >
                {initialsOf(name)}
              </Text>
            )}
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Text
              variant="h1"
              style={{
                fontSize: fontSize["2xl"],
                letterSpacing: -0.6,
                lineHeight: fontSize["2xl"] * lineHeight.tight,
                textAlign: "center",
              }}
            >
              {name}
            </Text>
            {offer ? (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                  paddingVertical: 4,
                  paddingHorizontal: 9,
                  borderRadius: radii.full,
                  backgroundColor: colors.primary,
                }}
              >
                <Sparkles size={11} color={colors.onPrimary} />
                <Text variant="microStrong" color="onPrimary" style={{ fontSize: 10 }}>
                  Destaque
                </Text>
              </View>
            ) : null}
          </View>

          {provider.categories.length > 0 ? (
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 6,
                justifyContent: "center",
              }}
            >
              {provider.categories.map((c) => (
                <View
                  key={c.id}
                  style={{
                    paddingVertical: 4,
                    paddingHorizontal: 10,
                    borderRadius: radii.full,
                    backgroundColor: colors.primarySoft,
                  }}
                >
                  <Text variant="captionStrong" color="primaryStrong">
                    {c.name}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}

          {place || distance ? (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <MapPin size={13} color={colors.textMuted} />
              <Text variant="label" color="textSecondary" style={{ fontFamily: nativeFonts.bodyRegular }}>
                {place}
                {distance ? ` · ${distance}` : ""}
              </Text>
            </View>
          ) : null}

          <Card
            padded={false}
            style={{ flexDirection: "row", alignItems: "center", paddingVertical: 14, width: "100%" }}
          >
            {[
              { value: rating ?? "—", label: "Avaliação" },
              { value: String(provider.review_count), label: "Avaliações" },
              { value: formatTenure(provider.created_at), label: "Na plataforma" },
            ].map((stat, i) => (
              <View key={stat.label} style={{ flexDirection: "row", flex: 1, alignItems: "center" }}>
                <View style={{ flex: 1, alignItems: "center", gap: 2 }}>
                  <Text
                    variant="h2"
                    style={{
                      fontSize: fontSize.lg,
                      letterSpacing: letterSpacing.snug,
                      lineHeight: fontSize.lg * lineHeight.tight,
                    }}
                  >
                    {stat.value}
                  </Text>
                  <Text color="textMuted" style={{ fontSize: fontSize.mini }}>
                    {stat.label}
                  </Text>
                </View>
                {i < 2 ? <View style={{ width: 1, height: 30, backgroundColor: colors.border }} /> : null}
              </View>
            ))}
          </Card>
        </View>

        {/* Corpo */}
        <View style={{ paddingHorizontal: layout.screenPadding, gap: 22 }}>
          {offer ? (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                padding: 14,
                borderRadius: radii.lg,
                backgroundColor: colors.accentSoft,
                borderWidth: 1,
                borderColor: colors.accent,
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 13,
                  backgroundColor: colors.surface,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Tag size={19} color={colors.accent} />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text
                  variant="title"
                  style={{ fontSize: fontSize.base, letterSpacing: letterSpacing.subtle }}
                >
                  {offer.title}
                </Text>
                <Text
                  color="textSecondary"
                  style={{
                    fontSize: fontSize.caption,
                    lineHeight: fontSize.caption * lineHeight.snug,
                  }}
                >
                  Válido até {formatShortDate(offer.valid_until)} · mencione ao pedir o orçamento
                </Text>
              </View>
            </View>
          ) : null}

          {provider.description ? (
            <View style={{ gap: 8 }}>
              <Text
                variant="h3"
                style={{
                  fontSize: fontSize.subtitle,
                  lineHeight: fontSize.subtitle * lineHeight.tight,
                }}
              >
                Sobre
              </Text>
              <Text
                color="textSecondary"
                style={{
                  fontSize: fontSize.name,
                  lineHeight: fontSize.name * 1.55,
                }}
              >
                {provider.description}
              </Text>
            </View>
          ) : null}

          <View
            style={{
              borderRadius: radii.lg,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              overflow: "hidden",
            }}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ expanded: hoursOpen }}
              accessibilityLabel={hoursOpen ? "Esconder horários" : "Ver horários de atendimento"}
              disabled={provider.business_hours.length === 0}
              onPress={() => setHoursOpen((open) => !open)}
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                padding: 14,
                opacity: pressed ? 0.9 : 1,
              })}
            >
              <View
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 12,
                  backgroundColor: isOpen ? colors.successSoft : colors.surface2,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Clock3 size={18} color={isOpen ? colors.success : colors.textMuted} />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text variant="title" color={isOpen ? "success" : "textPrimary"} style={{ fontSize: fontSize.base }}>
                  {isOpen ? "Aberto agora" : "Fechado agora"}
                </Text>
                <Text color="textSecondary" style={{ fontSize: fontSize.note }}>
                  {hoursLabel || "Horário não informado"}
                </Text>
              </View>
              {provider.business_hours.length > 0 ? (
                hoursOpen ? (
                  <ChevronUp size={18} color={colors.textMuted} />
                ) : (
                  <ChevronDown size={18} color={colors.textMuted} />
                )
              ) : null}
            </Pressable>

            {hoursOpen ? (
              <View
                style={{
                  paddingHorizontal: 14,
                  paddingBottom: 14,
                  gap: 7,
                  borderTopWidth: 1,
                  borderTopColor: colors.border,
                  paddingTop: 12,
                }}
              >
                {DAYS_OF_WEEK.map((day) => {
                  const entry = provider.business_hours.find((h) => h.day_of_week === day.value);
                  const closed = !entry || entry.is_closed;
                  return (
                    <View
                      key={day.value}
                      style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
                    >
                      <Text
                        color={today === day.value ? "textPrimary" : "textSecondary"}
                        variant={today === day.value ? "titleSm" : "body"}
                        style={{ flex: 1, fontSize: fontSize.note }}
                      >
                        {day.label}
                      </Text>
                      <Text
                        color={closed ? "textMuted" : "textPrimary"}
                        style={{ fontSize: fontSize.note }}
                      >
                        {entry
                          ? formatTimeRange(entry.open_time, entry.close_time, entry.is_closed)
                          : "Fechado"}
                      </Text>
                    </View>
                  );
                })}
              </View>
            ) : null}
          </View>

          {provider.portfolio.length > 0 ? (
            <View style={{ gap: 10 }}>
              <SectionHeader
                title={`Portfólio (${provider.portfolio.length})`}
              />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 10 }}
              >
                {provider.portfolio.map((photo) => (
                  <Image
                    key={photo.id}
                    source={{ uri: photo.image_url }}
                    style={{
                      width: PHOTO_WIDTH,
                      height: PHOTO_HEIGHT,
                      borderRadius: radii.md,
                      backgroundColor: colors.surface3,
                    }}
                    resizeMode="cover"
                    accessibilityIgnoresInvertColors
                  />
                ))}
              </ScrollView>
            </View>
          ) : null}

          <View style={{ gap: 10 }}>
            <SectionHeader
              title={
                provider.review_count > 0 ? `Avaliações (${provider.review_count})` : "Avaliações"
              }
              actionLabel={
                reviews.length === 0
                  ? "Avaliar"
                  : reviews.length > VISIBLE_REVIEWS
                    ? allReviews
                      ? "Ver menos"
                      : "Ver todas"
                    : undefined
              }
              onAction={() => {
                if (reviews.length === 0) {
                  router.push(`/provider/${provider.id}/review`);
                  return;
                }
                setAllReviews((open) => !open);
              }}
            />

            {reviews.length === 0 ? (
              <Card style={{ alignItems: "center", paddingVertical: spacing[6], gap: spacing[1] }}>
                <Text variant="bodyStrong">Ainda sem avaliações</Text>
                <Text variant="caption" color="textSecondary" style={{ textAlign: "center" }}>
                  Seja a primeira pessoa a contar como foi o serviço.
                </Text>
              </Card>
            ) : (
              (allReviews ? reviews : reviews.slice(0, VISIBLE_REVIEWS)).map((review) => (
                <Card key={review.id} style={{ gap: 10, padding: 14 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <View
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: radii.full,
                        backgroundColor: colors.surface3,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text variant="initials" color="textSecondary">
                        {initialsOf(review.client.full_name)}
                      </Text>
                    </View>
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text variant="titleSm">{review.client.full_name}</Text>
                      <Text variant="caption" color="textMuted" style={{ fontSize: fontSize.xs }}>
                        {formatRelativeDate(review.created_at)}
                      </Text>
                    </View>
                    <View style={{ flexDirection: "row", gap: 2 }}>
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          size={13}
                          color={i < review.rating ? colors.accent : colors.surface3}
                          fill={i < review.rating ? colors.accent : colors.surface3}
                        />
                      ))}
                    </View>
                  </View>
                  {review.comment ? <Text variant="bodySm" color="textSecondary">{review.comment}</Text> : null}
                  {review.reply ? (
                    <View
                      style={{
                        backgroundColor: colors.surface2,
                        borderRadius: radii.md,
                        padding: spacing[3],
                        gap: spacing[1],
                      }}
                    >
                      <Text variant="label" color="primaryStrong">
                        Resposta de {name}
                      </Text>
                      <Text variant="caption" color="textSecondary">
                        {review.reply.content}
                      </Text>
                    </View>
                  ) : null}
                </Card>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {/* Barra de ação fixa: o contato é a única coisa que importa nesta tela */}
      <View
        style={{
          flexDirection: "row",
          gap: 10,
          paddingHorizontal: layout.screenPadding,
          paddingTop: 12,
          paddingBottom: Math.max(insets.bottom, spacing[4]),
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        }}
      >
        <View style={{ flex: 1 }}>
          {acceptsQuotes ? (
            <Button
              label="Pedir orçamento"
              variant="whatsapp"
              icon={<MessageCircle size={19} color="#FFFFFF" />}
              onPress={openWhatsApp}
            />
          ) : (
            // Não é falha nem culpa de quem está olhando: o texto explica o
            // que houve e quando volta, em vez de um botão que não responde.
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                minHeight: 54,
                paddingHorizontal: 14,
                paddingVertical: 10,
                borderRadius: radii.md,
                backgroundColor: colors.surface2,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Timer size={18} color={colors.textMuted} />
              <View style={{ flex: 1, gap: 1 }}>
                <Text variant="titleSm" style={{ fontSize: fontSize.note }}>
                  Agenda de orçamentos cheia
                </Text>
                <Text color="textMuted" style={{ fontSize: fontSize.mini }}>
                  Volta a receber em {nextMonthLabel()}
                </Text>
              </View>
            </View>
          )}
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Mais ações"
          onPress={() => setSheetOpen(true)}
          style={{
            width: 54,
            height: 54,
            borderRadius: radii.md,
            backgroundColor: colors.surface2,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Share2 size={20} color={colors.textPrimary} />
        </Pressable>
      </View>

      <ActionSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        header={
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              padding: 12,
              borderRadius: radii.lg,
              backgroundColor: colors.surface,
            }}
          >
            <View
              style={{
                width: 46,
                height: 46,
                borderRadius: 14,
                backgroundColor: colors.primarySoft,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text variant="title" color="primaryStrong">
                {initialsOf(name)}
              </Text>
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text variant="title" numberOfLines={1}>
                {name}
              </Text>
              <Text color="textSecondary" numberOfLines={1} style={{ fontSize: fontSize.note }}>
                {[provider.categories[0]?.name, provider.neighborhood].filter(Boolean).join(" · ")}
              </Text>
            </View>
          </View>
        }
        actions={[
          { label: "Compartilhar perfil", icon: Share2, onPress: shareProfile },
          { label: "Copiar link", icon: Link2, onPress: copyLink },
          {
            label: "Denunciar perfil",
            icon: Flag,
            destructive: true,
            onPress: () => router.push(`/provider/${provider.id}/report`),
          },
          {
            label: "Bloquear profissional",
            icon: Ban,
            destructive: true,
            onPress: () => (session ? setBlockOpen(true) : router.push("/login")),
          },
        ]}
      />

      <ConfirmDialog
        visible={blockOpen}
        icon={Ban}
        title={`Bloquear ${name}?`}
        body="O perfil some da sua busca e vocês não aparecem mais um para o outro."
        confirmLabel="Bloquear"
        cancelLabel="Manter visível"
        destructive
        onConfirm={runBlock}
        onCancel={() => setBlockOpen(false)}
      />
    </View>
  );
}
