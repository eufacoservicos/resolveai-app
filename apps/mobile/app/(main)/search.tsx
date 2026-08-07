import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  MapPinOff,
  Search as SearchIcon,
  Sparkles,
  X,
} from "lucide-react-native";
import {
  getActiveProviders,
  getCategories,
  getCities,
  getUserFavorites,
} from "@resolveai/shared/supabase/queries";
import { toProviderFilters } from "@resolveai/shared/location";
import { CATEGORY_GROUPS } from "@resolveai/shared/constants";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-provider";
import { useLocation } from "@/lib/location-provider";
import { getCategoryIcon } from "@/lib/category-icons";
import { useTabBarPadding } from "@/lib/layout";
import { LocationGate } from "@/components/location/location-gate";
import {
  SearchFilters,
  type GeoFilter,
  type SearchOrder,
} from "@/components/providers/search-filters";
import {
  ProviderCard,
  type ProviderCardData,
} from "@/components/providers/provider-card";
import { AmbientBg } from "@/components/ui/ambient-bg";
import { CategoryCircle } from "@/components/ui/category-circle";
import { Display, Muted, Text } from "@/components/ui/text";
import { cn } from "@resolveai/shared/cn";

const PAGE_SIZE = 12;

const ORDER_BY: Record<SearchOrder, "rating" | "recent" | "distance"> = {
  recentes: "recent",
  avaliacao: "rating",
  distancia: "distance",
};

const SUGGESTED_TINTS = [
  "cyan",
  "violet",
  "amber",
  "emerald",
  "rose",
] as const;

export default function SearchScreen() {
  const params = useLocalSearchParams<{ q?: string; categoria?: string }>();
  const { user } = useAuth();
  const { location, isLoading: locationLoading } = useLocation();
  const tabBarPad = useTabBarPadding();

  const [search, setSearch] = useState(params.q ?? "");
  const [categorySlug, setCategorySlug] = useState<string | undefined>(
    params.categoria
  );
  const [order, setOrder] = useState<SearchOrder>("recentes");
  const [geo, setGeo] = useState<GeoFilter | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (params.q !== undefined) setSearch(params.q);
  }, [params.q]);

  useEffect(() => {
    if (params.categoria !== undefined) setCategorySlug(params.categoria);
  }, [params.categoria]);

  const locationFilters = useMemo(() => {
    if (geo) {
      return { latitude: geo.lat, longitude: geo.lng, radiusKm: geo.radiusKm };
    }
    return toProviderFilters(location);
  }, [geo, location]);

  const isLocationFiltered =
    locationFilters.latitude != null || !!locationFilters.city;

  const hasQuery = search.trim().length > 0 || !!categorySlug;

  const filters = useMemo(
    () => ({
      search: search || undefined,
      categorySlug,
      orderBy: ORDER_BY[order],
      ...locationFilters,
    }),
    [search, categorySlug, order, locationFilters]
  );

  useEffect(() => setPage(1), [filters]);

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories(supabase),
  });

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
    queryKey: ["providers", "search", filters, page],
    enabled: !locationLoading && hasQuery,
    queryFn: () =>
      getActiveProviders(supabase, { ...filters, page, pageSize: PAGE_SIZE }),
  });

  const total = providersQuery.data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const providers = useMemo(() => {
    const list = [...((providersQuery.data?.providers ?? []) as ProviderCardData[])];
    const favSet = new Set(favoriteIds);
    return list.sort(
      (a, b) => (favSet.has(b.id) ? 1 : 0) - (favSet.has(a.id) ? 1 : 0)
    );
  }, [providersQuery.data, favoriteIds]);

  const isBusy = locationLoading || (hasQuery && providersQuery.isLoading);

  const suggestedCategories = CATEGORY_GROUPS.slice(0, 10);

  const header = (
    <View className="gap-5 pb-3">
      <LocationGate cities={citiesQuery.data ?? []} />

      {!hasQuery && (
        <View>
          <Display className="text-[30px] leading-[32px]">
            O que você{"\n"}
            <Text className="text-[30px] font-black text-primary">precisa?</Text>
          </Display>
          <Muted className="mt-2 text-base">
            Busque pelo tipo de serviço ou nome do profissional.
          </Muted>
        </View>
      )}

      {/* Big search input */}
      <View className="flex-row items-center gap-3 rounded-2xl border border-white/10 bg-card/60 px-4 py-3.5">
        <View className="h-9 w-9 items-center justify-center rounded-xl bg-primary/15">
          <SearchIcon size={18} color="#22d3ee" />
        </View>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar profissional ou serviço..."
          placeholderTextColor="#5c6478"
          selectionColor="#22d3ee"
          returnKeyType="search"
          autoFocus={!params.q && !params.categoria}
          className="min-w-0 flex-1 text-base text-foreground"
        />
        {(search.length > 0 || categorySlug) && (
          <Pressable
            onPress={() => {
              setSearch("");
              setCategorySlug(undefined);
            }}
            hitSlop={8}
            className="h-7 w-7 items-center justify-center rounded-full bg-white/[0.06] active:bg-white/[0.10]"
          >
            <X size={14} color="#8891a4" />
          </Pressable>
        )}
      </View>

      {hasQuery && (
        <SearchFilters
          categories={categoriesQuery.data ?? []}
          cities={citiesQuery.data ?? []}
          search={search}
          onSearchChange={setSearch}
          categorySlug={categorySlug}
          onCategoryChange={setCategorySlug}
          order={order}
          onOrderChange={setOrder}
          geo={geo}
          onGeoChange={setGeo}
          resultCount={total}
        />
      )}
    </View>
  );

  const emptyState = isBusy ? (
    <View className="items-center gap-3 py-16">
      <ActivityIndicator size="large" color="#22d3ee" />
      <Muted>Buscando profissionais...</Muted>
    </View>
  ) : hasQuery ? (
    <View className="items-center py-16">
      <View className="mb-4 h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-card/60">
        {isLocationFiltered ? (
          <MapPinOff size={28} color="#8891a4" />
        ) : (
          <SearchIcon size={28} color="#8891a4" />
        )}
      </View>
      <Text className="text-center text-lg font-bold">Nada por aqui</Text>
      <Muted className="mt-1.5 max-w-xs text-center">
        Tente ajustar os filtros ou buscar por outro termo.
      </Muted>
    </View>
  ) : (
    <SuggestionsGrid
      suggestedCategories={suggestedCategories}
      onSelectCategory={(slug) => setCategorySlug(slug)}
    />
  );

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="absolute inset-x-0 top-0 h-[360px]">
        <AmbientBg />
      </View>
      <FlatList
        data={hasQuery ? providers : []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProviderCard
            provider={item}
            userId={user?.id ?? null}
            isFavorited={favoriteIds.includes(item.id)}
          />
        )}
        ItemSeparatorComponent={() => <View className="h-3" />}
        ListHeaderComponent={header}
        ListEmptyComponent={emptyState}
        ListFooterComponent={
          hasQuery && totalPages > 1 ? (
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          ) : null
        }
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: tabBarPad,
        }}
        keyboardShouldPersistTaps="handled"
      />
    </SafeAreaView>
  );
}

