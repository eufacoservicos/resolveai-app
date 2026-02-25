"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  SlidersHorizontal,
  X,
  MapPin,
  Loader2,
  Navigation,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { CATEGORY_GROUPS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  LOCATION_COOKIE_NAME,
  LOCATION_COOKIE_MAX_AGE,
  serializeLocationCookie,
} from "@/lib/location-cookie";

interface SearchFiltersProps {
  categories: { id: string; name: string; slug: string }[];
  activeCategory?: string;
  activeOrder?: string;
  activeSearch?: string;
  activeRadius?: string;
  hasGeolocation?: boolean;
  resultCount: number;
  autoLocationLabel?: string;
  cities?: string[];
  children: React.ReactNode;
}

export function SearchFilters({
  categories,
  activeCategory,
  activeOrder,
  activeSearch,
  activeRadius,
  hasGeolocation,
  resultCount,
  autoLocationLabel,
  cities,
  children,
}: SearchFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState(activeSearch ?? "");
  const [geoLoading, setGeoLoading] = useState(false);
  const [showCitySelector, setShowCitySelector] = useState(false);
  const [citySearch, setCitySearch] = useState("");

  function navigate(url: string) {
    startTransition(() => {
      router.push(url);
    });
  }

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.delete("pagina");
    navigate(`/search?${params.toString()}`);
  }

  function removeParam(key: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    params.delete("pagina");
    navigate(`/search?${params.toString()}`);
  }

  function handleSearch() {
    updateParam("q", searchTerm.trim() || "all");
  }

  function handleUseMyLocation() {
    if (!navigator.geolocation) {
      toast.error("Seu navegador não suporta geolocalização.");
      return;
    }

    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("lat", position.coords.latitude.toFixed(6));
        params.set("lng", position.coords.longitude.toFixed(6));
        params.set("raio", activeRadius ?? "25");
        params.delete("cidade");
        params.delete("pagina");
        params.set("ordenar", "distancia");
        navigate(`/search?${params.toString()}`);
        setGeoLoading(false);
      },
      () => {
        toast.error(
          "Não foi possível obter sua localização. Verifique as permissões do navegador."
        );
        setGeoLoading(false);
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  }

  function handleClearLocation() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("lat");
    params.delete("lng");
    params.delete("raio");
    if (params.get("ordenar") === "distancia") {
      params.delete("ordenar");
    }
    params.delete("pagina");
    navigate(`/search?${params.toString()}`);
  }

  function handleClearAutoLocation() {
    document.cookie = `${LOCATION_COOKIE_NAME}=; path=/; max-age=0`;
    router.refresh();
  }

  function handleCitySelect(city: string) {
    const value = serializeLocationCookie({ type: "city", city });
    document.cookie = `${LOCATION_COOKIE_NAME}=${value}; path=/; max-age=${LOCATION_COOKIE_MAX_AGE}; samesite=lax`;
    setShowCitySelector(false);
    setCitySearch("");
    router.refresh();
  }

  function handleUseGeoForCookie() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const value = serializeLocationCookie({
          type: "geo",
          lat: parseFloat(position.coords.latitude.toFixed(6)),
          lng: parseFloat(position.coords.longitude.toFixed(6)),
          label: "Minha localização",
        });
        document.cookie = `${LOCATION_COOKIE_NAME}=${value}; path=/; max-age=${LOCATION_COOKIE_MAX_AGE}; samesite=lax`;
        setShowCitySelector(false);
        router.refresh();
      },
      () => {
        toast.error("Não foi possível obter sua localização.");
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  }

  const activeCategoryName = categories.find(
    (c) => c.slug === activeCategory
  )?.name;

  // Build grouped categories for the dropdown
  const groupedCategories = CATEGORY_GROUPS.map((group) => ({
    ...group,
    items: categories.filter((c) =>
      (group.subcategories as readonly string[]).includes(c.slug)
    ),
  })).filter((g) => g.items.length > 0);

  const allGroupedSlugs: string[] = CATEGORY_GROUPS.flatMap((g) => [
    ...g.subcategories,
  ]);
  const ungrouped = categories.filter(
    (c) => !allGroupedSlugs.includes(c.slug)
  );

  const filteredCities = (cities ?? []).filter((c) =>
    c.toLowerCase().includes(citySearch.toLowerCase())
  );

  return (
    <div className="space-y-3">
      {/* Search bar + filter button */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar profissionais..."
            className="h-10 w-full rounded-xl border border-border bg-card pl-10 pr-4 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "h-10 w-10 shrink-0 rounded-xl border transition-colors",
            showFilters || activeCategory || hasGeolocation || autoLocationLabel
              ? "border-primary bg-primary/5 text-primary"
              : "border-border"
          )}
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {/* Sort + active filter chips */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none -mx-1 px-1 pb-0.5">
        {/* Sort chip */}
        <Select
          value={activeOrder ?? "recentes"}
          onValueChange={(v) => updateParam("ordenar", v)}
        >
          <SelectTrigger className="h-8 w-auto gap-1 rounded-full border-border bg-card px-3 text-xs font-medium shrink-0">
            <SelectValue placeholder="Ordenar" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="recentes">Mais recentes</SelectItem>
            <SelectItem value="avaliacao">Melhor avaliação</SelectItem>
            {hasGeolocation && (
              <SelectItem value="distancia">Mais próximo</SelectItem>
            )}
          </SelectContent>
        </Select>

        {/* Active category chip */}
        {activeCategoryName && (
          <button
            onClick={() => removeParam("categoria")}
            className="flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 h-8 text-xs font-medium text-primary shrink-0 hover:bg-primary/15 transition-colors"
          >
            {activeCategoryName}
            <X className="h-3 w-3" />
          </button>
        )}

        {/* Active geolocation chip (URL-based) */}
        {hasGeolocation && (
          <button
            onClick={handleClearLocation}
            className="flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 h-8 text-xs font-medium text-primary shrink-0 hover:bg-primary/15 transition-colors"
          >
            <MapPin className="h-3 w-3" />
            {activeRadius ?? 25} km
            <X className="h-3 w-3" />
          </button>
        )}

        {/* Auto-location chip (cookie-based, only when no URL geolocation) */}
        {!hasGeolocation && autoLocationLabel && (
          <button
            onClick={() => setShowCitySelector(true)}
            className="flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 h-8 text-xs font-medium text-primary shrink-0 hover:bg-primary/15 transition-colors"
          >
            <MapPin className="h-3 w-3" />
            {autoLocationLabel}
          </button>
        )}
        {!hasGeolocation && autoLocationLabel && (
          <button
            onClick={handleClearAutoLocation}
            className="flex items-center gap-1 rounded-full border border-border px-2.5 h-7 text-xs text-muted-foreground hover:bg-muted transition-colors shrink-0"
          >
            <X className="h-3 w-3" />
          </button>
        )}

        {/* Active search chip */}
        {activeSearch && (
          <button
            onClick={() => {
              setSearchTerm("");
              removeParam("q");
            }}
            className="flex items-center gap-1.5 rounded-full bg-muted border border-border px-3 h-8 text-xs font-medium text-foreground shrink-0 hover:bg-muted/80 transition-colors"
          >
            &ldquo;{activeSearch}&rdquo;
            <X className="h-3 w-3 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Result count + results */}
      {isPending ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Buscando profissionais...</span>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {resultCount} resultado{resultCount !== 1 ? "s" : ""}
          </p>
          {children}
        </>
      )}

      {/* Filter bottom sheet */}
      <div
        className={cn(
          "fixed inset-0 z-50 transition-all duration-300",
          showFilters ? "visible" : "invisible pointer-events-none"
        )}
      >
        <div
          className={cn(
            "absolute inset-0 bg-black/40 transition-opacity duration-300",
            showFilters ? "opacity-100" : "opacity-0"
          )}
          onClick={() => setShowFilters(false)}
        />
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 rounded-t-2xl bg-card p-5 shadow-xl max-h-[80vh] overflow-y-auto transition-transform duration-300",
            showFilters ? "translate-y-0" : "translate-y-full"
          )}
        >
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Filtros</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-5">
            {/* Category */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Categoria
              </label>
              <Select
                value={activeCategory ?? "all"}
                onValueChange={(v) => {
                  updateParam("categoria", v);
                  setShowFilters(false);
                }}
              >
                <SelectTrigger className="h-11 rounded-xl border-border">
                  <SelectValue placeholder="Todas categorias" />
                </SelectTrigger>
                <SelectContent className="rounded-xl max-h-60">
                  <SelectItem value="all">Todas categorias</SelectItem>
                  {groupedCategories.map((group) => (
                    <SelectGroup key={group.slug}>
                      <SelectLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1.5">
                        {group.name}
                      </SelectLabel>
                      {group.items.map((cat) => (
                        <SelectItem
                          key={cat.id}
                          value={cat.slug}
                          className="pl-6"
                        >
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                  {ungrouped.length > 0 && (
                    <SelectGroup>
                      <SelectLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1.5">
                        Outros
                      </SelectLabel>
                      {ungrouped.map((cat) => (
                        <SelectItem
                          key={cat.id}
                          value={cat.slug}
                          className="pl-6"
                        >
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Location */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Localização
              </label>
              {hasGeolocation ? (
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 p-3">
                    <MapPin className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-sm font-medium text-primary">
                      Usando sua localização
                    </span>
                    <button
                      onClick={() => {
                        handleClearLocation();
                        setShowFilters(false);
                      }}
                      className="ml-auto text-xs text-muted-foreground hover:text-foreground"
                    >
                      Remover
                    </button>
                  </div>
                  <Select
                    value={activeRadius ?? "25"}
                    onValueChange={(v) => {
                      updateParam("raio", v);
                      setShowFilters(false);
                    }}
                  >
                    <SelectTrigger className="h-11 rounded-xl border-border">
                      <SelectValue placeholder="Raio de busca" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="5">Até 5 km</SelectItem>
                      <SelectItem value="10">Até 10 km</SelectItem>
                      <SelectItem value="25">Até 25 km</SelectItem>
                      <SelectItem value="50">Até 50 km</SelectItem>
                      <SelectItem value="100">Até 100 km</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ) : autoLocationLabel ? (
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 p-3">
                    <MapPin className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-sm font-medium text-primary">
                      {autoLocationLabel}
                    </span>
                    <button
                      onClick={() => {
                        setShowCitySelector(true);
                        setShowFilters(false);
                      }}
                      className="ml-auto text-xs text-muted-foreground hover:text-foreground"
                    >
                      Alterar
                    </button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="w-full h-11 rounded-xl border-border gap-2"
                  onClick={() => {
                    handleUseMyLocation();
                    setShowFilters(false);
                  }}
                  disabled={geoLoading}
                >
                  {geoLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <MapPin className="h-4 w-4" />
                  )}
                  Usar minha localização
                </Button>
              )}
            </div>

            <Button
              className="w-full h-11 rounded-xl gradient-bg font-semibold"
              onClick={() => setShowFilters(false)}
            >
              Fechar
            </Button>
          </div>
        </div>
      </div>

      {/* City selector dialog */}
      <Dialog open={showCitySelector} onOpenChange={setShowCitySelector}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Alterar localização</DialogTitle>
            <DialogDescription>
              Selecione uma cidade ou use sua localização
            </DialogDescription>
          </DialogHeader>

          <button
            onClick={handleUseGeoForCookie}
            className="flex w-full items-center gap-2.5 rounded-xl border border-border px-3 py-2.5 text-sm hover:bg-muted transition-colors"
          >
            <Navigation className="h-4 w-4 text-primary shrink-0" />
            Usar minha localização
          </button>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar cidade..."
              className="h-10 w-full rounded-xl border border-border bg-card pl-10 pr-4 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20"
              value={citySearch}
              onChange={(e) => setCitySearch(e.target.value)}
            />
          </div>

          <div className="max-h-60 overflow-y-auto space-y-1">
            {filteredCities.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Nenhuma cidade encontrada
              </p>
            ) : (
              filteredCities.map((city) => (
                <button
                  key={city}
                  onClick={() => handleCitySelect(city)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-left hover:bg-muted transition-colors"
                >
                  <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                  {city}
                </button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
