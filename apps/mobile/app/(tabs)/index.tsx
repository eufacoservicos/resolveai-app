import {
  SERVICE_CATEGORIES,
  getRecommendedProviders,
  getUnreadCount,
  type RecommendedProvider,
} from "@eufaco/shared";
import {
  Button,
  Card,
  Text,
  fontSize,
  letterSpacing,
  lineHeight,
  nativeFonts,
  useShadow,
  useTheme,
} from "@eufaco/design-system/native";
import { Bell, ChevronDown, ChevronRight, MapPin, Search, Wrench } from "lucide-react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FeaturedCard } from "@/components/FeaturedCard";
import { ProviderCard } from "@/components/ProviderCard";
import { SectionHeader } from "@/components/SectionHeader";
import { useTabBarClearance } from "@/components/TabBar";
import { useFavorites } from "@/hooks/useFavorites";
import { useProviders } from "@/hooks/useProviders";
import { iconForCategory } from "@/lib/category-icons";
import { locationFilters, useLocation } from "@/lib/location";
import { initialsOf } from "@/lib/format";
import { useSession } from "@/lib/session";
import { supabase } from "@/lib/supabase";

const CHIPS = SERVICE_CATEGORIES.slice(0, 6);

/** Só o primeiro nome: "Olá, Luiz" soa melhor que o nome completo. */
function firstNameOf(fullName: string | undefined): string | null {
  const first = fullName?.trim().split(/\s+/)[0];
  return first || null;
}