// ─── Sugestões (categorias populares) ───────────────────────────────
type CategoryGroup = (typeof CATEGORY_GROUPS)[number];
function SuggestionsGrid({
  suggestedCategories,
  onSelectCategory,
}: {
  suggestedCategories: readonly CategoryGroup[];
  onSelectCategory: (slug: string) => void;
}) {
  return (
    <View className="gap-6 pt-2">
      <View>
        <View className="mb-3 flex-row items-center gap-2">
          <Sparkles size={14} color="#fbbf24" />
          <Text className="text-sm font-bold uppercase tracking-wider text-amber-400">
            Buscas populares
          </Text>
        </View>
        <View className="flex-row flex-wrap" style={{ gap: 8 }}>
          {["Eletricista", "Diarista", "Encanador", "Pintor", "Marceneiro"].map(
            (term) => (
              <Pressable
                key={term}
                onPress={() => onSelectCategory(term.toLowerCase())}
                className="rounded-full border border-white/10 bg-card/60 px-4 py-2 active:bg-card"
              >
                <Text className="text-sm font-semibold">{term}</Text>
              </Pressable>
            )
          )}
        </View>
      </View>

      <View>
        <View className="mb-4 flex-row items-center justify-between">
          <Text className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Categorias
          </Text>
          <Pressable
            onPress={() => router.push("/categories")}
            hitSlop={8}
            className="flex-row items-center gap-1"
          >
            <Text className="text-xs font-bold text-primary">Ver todas</Text>
            <ArrowRight size={13} color="#22d3ee" />
          </Pressable>
        </View>
        <View className="flex-row flex-wrap" style={{ gap: 12 }}>
          {suggestedCategories.map((cat, i) => (
            <CategoryCircle
              key={cat.slug}
              icon={getCategoryIcon(cat.slug)}
              label={cat.name}
              tint={SUGGESTED_TINTS[i % SUGGESTED_TINTS.length]}
              onPress={() => onSelectCategory(cat.slug)}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

// ─── Pagination ────────────────────────────────────────────────────
function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  const items = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
    .reduce<(number | "...")[]>((acc, p, i, arr) => {
      if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("...");
      acc.push(p);
      return acc;
    }, []);

  return (
    <View className="flex-row items-center justify-center gap-2 pt-6">
      {page > 1 && (
        <Pressable
          onPress={() => onChange(page - 1)}
          className="h-10 justify-center rounded-full border border-white/10 bg-card/60 px-4 active:bg-card"
        >
          <Text className="text-sm font-semibold">Anterior</Text>
        </Pressable>
      )}

      {items.map((item, i) =>
        item === "..." ? (
          <Muted key={`dots-${i}`} className="px-1">
            ...
          </Muted>
        ) : (
          <Pressable
            key={item}
            onPress={() => onChange(item)}
            className={cn(
              "h-10 w-10 items-center justify-center rounded-full",
              item === page
                ? "bg-primary"
                : "border border-white/10 bg-card/60 active:bg-card"
            )}
          >
            <Text
              className={cn(
                "text-sm font-bold",
                item === page && "text-primary-foreground"
              )}
            >
              {item}
            </Text>
          </Pressable>
        )
      )}

      {page < totalPages && (
        <Pressable
          onPress={() => onChange(page + 1)}
          className="h-10 justify-center rounded-full border border-white/10 bg-card/60 px-4 active:bg-card"
        >
          <Text className="text-sm font-semibold">Próximo</Text>
        </Pressable>
      )}
    </View>
  );
}
