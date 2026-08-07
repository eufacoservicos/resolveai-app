import { useState } from "react";
import { Pressable, ScrollView, TextInput, View } from "react-native";
import { MapPin, Search, SlidersHorizontal, X } from "lucide-react-native";
import { toast } from "sonner-native";
import { CATEGORY_GROUPS } from "@resolveai/shared/constants";
import { useLocation } from "@/lib/location-provider";
import { Button } from "@/components/ui/button";
import { Select, type SelectGroup } from "@/components/ui/select";
import { Sheet } from "@/components/ui/sheet";
import { Text, Muted } from "@/components/ui/text";
import { CitySelectorDialog } from "@/components/location/city-selector-dialog";
import { cn } from "@resolveai/shared/cn";

export type SearchOrder = "recentes" | "avaliacao" | "distancia";
export type GeoFilter = { lat: number; lng: number; radiusKm: number };

// Porta do SearchFilters do PWA. No web tudo vive na querystring; aqui o estado
// e controlado pela tela de busca (props + callbacks).
type Props = {
  categories: { id: string; name: string; slug: string }[];
  cities: string[];
  search: string;
  onSearchChange: (value: string) => void;
  categorySlug?: string;
  onCategoryChange: (slug: string | undefined) => void;
  order: SearchOrder;
  onOrderChange: (order: SearchOrder) => void;
  geo: GeoFilter | null;
  onGeoChange: (geo: GeoFilter | null) => void;
  resultCount: number;
};

const RADIUS_OPTIONS = [
  { value: "5", label: "Até 5 km" },
  { value: "10", label: "Até 10 km" },
  { value: "25", label: "Até 25 km" },
  { value: "50", label: "Até 50 km" },
  { value: "100", label: "Até 100 km" },
];

const CHIP = "h-8 flex-row items-center gap-1.5 rounded-full px-3";
const CHIP_ACTIVE = "border border-primary/20 bg-primary/10";

