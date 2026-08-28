import {
  getProviderById,
  getProviderReviews,
  getWhatsAppUrl,
  isProviderOpenNow,
  type ProviderWithDetails,
} from "@eufaco/shared";
import { Badge, Button, Card, Text, useTheme } from "@eufaco/design-system/native";
import { useLocalSearchParams } from "expo-router";
import { Clock3, MapPin, MessageCircle, Share2, Star } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, Linking, Pressable, ScrollView, Share, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppBar } from "@/components/AppBar";
import { formatDistance, formatRating, initialsOf } from "@/lib/format";
import { supabase } from "@/lib/supabase";

type Review = Awaited<ReturnType<typeof getProviderReviews>>[number];

export default function ProviderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, radii, spacing, layout } = useTheme();
  const insets = useSafeAreaInsets();

  const [provider, setProvider] = useState<ProviderWithDetails | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let active = true;
    setLoading(true);
    setError(null);

    Promise.all([getProviderById(supabase, id), getProviderReviews(supabase, id)])
      .then(([p, r]) => {
        if (!active) return;
        setProvider(p as ProviderWithDetails | null);
        setReviews(r);
      })
      .catch(() => {
        if (active) setError("Não foi possível carregar este perfil. Tente de novo.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

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

  const openWhatsApp = () => {
    void Linking.openURL(getWhatsAppUrl(provider.whatsapp, name));
  };

  const shareProfile = () => {
    void Share.share({
      message: `Encontrei ${name}, ${provider.categories[0]?.name ?? "profissional"} no eufaço!`,
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <AppBar />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: layout.screenPadding,
          paddingBottom: spacing[6],
          gap: spacing[6],
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ alignItems: "center", gap: spacing[3] }}>
          <View
            style={{
              width: 94,
              height: 94,
              borderRadius: 26,
              backgroundColor: colors.primarySoft,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text variant="h1" color="primaryStrong">
              {initialsOf(name)}
            </Text>
          </View>

          <Text variant="h1" style={{ textAlign: "center" }}>
            {name}
          </Text>

          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing[2], justifyContent: "center" }}>
            {provider.categories.map((c) => (
              <Badge key={c.id} label={c.name} tone="primary" />
            ))}
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing[1] }}>
            <MapPin size={13} color={colors.textMuted} />
            <Text variant="caption" color="textSecondary">
              {[provider.neighborhood, provider.city].filter(Boolean).join(", ")}
              {distance ? ` · ${distance}` : ""}
            </Text>
          </View>

          <Card style={{ flexDirection: "row", alignItems: "center", paddingVertical: spacing[3] }}>
            {[
              { value: rating ?? "—", label: "Avaliação" },
              { value: String(provider.review_count), label: "Avaliações" },
              { value: provider.categories.length ? String(provider.categories.length) : "—", label: "Serviços" },
            ].map((stat, i) => (
              <View key={stat.label} style={{ flexDirection: "row", flex: 1, alignItems: "center" }}>
                <View style={{ flex: 1, alignItems: "center", gap: 2 }}>
                  <Text variant="h3">{stat.value}</Text>
                  <Text variant="caption" color="textMuted">
                    {stat.label}
                  </Text>
                </View>
                {i < 2 ? <View style={{ width: 1, height: 30, backgroundColor: colors.border }} /> : null}
              </View>
            ))}
          </Card>
        </View>

        {provider.description ? (
          <View style={{ gap: spacing[2] }}>
            <Text variant="h3">Sobre</Text>
            <Text color="textSecondary">{provider.description}</Text>
          </View>
        ) : null}

        <Card style={{ flexDirection: "row", alignItems: "center", gap: spacing[3] }}>
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
            <Text variant="bodyStrong" color={isOpen ? "success" : "textPrimary"}>
              {isOpen ? "Aberto agora" : "Fechado agora"}
            </Text>
            <Text variant="caption" color="textSecondary">
              {hoursLabel || "Horário não informado"}
            </Text>
          </View>
        </Card>

        <View style={{ gap: spacing[3] }}>
          <Text variant="h3">
            {provider.review_count > 0 ? `Avaliações (${provider.review_count})` : "Avaliações"}
          </Text>

          {reviews.length === 0 ? (
            <Card style={{ alignItems: "center", paddingVertical: spacing[6], gap: spacing[1] }}>
              <Text variant="bodyStrong">Ainda sem avaliações</Text>
              <Text variant="caption" color="textSecondary" style={{ textAlign: "center" }}>
                Seja a primeira pessoa a contar como foi o serviço.
              </Text>
            </Card>
          ) : (
            reviews.slice(0, 5).map((review) => (
              <Card key={review.id} style={{ gap: spacing[2] }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: spacing[2] }}>
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
                    <Text variant="label" color="textSecondary">
                      {initialsOf(review.client.full_name)}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text variant="bodyStrong">{review.client.full_name}</Text>
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
                {review.comment ? <Text color="textSecondary">{review.comment}</Text> : null}
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
      </ScrollView>

      {/* Barra de ação fixa: o contato é a única coisa que importa nesta tela */}
      <View
        style={{
          flexDirection: "row",
          gap: spacing[2] + 2,
          paddingHorizontal: layout.screenPadding,
          paddingTop: spacing[3],
          paddingBottom: Math.max(insets.bottom, spacing[4]),
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        }}
      >
        <View style={{ flex: 1 }}>
          <Button
            label="Pedir orçamento"
            variant="whatsapp"
            icon={<MessageCircle size={19} color="#FFFFFF" />}
            onPress={openWhatsApp}
          />
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Compartilhar perfil"
          onPress={shareProfile}
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
    </View>
  );
}
