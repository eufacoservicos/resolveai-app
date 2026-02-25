import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import {
  getActiveProviders,
  getCategories,
  getCities,
  getCurrentUser,
  getUserFavorites,
} from "@/lib/supabase/queries";
import { getLocationFromCookie } from "@/lib/location";
import { DEFAULT_RADIUS_KM } from "@/lib/location-cookie";

export const metadata: Metadata = {
  title: "Buscar Serviços - eufaço!",
  description:
    "Busque e encontre prestadores de serviços locais por categoria, cidade e avaliação.",
};
import { ProviderCard } from "@/components/providers/provider-card";
import { SearchFilters } from "@/components/providers/search-filters";
import { ProviderGrid } from "@/components/providers/provider-grid";
import { LocationGate } from "@/components/location/location-gate";
import { Search, MapPinOff } from "lucide-react";

const PAGE_SIZE = 12;

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    categoria?: string;
    cidade?: string;
    ordenar?: string;
    pagina?: string;
    lat?: string;
    lng?: string;
    raio?: string;
  }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.pagina ?? "1", 10) || 1);
  const supabase = await createClient();

  const location = await getLocationFromCookie();

  // URL params take priority over cookie
  const hasUrlLocation = !!(params.lat && params.lng) || !!params.cidade;

  let latitude = params.lat ? parseFloat(params.lat) : undefined;
  let longitude = params.lng ? parseFloat(params.lng) : undefined;
  let radiusKm = params.raio ? parseFloat(params.raio) : undefined;
  let city = params.cidade;

  // Fallback to cookie when no URL location params
  if (!hasUrlLocation && location) {
    if (location.type === "geo") {
      latitude = location.lat;
      longitude = location.lng;
      radiusKm = DEFAULT_RADIUS_KM;
    } else if (location.type === "city") {
      city = location.city;
    }
  }

  const isLocationFiltered = !!(latitude && longitude) || !!city;

  const orderByMap: Record<string, "rating" | "recent" | "distance"> = {
    avaliacao: "rating",
    distancia: "distance",
  };

  // Auto-location label for the search filters chip
  const autoLocationLabel =
    !hasUrlLocation && location
      ? location.type === "geo"
        ? location.label
        : location.city
      : undefined;

  const [{ providers, total }, categories, cities, currentUser] =
    await Promise.all([
      getActiveProviders(supabase, {
        search: params.q,
        categorySlug: params.categoria,
        city,
        latitude,
        longitude,
        radiusKm,
        orderBy: orderByMap[params.ordenar ?? ""] ?? "recent",
        page,
        pageSize: PAGE_SIZE,
      }),
      getCategories(supabase),
      getCities(supabase),
      getCurrentUser(supabase),
    ]);

  const favoriteIds = currentUser
    ? await getUserFavorites(supabase, currentUser.id)
    : [];

  const totalPages = Math.ceil(total / PAGE_SIZE);

  // Build pagination URL helper
  function pageUrl(p: number) {
    const sp = new URLSearchParams();
    if (params.q) sp.set("q", params.q);
    if (params.categoria) sp.set("categoria", params.categoria);
    if (params.cidade) sp.set("cidade", params.cidade);
    if (params.ordenar) sp.set("ordenar", params.ordenar);
    if (params.lat) sp.set("lat", params.lat);
    if (params.lng) sp.set("lng", params.lng);
    if (params.raio) sp.set("raio", params.raio);
    if (p > 1) sp.set("pagina", String(p));
    const qs = sp.toString();
    return `/search${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="space-y-4">
      <LocationGate cities={cities} />

      <h1 className="text-xl font-bold tracking-tight">Buscar</h1>

      <SearchFilters
        categories={categories}
        activeCategory={params.categoria}
        activeOrder={params.ordenar}
        activeSearch={params.q}
        activeRadius={params.raio}
        hasGeolocation={!!(params.lat && params.lng)}
        resultCount={total}
        autoLocationLabel={autoLocationLabel}
        cities={cities}
      >
        {providers.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-muted">
              {isLocationFiltered ? (
                <MapPinOff className="h-7 w-7 text-muted-foreground" />
              ) : (
                <Search className="h-7 w-7 text-muted-foreground" />
              )}
            </div>
            <p className="font-medium text-foreground">
              {isLocationFiltered
                ? "Não há profissionais cadastrados na sua região"
                : "Nenhum resultado encontrado"}
            </p>
            <p className="mt-1 max-w-xs text-sm text-muted-foreground">
              {isLocationFiltered
                ? "Tente alterar sua localização ou buscar em outra cidade"
                : "Tente ajustar os filtros"}
            </p>
          </div>
        ) : (
          <>
            <ProviderGrid>
              {providers.map((provider) => (
                <ProviderCard
                  key={provider.id}
                  provider={provider}
                  userId={currentUser?.id ?? null}
                  isFavorited={favoriteIds.includes(provider.id)}
                />
              ))}
            </ProviderGrid>

            {/* Pagination */}
            {totalPages > 1 && (
              <nav className="flex items-center justify-center gap-2 pt-4">
                {page > 1 && (
                  <a
                    href={pageUrl(page - 1)}
                    className="inline-flex h-9 items-center rounded-lg border border-border px-3 text-sm font-medium hover:bg-muted"
                  >
                    Anterior
                  </a>
                )}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (p) =>
                      p === 1 ||
                      p === totalPages ||
                      Math.abs(p - page) <= 1
                  )
                  .reduce<(number | "...")[]>((acc, p, i, arr) => {
                    if (i > 0 && p - (arr[i - 1] as number) > 1)
                      acc.push("...");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((item, i) =>
                    item === "..." ? (
                      <span
                        key={`dots-${i}`}
                        className="px-1 text-muted-foreground"
                      >
                        ...
                      </span>
                    ) : (
                      <a
                        key={item}
                        href={pageUrl(item as number)}
                        className={`inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium ${
                          item === page
                            ? "bg-primary text-white"
                            : "border border-border hover:bg-muted"
                        }`}
                      >
                        {item}
                      </a>
                    )
                  )}
                {page < totalPages && (
                  <a
                    href={pageUrl(page + 1)}
                    className="inline-flex h-9 items-center rounded-lg border border-border px-3 text-sm font-medium hover:bg-muted"
                  >
                    Próximo
                  </a>
                )}
              </nav>
            )}
          </>
        )}
      </SearchFilters>
    </div>
  );
}