export function SearchFilters({
  categories,
  cities,
  search,
  onSearchChange,
  categorySlug,
  onCategoryChange,
  order,
  onOrderChange,
  geo,
  onGeoChange,
  resultCount,
}: Props) {
  const { location, setLocation, detectLocation, isDetecting } = useLocation();
  const [showFilters, setShowFilters] = useState(false);
  const [showCitySelector, setShowCitySelector] = useState(false);
  const [searchTerm, setSearchTerm] = useState(search);

  const activeCategoryName = categories.find((c) => c.slug === categorySlug)?.name;

  // Rotulo da localizacao herdada do LocationProvider (equivalente ao cookie)
  const autoLocationLabel = geo
    ? undefined
    : location?.type === "geo"
      ? location.label
      : location?.city;

  const categoryGroups: SelectGroup[] = CATEGORY_GROUPS.map((group) => ({
    label: group.name,
    options: categories
      .filter((c) => (group.subcategories as readonly string[]).includes(c.slug))
      .map((c) => ({ value: c.slug, label: c.name })),
  })).filter((g) => g.options.length > 0);

  const allGroupedSlugs: string[] = CATEGORY_GROUPS.flatMap((g) => [
    ...g.subcategories,
  ]);
  const ungrouped = categories.filter((c) => !allGroupedSlugs.includes(c.slug));
  if (ungrouped.length > 0) {
    categoryGroups.push({
      label: "Outros",
      options: ungrouped.map((c) => ({ value: c.slug, label: c.name })),
    });
  }

  async function handleUseMyLocation() {
    const result = await detectLocation();
    if (!result || result.type !== "geo") {
      toast.error(
        "Não foi possível obter sua localização. Verifique as permissões."
      );
      return;
    }
    onGeoChange({
      lat: result.lat,
      lng: result.lng,
      radiusKm: geo?.radiusKm ?? 25,
    });
    onOrderChange("distancia");
  }

  function handleClearLocation() {
    onGeoChange(null);
    if (order === "distancia") onOrderChange("recentes");
  }

  return (
    <View className="gap-3">
      {/* Busca + botao de filtros */}
      <View className="flex-row gap-2">
        <View className="h-10 flex-1 flex-row items-center rounded-xl border border-border bg-card px-3">
          <Search size={16} color="#8891a4" />
          <TextInput
            placeholder="Buscar profissionais..."
            placeholderTextColor="#8891a4"
            value={searchTerm}
            onChangeText={setSearchTerm}
            onSubmitEditing={() => onSearchChange(searchTerm.trim())}
            returnKeyType="search"
            className="ml-2 min-w-0 flex-1 text-sm text-foreground"
          />
        </View>
        <Pressable
          onPress={() => setShowFilters(true)}
          accessibilityRole="button"
          accessibilityLabel="Filtros"
          className={cn(
            "h-10 w-10 items-center justify-center rounded-xl border",
            categorySlug || geo || autoLocationLabel
              ? "border-primary bg-primary/5"
              : "border-border bg-card"
          )}
        >
          <SlidersHorizontal
            size={16}
            color={categorySlug || geo || autoLocationLabel ? "#22d3ee" : "#f5f7fb"}
          />
        </Pressable>
      </View>

      {/* Ordenacao + chips ativos */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingBottom: 2 }}
      >
        <Select
          value={order}
          onValueChange={(v) => onOrderChange(v as SearchOrder)}
          title="Ordenar"
          className="h-8 rounded-full"
          textClassName="text-xs font-medium"
          options={[
            { value: "recentes", label: "Mais recentes" },
            { value: "avaliacao", label: "Melhor avaliação" },
            ...(geo ? [{ value: "distancia", label: "Mais próximo" }] : []),
          ]}
        />

        {activeCategoryName && (
          <Pressable
            onPress={() => onCategoryChange(undefined)}
            className={cn(CHIP, CHIP_ACTIVE)}
          >
            <Text className="text-xs font-medium text-primary">
              {activeCategoryName}
            </Text>
            <X size={12} color="#22d3ee" />
          </Pressable>
        )}

        {geo && (
          <Pressable onPress={handleClearLocation} className={cn(CHIP, CHIP_ACTIVE)}>
            <MapPin size={12} color="#22d3ee" />
            <Text className="text-xs font-medium text-primary">
              {geo.radiusKm} km
            </Text>
            <X size={12} color="#22d3ee" />
          </Pressable>
        )}

        {!geo && autoLocationLabel && (
          <Pressable
            onPress={() => setShowCitySelector(true)}
            className={cn(CHIP, CHIP_ACTIVE)}
          >
            <MapPin size={12} color="#22d3ee" />
            <Text className="text-xs font-medium text-primary">
              {autoLocationLabel}
            </Text>
          </Pressable>
        )}

        {search && (
          <Pressable
            onPress={() => {
              setSearchTerm("");
              onSearchChange("");
            }}
            className={cn(CHIP, "border border-border bg-muted")}
          >
            <Text className="text-xs font-medium">&ldquo;{search}&rdquo;</Text>
            <X size={12} color="#8891a4" />
          </Pressable>
        )}
      </ScrollView>

      <Muted>
        {resultCount} resultado{resultCount !== 1 ? "s" : ""}
      </Muted>

      {/* Painel de filtros */}
      <Sheet open={showFilters} onOpenChange={setShowFilters} title="Filtros">
        <View className="gap-5">
          <View>
            <Text className="mb-2 text-sm font-medium">Categoria</Text>
            <Select
              value={categorySlug ?? "all"}
              onValueChange={(v) => {
                onCategoryChange(v === "all" ? undefined : v);
                setShowFilters(false);
              }}
              title="Categoria"
              className="h-11"
              options={[{ value: "all", label: "Todas categorias" }]}
              groups={categoryGroups}
            />
          </View>

          <View>
            <Text className="mb-2 text-sm font-medium">Localização</Text>
            {geo ? (
              <View className="gap-2.5">
                <View className="flex-row items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 p-3">
                  <MapPin size={16} color="#22d3ee" />
                  <Text className="text-sm font-medium text-primary">
                    Usando sua localização
                  </Text>
                  <Pressable
                    onPress={() => {
                      handleClearLocation();
                      setShowFilters(false);
                    }}
                    className="ml-auto"
                  >
                    <Muted className="text-xs">Remover</Muted>
                  </Pressable>
                </View>
                <Select
                  value={String(geo.radiusKm)}
                  onValueChange={(v) => {
                    onGeoChange({ ...geo, radiusKm: Number(v) });
                    setShowFilters(false);
                  }}
                  title="Raio de busca"
                  className="h-11"
                  options={RADIUS_OPTIONS}
                />
              </View>
            ) : autoLocationLabel ? (
              <View className="flex-row items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 p-3">
                <MapPin size={16} color="#22d3ee" />
                <Text className="text-sm font-medium text-primary">
                  {autoLocationLabel}
                </Text>
                <Pressable
                  onPress={() => {
                    setShowCitySelector(true);
                    setShowFilters(false);
                  }}
                  className="ml-auto"
                >
                  <Muted className="text-xs">Alterar</Muted>
                </Pressable>
              </View>
            ) : (
              <Button
                variant="outline"
                className="h-11 w-full rounded-xl"
                loading={isDetecting}
                onPress={() => {
                  void handleUseMyLocation();
                  setShowFilters(false);
                }}
              >
                <MapPin size={16} color="#f5f7fb" />
                <Text className="text-sm font-semibold">
                  Usar minha localização
                </Text>
              </Button>
            )}
          </View>

          <Button
            className="h-11 w-full rounded-xl"
            onPress={() => setShowFilters(false)}
          >
            Fechar
          </Button>
        </View>
      </Sheet>

      <CitySelectorDialog
        open={showCitySelector}
        onOpenChange={setShowCitySelector}
        cities={cities}
        title="Alterar localização"
        description="Selecione uma cidade ou use sua localização"
        onSelectCity={(city) => {
          void setLocation({ type: "city", city });
          setShowCitySelector(false);
        }}
        onUseGeolocation={() => {
          detectLocation().then((result) => {
            if (result) setShowCitySelector(false);
            else toast.error("Não foi possível obter sua localização.");
          });
        }}
      />
    </View>
  );
}
