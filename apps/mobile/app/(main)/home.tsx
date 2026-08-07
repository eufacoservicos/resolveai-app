import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Bell,
  ChevronDown,
  Heart,
  MapPin,
  MapPinOff,
  Search as SearchIcon,
  Sparkles,
  Star,
  TrendingUp,
  Wrench,
} from "lucide-react-native";
import { toast } from "sonner-native";
import {
  getActiveProviders,
  getCities,
  getUserFavorites,
} from "@resolveai/shared/supabase/queries";
import {
  getLocationLabel,
  toProviderFilters,
} from "@resolveai/shared/location";
import { CATEGORY_GROUPS } from "@resolveai/shared/constants";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-provider";
import { useLocation } from "@/lib/location-provider";
import { getCategoryIcon } from "@/lib/category-icons";
import { useTabBarPadding } from "@/lib/layout";
import { LocationGate } from "@/components/location/location-gate";
import {
  ProviderCard,
  type ProviderCardData,
} from "@/components/providers/provider-card";
import { ProviderCardFeatured } from "@/components/providers/provider-card-featured";
import { AmbientBg } from "@/components/ui/ambient-bg";
import { Button } from "@/components/ui/button";
import { CategoryCircle } from "@/components/ui/category-circle";
import {
  PromoBanner,
  type PromoBannerData,
} from "@/components/ui/promo-banner";
import { SectionHeader } from "@/components/ui/section-header";
import { Muted, Text } from "@/components/ui/text";

const PAGE_SIZE = 8;
const FEATURED_LIMIT = 6;

const CIRCLE_TINTS: Array<"cyan" | "violet" | "amber" | "emerald" | "rose"> = [
  "cyan",
  "violet",
  "amber",
  "emerald",
  "rose",
  "cyan",
  "violet",
  "amber",
];

