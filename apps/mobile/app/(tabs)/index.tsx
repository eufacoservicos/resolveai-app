import { SERVICE_CATEGORIES } from "@eufaco/shared";
import { Button, Card, Text, useTheme } from "@eufaco/design-system/native";
import { ArrowRight, Bell, ChevronDown, ChevronRight, MapPin, Search, Wrench } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ProviderCard } from "@/components/ProviderCard";
import { useFavorites } from "@/hooks/useFavorites";
import { useProviders } from "@/hooks/useProviders";

const CHIPS = SERVICE_CATEGORIES.slice(0, 6);

export default function HomeScreen() {
  const { colors, radii, spacing, layout } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { favoriteIds, toggle } = useFavorites();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const { providers, total, loading, error, refresh } = useProviders({
    categorySlug: activeCategory ?? undefined,
    orderBy: "recent",
    page: 1,
    pageSize: 10,
  });

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ paddingBottom: 110 }}
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
        style={{
          backgroundColor: colors.surface,
          borderBottomLeftRadius: radii.xl,
          borderBottomRightRadius: radii.xl,
          paddingTop: insets.top + spacing[2],
          paddingHorizontal: layout.screenPadding,
          paddingBottom: spacing[5],
          gap: spacing[4],
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Mudar localização"
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: spacing[1] + 1,
              backgroundColor: colors.surface2,
              borderRadius: radii.full,
              paddingVertical: 7,
              paddingLeft: 9,
              paddingRight: 11,
            }}
          >
            <MapPin size={14} color={colors.primaryStrong} />
            <Text variant="label">Escolher localização</Text>
            <ChevronDown size={13} color={colors.textMuted} />
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Avisos"
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
          </Pressable>
        </View>

        <Text variant="h1">Encontre o profissional ideal</Text>

        <Pressable
          accessibilityRole="search"
          accessibilityLabel="Buscar profissionais"
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: spacing[2] + 2,
            height: 52,
            paddingHorizontal: spacing[4],
            borderRadius: radii.full,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Search size={19} color={colors.textMuted} />
          <Text color="textMuted">Eletricista, pintor, diarista...</Text>
        </Pressable>
      </View>

      <View style={{ paddingTop: spacing[6], gap: spacing[6] }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: layout.screenPadding, gap: spacing[2] }}
        >
          {[{ slug: null as string | null, name: "Todos" }, ...CHIPS].map((cat) => {
            const active = activeCategory === cat.slug;
            return (
              <Pressable
                key={cat.slug ?? "todos"}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => setActiveCategory(cat.slug)}
                style={{
                  paddingVertical: 9,
                  paddingHorizontal: 14,
                  borderRadius: radii.full,
                  backgroundColor: active ? colors.primary : colors.surface,
                  borderWidth: 1,
                  borderColor: active ? colors.primary : colors.border,
                }}
              >
                <Text variant="label" color={active ? "onPrimary" : "textSecondary"}>
                  {cat.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={{ paddingHorizontal: layout.screenPadding, gap: spacing[3] }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text variant="h3">{total > 0 ? `Profissionais (${total})` : "Profissionais"}</Text>
            {total > 0 ? (
              <Pressable
                accessibilityRole="button"
                style={{ flexDirection: "row", alignItems: "center", gap: 2 }}
              >
                <Text variant="label" color="primaryStrong">
                  Ver todos
                </Text>
                <ChevronRight size={14} color={colors.primaryStrong} />
              </Pressable>
            ) : null}
          </View>

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
            <View style={{ gap: spacing[3] - 2 }}>
              {providers.map((p) => (
                <ProviderCard
                  key={p.id}
                  provider={p}
                  onPress={() => router.push(`/provider/${p.id}`)}
                favorited={favoriteIds.has(p.id)}
                  onToggleFavorite={() => void toggle(p.id)}
                />
              ))}
            </View>
          )}
        </View>

        <View style={{ paddingHorizontal: layout.screenPadding }}>
          <Pressable
            accessibilityRole="button"
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: spacing[3],
              padding: spacing[3] + 2,
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
              <Text variant="bodyStrong">Quer oferecer seus serviços?</Text>
              <Text variant="caption" color="textSecondary">
                Cadastre-se grátis e receba clientes
              </Text>
            </View>
            <ArrowRight size={18} color={colors.primaryStrong} />
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
