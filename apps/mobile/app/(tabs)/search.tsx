import {
  SERVICE_CATEGORIES,
  formatDiscount,
  getActiveOffersFor,
  type ProviderOffer,
} from "@eufaco/shared";
import {
  Button,
  Card,
  Text,
  fontSize,
  lineHeight,
  nativeFonts,
  useShadow,
  useTheme,
} from "@eufaco/design-system/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowUpDown,
  Clock3,
  MapPin,
  Navigation,
  Search,
  SlidersHorizontal,
  Star,
  X,
} from "lucide-react-native";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, TextInput, View } from "react-native";
import { AppBar } from "@/components/AppBar";
import {
  DEFAULT_FILTERS,
  FilterSheet,
  countActiveFilters,
  type SearchFilters,
} from "@/components/FilterSheet";
import { ProviderCard } from "@/components/ProviderCard";
import { SORT_LABELS, SortSheet, type SortOption } from "@/components/SortSheet";
import { useTabBarClearance } from "@/components/TabBar";
import { iconForCategory } from "@/lib/category-icons";
import { useFavorites } from "@/hooks/useFavorites";
import { useProviders } from "@/hooks/useProviders";
import { locationFilters, useLocation } from "@/lib/location";
import { supabase } from "@/lib/supabase";

/** Raio "ampliado" oferecido no estado vazio, como no protótipo. */
const WIDE_RADIUS_KM = 50;

/** Sem acento e em minúsculas, para casar "eletrico" com "Elétrico". */
function fold(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

export default function SearchScreen() {
  const { colors, radii, spacing, layout } = useTheme();
  const router = useRouter();
  const { favoriteIds, toggle } = useFavorites();
  const { location, radiusKm } = useLocation();
  const params = useLocalSearchParams<{ categoria?: string }>();
  const searchShadow = useShadow("card");
  const tabBarClearance = useTabBarClearance();

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
  const canWiden = hasGeo && filters.radiusKm < WIDE_RADIUS_KM;

  // Categorias reais cujo nome lembra o termo buscado. Sem invenção:
  // são as mesmas categorias que o catálogo já oferece.
  const suggestions = useMemo(() => {
    const query = fold(debounced);
    if (query.length < 3) return [];
    return SERVICE_CATEGORIES.filter((c) => {
      const name = fold(c.name);
      return name !== query && (name.includes(query.slice(0, 4)) || query.includes(name.slice(0, 4)));
    }).slice(0, 3);
  }, [debounced]);

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
      key={label}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label}
      onPress={onPress}
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
      {icon}
      <Text variant="chip" color={active ? "onPrimary" : "textSecondary"}>
        {label}
      </Text>
    </Pressable>
  );

  /** Cor do ícone de um chip, que segue o rótulo. */
  const chipTint = (active: boolean) => (active ? colors.onPrimary : colors.textSecondary);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <AppBar title="Buscar" showBack={false} />

      <View style={{ paddingHorizontal: layout.screenPadding, paddingTop: 18, gap: spacing[4] }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View
            style={[
              {
                flex: 1,
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
            <TextInput
              value={term}
              onChangeText={setTerm}
              placeholder="Eletricista, pintor, diarista..."
              placeholderTextColor={colors.textMuted}
              autoCorrect={false}
              returnKeyType="search"
              accessibilityLabel="Buscar profissionais"
              style={{
                flex: 1,
                color: colors.textPrimary,
                // No Pen o termo digitado é semibold e o placeholder, regular
                fontFamily: term ? nativeFonts.bodySemiBold : nativeFonts.bodyRegular,
                fontSize: fontSize.field,
              }}
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
              backgroundColor: colors.primary,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <SlidersHorizontal size={20} color={colors.onPrimary} />
          </Pressable>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing[2] }}>
          {chip(
            activeFilterCount > 0
              ? `${activeFilterCount} ${activeFilterCount === 1 ? "filtro" : "filtros"}`
              : "Filtros",
            <SlidersHorizontal size={14} color={chipTint(activeFilterCount > 0)} />,
            activeFilterCount > 0,
            () => setFilterOpen(true),
          )}
          {chip(
            "Mais próximos",
            <MapPin size={14} color={chipTint(sort === "distance")} />,
            sort === "distance",
            () => setSort(sort === "distance" ? "rating" : "distance"),
          )}
          {chip(
            "Melhor avaliados",
            <Star size={14} color={chipTint(sort === "rating")} />,
            sort === "rating",
            () => setSort("rating"),
          )}
          {chip(
            "Aberto agora",
            <Clock3 size={14} color={chipTint(filters.openNow)} />,
            filters.openNow,
            () => setFilters((f) => ({ ...f, openNow: !f.openNow })),
          )}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: layout.screenPadding,
          paddingTop: spacing[4],
          paddingBottom: tabBarClearance,
          gap: spacing[4],
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
          <>
            <View style={{ alignItems: "center", gap: 14, paddingVertical: 26, paddingHorizontal: 8 }}>
              <View
                style={{
                  width: 78,
                  height: 78,
                  borderRadius: radii.full,
                  backgroundColor: colors.surface2,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Search size={32} color={colors.textMuted} />
              </View>

              <View style={{ alignItems: "center", gap: 6 }}>
                <Text
                  variant="h2"
                  style={{ textAlign: "center", lineHeight: fontSize.xl * lineHeight.tight }}
                >
                  Nenhum profissional por aqui
                </Text>
                <Text
                  color="textSecondary"
                  style={{
                    textAlign: "center",
                    fontSize: fontSize.chip,
                    lineHeight: fontSize.chip * lineHeight.normal,
                  }}
                >
                  {debounced
                    ? `Não achamos ninguém para “${debounced}”. Tente ampliar a área ou trocar de cidade.`
                    : activeFilterCount > 0
                      ? "Os filtros estão restritos demais. Tente afrouxar algum."
                      : "Comece digitando o serviço que você precisa."}
                </Text>
              </View>

              {canWiden ? (
                <View style={{ alignSelf: "stretch" }}>
                  <Button
                    label={`Ampliar para ${WIDE_RADIUS_KM} km`}
                    icon={<Navigation size={18} color={colors.onPrimary} />}
                    iconPosition="right"
                    onPress={() => setFilters((f) => ({ ...f, radiusKm: WIDE_RADIUS_KM }))}
                  />
                </View>
              ) : null}

              <View style={{ alignSelf: "stretch" }}>
                <Button
                  label="Trocar de cidade"
                  variant="secondary"
                  onPress={() => router.push("/location")}
                />
              </View>
            </View>

            {suggestions.length > 0 ? (
              <View style={{ gap: 10 }}>
                <Text variant="title">Serviços parecidos disponíveis</Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                  {suggestions.map((item) => {
                    const Icon = iconForCategory(item.slug);
                    return chip(
                      item.name,
                      <Icon size={14} color={colors.textSecondary} />,
                      false,
                      () => {
                        setTerm("");
                        router.push(`/search?categoria=${item.slug}`);
                      },
                    );
                  })}
                </View>
              </View>
            ) : null}
          </>
        ) : (
          <>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text variant="title">
                {total} {total === 1 ? "profissional" : "profissionais"}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Ordenar por ${SORT_LABELS[sort]}`}
                onPress={() => setSortOpen(true)}
                hitSlop={8}
                style={({ pressed }) => ({
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <ArrowUpDown size={13} color={colors.primaryStrong} />
                <Text variant="label" color="primaryStrong">
                  {SORT_LABELS[sort]}
                </Text>
              </Pressable>
            </View>

            <View style={{ gap: 10 }}>
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
            </View>
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