export default function HomeScreen() {
  const { user } = useAuth();
  const { location, isLoading: locationLoading } = useLocation();
  const tabBarPad = useTabBarPadding();
  const [categorySlug, setCategorySlug] = useState<string | undefined>();
  const [extraProviders, setExtraProviders] = useState<ProviderCardData[]>([]);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const locationFilters = useMemo(
    () => toProviderFilters(location),
    [location]
  );
  const isLocationFiltered = !!location;
  const locationLabel = getLocationLabel(location);

  const filters = useMemo(
    () => ({
      categorySlug,
      orderBy: "recent" as const,
      ...locationFilters,
    }),
    [categorySlug, locationFilters]
  );

  const citiesQuery = useQuery({
    queryKey: ["cities"],
    queryFn: () => getCities(supabase),
  });

  const favoritesQuery = useQuery({
    queryKey: ["favorites", user?.id],
    queryFn: () => getUserFavorites(supabase, user!.id),
    enabled: !!user,
  });
  const favoriteIds = useMemo(
    () => favoritesQuery.data ?? [],
    [favoritesQuery.data]
  );

  const providersQuery = useQuery({
    queryKey: ["providers", "home", filters],
    enabled: !locationLoading,
    queryFn: () =>
      getActiveProviders(supabase, { ...filters, page: 1, pageSize: PAGE_SIZE }),
  });

  const topRatedQuery = useQuery({
    queryKey: ["providers", "top-rated", locationFilters],
    enabled: !locationLoading,
    queryFn: () =>
      getActiveProviders(supabase, {
        ...locationFilters,
        orderBy: "rating",
        page: 1,
        pageSize: FEATURED_LIMIT,
      }),
  });

  const nearbyQuery = useQuery({
    queryKey: ["providers", "nearby", locationFilters],
    enabled: !locationLoading && isLocationFiltered,
    queryFn: () =>
      getActiveProviders(supabase, {
        ...locationFilters,
        orderBy: "distance",
        page: 1,
        pageSize: FEATURED_LIMIT,
      }),
  });

  useEffect(() => {
    setExtraProviders([]);
    setPage(1);
  }, [filters]);

  const total = providersQuery.data?.total ?? 0;

  const providers = useMemo(() => {
    const base = (providersQuery.data?.providers ?? []) as ProviderCardData[];
    const merged = [...base];
    for (const p of extraProviders) {
      if (!merged.some((m) => m.id === p.id)) merged.push(p);
    }
    const favSet = new Set(favoriteIds);
    return merged.sort(
      (a, b) => (favSet.has(b.id) ? 1 : 0) - (favSet.has(a.id) ? 1 : 0)
    );
  }, [providersQuery.data, extraProviders, favoriteIds]);

  const hasMore = providers.length < total;

  const handleLoadMore = useCallback(async () => {
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const { providers: next } = await getActiveProviders(supabase, {
        ...filters,
        page: nextPage,
        pageSize: PAGE_SIZE,
      });
      setExtraProviders((prev) => [...prev, ...(next as ProviderCardData[])]);
      setPage(nextPage);
    } catch {
      toast.error("Não foi possível carregar mais profissionais.");
    } finally {
      setLoadingMore(false);
    }
  }, [filters, page]);

  const isBusy = locationLoading || providersQuery.isLoading;

  const nearbyList = (nearbyQuery.data?.providers ?? []) as ProviderCardData[];
  const topRatedList = ((topRatedQuery.data?.providers ?? []) as ProviderCardData[])
    .filter((p) => p.average_rating != null)
    .slice(0, FEATURED_LIMIT);

  const banners: PromoBannerData[] = useMemo(
    () => [
      {
        id: "become-provider",
        title: "Ganhe clientes sem pagar comissão",
        subtitle: "Sou prestador",
        cta: "Cadastre-se grátis",
        icon: Wrench,
        palette: "cyan",
        onPress: () =>
          router.push(user ? "/become-provider" : "/register"),
      },
      {
        id: "top-rated",
        title: "Os melhores da sua região",
        subtitle: "Bem avaliados",
        cta: "Ver todos",
        icon: Star,
        palette: "sunset",
        onPress: () => router.push("/search"),
      },
      {
        id: "favorites",
        title: "Salve profissionais para depois",
        subtitle: "Favoritos",
        cta: "Explorar",
        icon: Heart,
        palette: "violet",
        onPress: () => router.push(user ? "/favorites" : "/register"),
      },
    ],
    [user]
  );

  const featuredCategories = CATEGORY_GROUPS.slice(0, 8);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="absolute inset-x-0 top-0 h-[460px]">
        <AmbientBg />
      </View>

      {/* ═══════ HEADER STICKY ═══════ */}
      <View className="px-5 pb-5 pt-1">
        <View className="mb-4 flex-row items-center justify-between">
          <View className="flex-1 pr-3">
            <Muted className="text-sm">Olá 👋</Muted>
            <Text className="mt-0.5 text-[22px] font-black leading-7 tracking-tight text-foreground">
              O que você precisa hoje?
            </Text>
          </View>
          {user && (
            <Pressable
              onPress={() => router.push("/favorites")}
              hitSlop={8}
              className="h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-card/60 active:bg-card"
            >
              <Bell size={20} color="#f5f7fb" />
            </Pressable>
          )}
        </View>

        {/* Location pill */}
        <LocationHeaderPill
          label={locationLabel}
          hasCities={(citiesQuery.data?.length ?? 0) > 0}
        />

        {/* Search pill */}
        <Pressable
          onPress={() => router.push("/search")}
          className="mt-4 flex-row items-center gap-3 rounded-2xl border border-white/10 bg-card/60 px-4 py-4 active:bg-card"
        >
          <View className="h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
            <SearchIcon size={20} color="#22d3ee" />
          </View>
          <Text className="flex-1 text-[15px] text-muted-foreground">
            Buscar eletricista, pintor, diarista...
          </Text>
          <View className="rounded-full bg-primary/15 px-3 py-1.5">
            <Text className="text-[11px] font-bold uppercase tracking-wide text-primary">
              Ir
            </Text>
          </View>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: tabBarPad + 28 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            tintColor="#22d3ee"
            colors={["#22d3ee"]}
            refreshing={
              providersQuery.isFetching && !providersQuery.isLoading
            }
            onRefresh={() => {
              setExtraProviders([]);
              setPage(1);
              void providersQuery.refetch();
              void topRatedQuery.refetch();
              void nearbyQuery.refetch();
              void favoritesQuery.refetch();
            }}
          />
        }
      >
        <LocationGate cities={citiesQuery.data ?? []} />

        {/* ═══════ CARROSSEL DE BANNERS ═══════ */}
        <View className="mt-1">
          <FlatList
            data={banners}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <PromoBanner banner={item} />}
            horizontal
            showsHorizontalScrollIndicator={false}
            ItemSeparatorComponent={() => <View className="w-3.5" />}
            contentContainerStyle={{ paddingHorizontal: 20 }}
          />
        </View>

        {/* ═══════ CATEGORIAS EM CÍRCULO ═══════ */}
        <View className="mt-10">
          <View className="px-5">
            <SectionHeader
              title="Categorias"
              subtitle="Escolha o tipo de serviço"
              actionLabel="Ver todas"
              onAction={() => router.push("/categories")}
            />
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 14 }}
          >
            <CategoryCircle
              icon={Sparkles}
              label="Todas"
              active={!categorySlug}
              tint="cyan"
              onPress={() => setCategorySlug(undefined)}
            />
            {featuredCategories.map((cat, i) => (
              <CategoryCircle
                key={cat.slug}
                icon={getCategoryIcon(cat.slug)}
                label={cat.name}
                active={categorySlug === cat.slug}
                tint={CIRCLE_TINTS[i % CIRCLE_TINTS.length]}
                onPress={() =>
                  setCategorySlug((prev) =>
                    prev === cat.slug ? undefined : cat.slug
                  )
                }
              />
            ))}
          </ScrollView>
        </View>

        {/* ═══════ PERTO DE VOCÊ ═══════ */}
        {isLocationFiltered && nearbyList.length > 0 && (
          <View className="mt-10">
            <View className="px-5">
              <SectionHeader
                title="Perto de você"
                subtitle={`Profissionais em ${locationLabel}`}
                actionLabel="Ver todos"
                onAction={() => router.push("/search")}
              />
            </View>
            <FlatList
              data={nearbyList}
              keyExtractor={(item) => `nearby-${item.id}`}
              renderItem={({ item }) => (
                <ProviderCardFeatured provider={item} />
              )}
              horizontal
              showsHorizontalScrollIndicator={false}
              ItemSeparatorComponent={() => <View className="w-3.5" />}
              contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 2 }}
            />
          </View>
        )}

        {/* ═══════ MAIS BEM AVALIADOS ═══════ */}
        {topRatedList.length > 0 && (
          <View className="mt-10">
            <View className="px-5">
              <SectionHeader
                title="Mais bem avaliados"
                subtitle="Escolha com segurança"
                actionLabel="Ver todos"
                onAction={() => router.push("/search")}
              />
            </View>
            <FlatList
              data={topRatedList}
              keyExtractor={(item) => `top-${item.id}`}
              renderItem={({ item }) => (
                <ProviderCardFeatured provider={item} />
              )}
              horizontal
              showsHorizontalScrollIndicator={false}
              ItemSeparatorComponent={() => <View className="w-3.5" />}
              contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 2 }}
            />
          </View>
        )}

        {/* ═══════ TODOS OS PROFISSIONAIS ═══════ */}
        <View className="mt-10 px-5">
          <SectionHeader
            title={categorySlug ? "Filtrado" : "Todos"}
            subtitle={
              categorySlug
                ? "Mostrando só a categoria selecionada"
                : `${total} profissionais disponíveis`
            }
          />

          {isBusy ? (
            <View className="items-center py-16">
              <ActivityIndicator size="large" color="#22d3ee" />
            </View>
          ) : providers.length === 0 ? (
            <View className="items-center py-16">
              <View className="mb-5 h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-card/60">
                {isLocationFiltered ? (
                  <MapPinOff size={28} color="#8891a4" />
                ) : (
                  <SearchIcon size={28} color="#8891a4" />
                )}
              </View>
              <Text className="text-center text-xl font-bold">
                Nenhum profissional
              </Text>
              <Muted className="mt-2 max-w-xs text-center text-[15px] leading-5">
                {isLocationFiltered
                  ? "Tente alterar sua localização ou buscar em outra cidade."
                  : "Tente outra categoria."}
              </Muted>
            </View>
          ) : (
            <View className="gap-3.5">
              {providers.map((item) => (
                <ProviderCard
                  key={item.id}
                  provider={item}
                  userId={user?.id ?? null}
                  isFavorited={favoriteIds.includes(item.id)}
                />
              ))}
              {hasMore && (
                <Pressable
                  onPress={handleLoadMore}
                  disabled={loadingMore}
                  className="mt-3 flex-row items-center justify-center gap-2 self-center rounded-full border border-white/10 bg-card/60 px-7 py-3.5 active:bg-card"
                >
                  {loadingMore ? (
                    <>
                      <ActivityIndicator size="small" color="#8891a4" />
                      <Text className="text-sm font-semibold text-muted-foreground">
                        Carregando...
                      </Text>
                    </>
                  ) : (
                    <Text className="text-sm font-semibold">
                      Carregar mais
                    </Text>
                  )}
                </Pressable>
              )}
            </View>
          )}
        </View>

        {/* ═══════ CTA PRESTADOR ═══════ */}
        <View className="mt-12 px-5">
          <View className="relative overflow-hidden rounded-3xl border border-white/10">
            <AmbientBg variant="violet" />
            <View className="p-6">
              <View className="mb-4 self-start rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1">
                <View className="flex-row items-center gap-1.5">
                  <TrendingUp size={12} color="#34d399" />
                  <Text className="text-xs font-bold text-emerald-400">
                    Para prestadores
                  </Text>
                </View>
              </View>
              <Text className="text-2xl font-black tracking-tight text-foreground">
                Ganhe clientes todos os dias.
              </Text>
              <Muted className="mt-2 text-base">
                Cadastre-se em 2 minutos e comece a receber contatos direto no
                seu WhatsApp — sem comissão.
              </Muted>
              <Button
                variant="gradient"
                size="default"
                className="mt-5 self-start"
                onPress={() =>
                  router.push(user ? "/become-provider" : "/register")
                }
              >
                <Wrench size={16} color="#05070a" />
                <Text className="text-sm font-bold text-primary-foreground">
                  Começar agora
                </Text>
                <ArrowRight size={16} color="#05070a" />
              </Button>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Header location pill ───────────────────────────────────────────
function LocationHeaderPill({
  label,
  hasCities,
}: {
  label?: string;
  hasCities: boolean;
}) {
  const { location } = useLocation();
  if (!hasCities) return null;

  return (
    <View className="flex-row">
      <View className="h-10 flex-row items-center gap-2 rounded-full border border-primary/25 bg-primary/10 pl-3.5 pr-3">
        <MapPin size={15} color="#22d3ee" />
        <Text className="text-sm font-bold text-primary" numberOfLines={1}>
          {location ? label : "Toda a região"}
        </Text>
        <ChevronDown size={15} color="#22d3ee" />
      </View>
    </View>
  );
}
