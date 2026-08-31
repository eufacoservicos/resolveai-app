import { formatDiscount, getActiveOffersFor, type ProviderOffer } from "@eufaco/shared";
import { Card, Text, useTheme } from "@eufaco/design-system/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowUpDown, Search, SlidersHorizontal, X } from "lucide-react-native";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  DEFAULT_FILTERS,
  FilterSheet,
  countActiveFilters,
  type SearchFilters,
} from "@/components/FilterSheet";
import { ProviderCard } from "@/components/ProviderCard";
import { SORT_LABELS, SortSheet, type SortOption } from "@/components/SortSheet";
import { useFavorites } from "@/hooks/useFavorites";
import { useProviders } from "@/hooks/useProviders";
import { locationFilters, useLocation } from "@/lib/location";
import { supabase } from "@/lib/supabase";

export default function SearchScreen() {
  const { colors, radii, spacing, layout } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { favoriteIds, toggle } = useFavorites();
  const { location, radiusKm } = useLocation();
  const params = useLocalSearchParams<{ categoria?: string }>();

  const [term, setTerm] = useState("");
  const [debounced, setDebounced] = useState("");
  const [filters, setFilters] = useState<SearchFilters>({ ...DEFAULT_FILTERS, radiusKm });
  const [sort, setSort] = useState<SortOption>("rating");
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [offerIds, setOfferIds] = useState<string[] | null>(null);
  const [offers, setOffers] = useState<Map<string, ProviderOffer>>(new Map());

  const hasGeo = location?.type === "geo";
  const activeFilterCount = countActiveFilters(filters);

  // Espera a digitação parar antes de consultar o banco
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(term.trim()), 350);
    return () => clearTimeout(timer);
  }, [term]);

  const queryFilters = useMemo(
    () => ({
      search: debounced || undefined,
      categorySlug: params.categoria,
      orderBy: sort,
      minRating: filters.minRating || undefined,
      providerType: filters.providerType === "all" ? undefined : filters.providerType,
      openNow: filters.openNow || undefined,
      onlyProviderIds: filters.onlyWithOffer ? (offerIds ?? []) : undefined,
      page: 1,
      pageSize: 20,
      ...locationFilters(location, filters.radiusKm),
    }),
    [debounced, params.categoria, sort, filters, offerIds, location],
  );

  const { providers, total, loading, error, refresh } = useProviders(queryFilters);

  // Ofertas vigentes dos resultados: alimentam o selo de desconto no card
  useEffect(() => {
    if (providers.length === 0) return;
    let active = true;
    void getActiveOffersFor(
      supabase,
      providers.map((p) => p.id),
    ).then((result) => {
      if (active) setOffers(result);
    });
    return () => {
      active = false;
    };
  }, [providers]);

  // Lista de quem tem oferta, carregada só quando o filtro é ligado
  useEffect(() => {
    if (!filters.onlyWithOffer || offerIds !== null) return;
    let active = true;
    void supabase
      .from("provider_offers")
      .select("provider_id")
      .eq("is_active", true)
      .then(({ data }) => {
        if (active) {
          setOfferIds(((data ?? []) as { provider_id: string }[]).map((o) => o.provider_id));
        }
      });
    return () => {
      active = false;
    };
  }, [filters.onlyWithOffer, offerIds]);

  const chip = (label: string, icon: ReactNode, active: boolean, onPress: () => void) => (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label}
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: spacing[1] + 2,
        paddingVertical: 9,
        paddingHorizontal: 14,
        borderRadius: radii.full,
        backgroundColor: active ? colors.primary : colors.surface,
        borderWidth: 1,
        borderColor: active ? colors.primary : colors.border,
      }}
    >
      {icon}
      <Text variant="label" color={active ? "onPrimary" : "textSecondary"}>
        {label}
      </Text>
    </Pressable>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top + spacing[2] }}>
      <View style={{ paddingHorizontal: layout.screenPadding, gap: spacing[3] }}>
        <Text variant="h3" style={{ textAlign: "center" }}>
          Buscar
        </Text>

        <View style={{ flexDirection: "row", alignItems: "center", gap: spacing[2] + 2 }}>
          <View
            style={{
              flex: 1,
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
            <TextInput
              value={term}
              onChangeText={setTerm}
              placeholder="Eletricista, pintor, diarista..."
              placeholderTextColor={colors.textMuted}
              autoCorrect={false}
              returnKeyType="search"
              accessibilityLabel="Buscar profissionais"
              style={{ flex: 1, color: colors.textPrimary, fontSize: 14.5 }}
            />
            {term.length > 0 ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Limpar busca"
                onPress={() => setTerm("")}
                hitSlop={8}
              >
                <X size={17} color={colors.textMuted} />
              </Pressable>
            ) : null}
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Filtros"
            onPress={() => setFilterOpen(true)}
            style={{
              width: 52,
              height: 52,
              borderRadius: radii.full,
              backgroundColor: activeFilterCount > 0 ? colors.primary : colors.surface,
              borderWidth: 1,
              borderColor: activeFilterCount > 0 ? colors.primary : colors.border,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <SlidersHorizontal
              size={20}
              color={activeFilterCount > 0 ? colors.onPrimary : colors.textPrimary}
            />
          </Pressable>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing[2] }}>
          {chip(
            activeFilterCount > 0 ? `${activeFilterCount} filtros` : "Filtros",
            <SlidersHorizontal
              size={14}
              color={activeFilterCount > 0 ? colors.onPrimary : colors.textSecondary}
            />,
            activeFilterCount > 0,
            () => setFilterOpen(true),
          )}
          {chip(
            SORT_LABELS[sort],
            <ArrowUpDown size={14} color={colors.textSecondary} />,
            false,
            () => setSortOpen(true),
          )}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: layout.screenPadding,
          paddingTop: spacing[4],
          paddingBottom: 110,
          gap: spacing[3],
        }}
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={{ paddingVertical: spacing[10], alignItems: "center" }}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : error ? (
          <Card style={{ alignItems: "center", paddingVertical: spacing[6], gap: spacing[2] }}>
            <Text variant="bodyStrong" style={{ textAlign: "center" }}>
              {error}
            </Text>
            <Pressable accessibilityRole="button" onPress={refresh} hitSlop={8}>
              <Text variant="label" color="primaryStrong">
                Tentar de novo
              </Text>
            </Pressable>
          </Card>
        ) : providers.length === 0 ? (
          <Card style={{ alignItems: "center", paddingVertical: spacing[8], gap: spacing[2] }}>
            <Text variant="title">Nenhum profissional encontrado</Text>
            <Text color="textSecondary" style={{ textAlign: "center" }}>
              {debounced
                ? `Não achamos ninguém para “${debounced}”. Tente outra palavra ou afrouxe os filtros.`
                : activeFilterCount > 0
                  ? "Os filtros estão restritos demais. Tente afrouxar algum."
                  : "Comece digitando o serviço que você precisa."}
            </Text>
          </Card>
        ) : (
          <>
            <Text variant="label" color="textSecondary">
              {total} {total === 1 ? "profissional" : "profissionais"}
            </Text>
            {providers.map((p) => {
              const offer = offers.get(p.id);
              return (
                <ProviderCard
                  key={p.id}
                  provider={p}
                  favorited={favoriteIds.has(p.id)}
                  discountLabel={offer ? formatDiscount(offer) : null}
                  onToggleFavorite={() => void toggle(p.id)}
                  onPress={() => router.push(`/provider/${p.id}`)}
                />
              );
            })}
          </>
        )}
      </ScrollView>

      <FilterSheet
        visible={filterOpen}
        initial={filters}
        resultCount={total}
        radiusEnabled={hasGeo}
        onClose={() => setFilterOpen(false)}
        onApply={(next) => {
          setFilters(next);
          setFilterOpen(false);
        }}
      />

      <SortSheet
        visible={sortOpen}
        value={sort}
        distanceEnabled={hasGeo}
        onClose={() => setSortOpen(false)}
        onSelect={setSort}
      />
    </View>
  );
}