export default function HomeScreen() {
  const { colors, radii, spacing, layout } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { session } = useSession();
  const { location, radiusKm, label: locationLabel } = useLocation();
  const { favoriteIds, toggle } = useFavorites();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [recommended, setRecommended] = useState<RecommendedProvider[]>([]);
  const [unread, setUnread] = useState(0);
  const panelShadow = useShadow("panel");
  const searchShadow = useShadow("card");
  const tabBarClearance = useTabBarClearance();

  const { providers, loading, error, refresh } = useProviders({
    categorySlug: activeCategory ?? undefined,
    orderBy: "recent",
    page: 1,
    pageSize: 10,
    ...locationFilters(location, radiusKm),
  });

  useEffect(() => {
    let active = true;
    getRecommendedProviders(supabase)
      .then((result) => {
        if (active) setRecommended(result);
      })
      .catch(() => {
        // Destaque é acessório: falhar aqui não pode esvaziar a Home
      });
    return () => {
      active = false;
    };
  }, []);

  const userId = session?.user.id;

  useFocusEffect(
    useCallback(() => {
      if (!userId) {
        setUnread(0);
        return;
      }
      let active = true;
      void getUnreadCount(supabase, userId).then((count) => {
        if (active) setUnread(count);
      });
      return () => {
        active = false;
      };
    }, [userId]),
  );

  const fullName = session?.user.user_metadata?.full_name as string | undefined;
  const firstName = firstNameOf(fullName);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ paddingBottom: tabBarClearance }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={loading && providers.length > 0}
          onRefresh={refresh}
          tintColor={colors.primary}
        />
      }
    >
      {/* Painel de cabeçalho: separa a busca do resto do conteúdo */}
      <View
        style={[
          {
            backgroundColor: colors.surface,
            borderBottomLeftRadius: radii.xl,
            borderBottomRightRadius: radii.xl,
            paddingTop: insets.top + spacing[4],
            paddingHorizontal: layout.screenPadding,
            paddingBottom: spacing[5],
            gap: spacing[4],
          },
          panelShadow,
        ]}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
          }}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Mudar localização"
            onPress={() => router.push("/location")}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 5,
              backgroundColor: colors.surface2,
              borderRadius: radii.full,
              paddingVertical: 7,
              paddingLeft: 9,
              paddingRight: 11,
            }}
          >
            <MapPin size={14} color={colors.primaryStrong} />
            <Text variant="label" numberOfLines={1} style={{ maxWidth: 170 }}>
              {locationLabel}
            </Text>
            <ChevronDown size={13} color={colors.textMuted} />
          </Pressable>

          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing[2] }}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={unread > 0 ? `Avisos, ${unread} não lidos` : "Avisos"}
              onPress={() => router.push("/notifications")}
              style={{
                width: 38,
                height: 38,
                borderRadius: radii.full,
                backgroundColor: colors.surface2,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Bell size={18} color={colors.textPrimary} />
              {/* Marcador de aviso não lido, com anel da cor do painel */}
              {unread > 0 ? (
                <View
                  style={{
                    position: "absolute",
                    top: 4,
                    right: 3,
                    width: 9,
                    height: 9,
                    borderRadius: radii.full,
                    backgroundColor: colors.danger,
                    borderWidth: 2,
                    borderColor: colors.surface,
                  }}
                />
              ) : null}
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={session ? "Seu perfil" : "Entrar"}
              onPress={() => router.push(session ? "/profile" : "/login")}
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
                {initialsOf(fullName ?? session?.user.email ?? "?")}
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={{ gap: 2 }}>
          {firstName ? (
            <Text
              color="textSecondary"
              style={{ fontFamily: nativeFonts.bodyMedium, fontSize: fontSize.chip }}
            >
              Olá, {firstName} 👋
            </Text>
          ) : null}
          <Text variant="h1">Encontre o profissional ideal</Text>
        </View>

        <Pressable
          accessibilityRole="search"
          accessibilityLabel="Buscar profissionais"
          onPress={() => router.push("/search")}
          style={[
            {
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              height: 52,
              paddingHorizontal: spacing[4],
              borderRadius: radii.full,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
            },
            searchShadow,
          ]}
        >
          <Search size={19} color={colors.textMuted} />
          <Text color="textMuted" style={{ fontSize: fontSize.field }}>
            Eletricista, pintor, diarista...
          </Text>
        </Pressable>
      </View>

      <View style={{ paddingTop: 22, gap: spacing[6] }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: layout.screenPadding, gap: spacing[2] }}
        >
          {CHIPS.map((cat) => {
            const active = activeCategory === cat.slug;
            const Icon = iconForCategory(cat.slug);
            return (
              <Pressable
                key={cat.slug}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                // Tocar no chip aceso apaga o filtro: é o único jeito de
                // voltar a "todos" sem um chip que o protótipo não tem.
                onPress={() => setActiveCategory(active ? null : cat.slug)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  paddingVertical: 9,
                  paddingHorizontal: 14,
                  borderRadius: radii.full,
                  backgroundColor: active ? colors.primary : colors.surface,
                  borderWidth: 1,
                  borderColor: active ? colors.primary : colors.border,
                }}
              >
                <Icon size={14} color={active ? colors.onPrimary : colors.textSecondary} />
                <Text variant="chip" color={active ? "onPrimary" : "textSecondary"}>
                  {cat.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {recommended.length > 0 ? (
          <View style={{ gap: 11 }}>
            <View style={{ paddingHorizontal: layout.screenPadding }}>
              <SectionHeader
                title="Profissionais recomendados"
                subtitle="Perfis em destaque com ofertas exclusivas"
                actionLabel="Ver todos"
                onAction={() => router.push("/search")}
              />
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: layout.screenPadding, gap: 10 }}
            >
              {recommended.map((item) => (
                <FeaturedCard
                  key={item.provider.id}
                  item={item}
                  onPress={() => router.push(`/provider/${item.provider.id}`)}
                />
              ))}
            </ScrollView>
          </View>
        ) : null}

        <View style={{ paddingHorizontal: layout.screenPadding, gap: 10 }}>
          <SectionHeader
            title="Perto de você"
            actionLabel="Ver todos"
            onAction={() => router.push("/search")}
          />

          {loading && providers.length === 0 ? (
            <View style={{ paddingVertical: spacing[10], alignItems: "center" }}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : error ? (
            <Card style={{ gap: spacing[3], alignItems: "center", paddingVertical: spacing[6] }}>
              <Text variant="bodyStrong" style={{ textAlign: "center" }}>
                {error}
              </Text>
              <Button label="Tentar de novo" size="md" fullWidth={false} onPress={refresh} />
            </Card>
          ) : providers.length === 0 ? (
            <Card style={{ gap: spacing[2], alignItems: "center", paddingVertical: spacing[8] }}>
              <Text variant="title">Nenhum profissional por aqui</Text>
              <Text color="textSecondary" style={{ textAlign: "center" }}>
                Tente outra categoria ou volte mais tarde — novos perfis entram toda semana.
              </Text>
            </Card>
          ) : (
            <View style={{ gap: 10 }}>
              {providers.map((p) => (
                <ProviderCard
                  key={p.id}
                  provider={p}
                  favorited={favoriteIds.has(p.id)}
                  onToggleFavorite={() => void toggle(p.id)}
                  onPress={() => router.push(`/provider/${p.id}`)}
                />
              ))}
            </View>
          )}
        </View>

        <View style={{ paddingHorizontal: layout.screenPadding }}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push(session ? "/plans" : "/register")}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              padding: 14,
              borderRadius: radii.lg,
              backgroundColor: colors.primarySoft,
            }}
          >
            <View
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                backgroundColor: colors.surface,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Wrench size={20} color={colors.primaryStrong} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text
                variant="title"
                style={{ fontSize: fontSize.base, letterSpacing: letterSpacing.subtle }}
              >
                Quer oferecer seus serviços?
              </Text>
              <Text
                color="textSecondary"
                style={{ fontSize: fontSize.note, lineHeight: fontSize.note * lineHeight.snug }}
              >
                Cadastre-se grátis e receba clientes
              </Text>
            </View>
            <ChevronRight size={18} color={colors.primaryStrong} />
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
