"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X, MapPin, Loader2 } from "lucide-react";
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
import { CATEGORY_GROUPS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface SearchFiltersProps {
  categories: { id: string; name: string; slug: string }[];
  activeCategory?: string;
  activeOrder?: string;
  activeSearch?: string;
  activeRadius?: string;
  hasGeolocation?: boolean;
}

export function SearchFilters({
  categories,
  activeCategory,
  activeOrder,
  activeSearch,
  activeRadius,
  hasGeolocation,
}: SearchFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState(activeSearch ?? "");
  const [geoLoading, setGeoLoading] = useState(false);

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.delete("pagina");
    router.push(`/search?${params.toString()}`);
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
        router.push(`/search?${params.toString()}`);
        setGeoLoading(false);
      },
      () => {
        toast.error("Não foi possível obter sua localização. Verifique as permissões do navegador.");
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
    router.push(`/search?${params.toString()}`);
  }

  const hasActiveFilters = activeCategory || hasGeolocation;

  // Build grouped categories for the dropdown
  const groupedCategories = CATEGORY_GROUPS.map((group) => ({
    ...group,
    items: categories.filter((c) => (group.subcategories as readonly string[]).includes(c.slug)),
  })).filter((g) => g.items.length > 0);

  // Categories that don't belong to any group
  const allGroupedSlugs: string[] = CATEGORY_GROUPS.flatMap((g) => [...g.subcategories]);
  const ungrouped = categories.filter((c) => !allGroupedSlugs.includes(c.slug));

  return (
    <div className="space-y-3">
      {/* Search bar + filter button */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar profissionais..."
            className="h-10 w-full rounded-lg border border-border bg-white pl-10 pr-4 text-sm outline-none transition-colors focus:border-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                updateParam("q", searchTerm.trim() || "all");
              }
            }}
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          className={`h-10 w-10 shrink-0 rounded-lg border ${
            hasActiveFilters
              ? "border-primary bg-primary/5 text-primary"
              : "border-border"
          }`}
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {/* Sort dropdown */}
      <div className="flex items-center justify-between">
        <Select
          value={activeOrder ?? "recentes"}
          onValueChange={(v) => updateParam("ordenar", v)}
        >
          <SelectTrigger className="h-8 w-auto gap-1.5 rounded-lg border-border bg-white px-3 text-xs font-medium">
            <SelectValue placeholder="Ordenar" />
          </SelectTrigger>
          <SelectContent className="rounded-lg">
            <SelectItem value="recentes">Mais recentes</SelectItem>
            <SelectItem value="avaliacao">Melhor avaliação</SelectItem>
            {hasGeolocation && (
              <SelectItem value="distancia">Mais próximo</SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

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
          <div className={cn(
            "absolute bottom-0 left-0 right-0 rounded-t-2xl bg-card p-5 shadow-xl max-h-[80vh] overflow-y-auto transition-transform duration-300",
            showFilters ? "translate-y-0" : "translate-y-full"
          )}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Filtros</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Categoria
                </label>
                <Select
                  value={activeCategory ?? "all"}
                  onValueChange={(v) => updateParam("categoria", v)}
                >
                  <SelectTrigger className="h-11 rounded-lg border-border">
                    <SelectValue placeholder="Todas categorias" />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg max-h-60">
                    <SelectItem value="all">Todas categorias</SelectItem>
                    {groupedCategories.map((group) => (
                      <SelectGroup key={group.slug}>
                        <SelectLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1.5">
                          {group.name}
                        </SelectLabel>
                        {group.items.map((cat) => (
                          <SelectItem key={cat.id} value={cat.slug} className="pl-6">
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
                          <SelectItem key={cat.id} value={cat.slug} className="pl-6">
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
                <label className="mb-1.5 block text-sm font-medium">
                  Localização
                </label>
                {hasGeolocation ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 p-3">
                      <MapPin className="h-4 w-4 text-primary shrink-0" />
                      <span className="text-sm font-medium text-primary">Usando sua localização</span>
                      <button
                        onClick={handleClearLocation}
                        className="ml-auto text-xs text-muted-foreground hover:text-foreground"
                      >
                        Remover
                      </button>
                    </div>
                    <Select
                      value={activeRadius ?? "25"}
                      onValueChange={(v) => updateParam("raio", v)}
                    >
                      <SelectTrigger className="h-11 rounded-lg border-border">
                        <SelectValue placeholder="Raio de busca" />
                      </SelectTrigger>
                      <SelectContent className="rounded-lg">
                        <SelectItem value="5">Até 5 km</SelectItem>
                        <SelectItem value="10">Até 10 km</SelectItem>
                        <SelectItem value="25">Até 25 km</SelectItem>
                        <SelectItem value="50">Até 50 km</SelectItem>
                        <SelectItem value="100">Até 100 km</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full h-11 rounded-lg border-border gap-2"
                    onClick={handleUseMyLocation}
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
                className="w-full h-11 rounded-lg gradient-bg font-semibold"
                onClick={() => setShowFilters(false)}
              >
                Aplicar filtros
              </Button>
            </div>
          </div>
        </div>
    </div>
  );
}
