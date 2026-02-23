import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getActiveProviders, getCurrentUser, getUserFavorites } from "@/lib/supabase/queries";

export const metadata: Metadata = {
  title: "eufaço! - Encontre Serviços Locais",
  description:
    "Encontre prestadores de serviços locais na sua cidade. Pintores, eletricistas, encanadores e mais profissionais avaliados.",
  openGraph: {
    title: "eufaço! - Encontre Serviços Locais",
    description:
      "Encontre prestadores de serviços locais na sua cidade. Pintores, eletricistas, encanadores e mais.",
    type: "website",
  },
};
import { ProviderCard } from "@/components/providers/provider-card";
import { CategoryFilter } from "@/components/providers/category-filter";
import { CategoryPendingProvider } from "@/components/providers/category-pending";
import { ProviderListLoading } from "@/components/providers/provider-list-loading";
import { HomeHero } from "@/components/layout/home-hero";
import { AdBanner } from "@/components/layout/ad-banner";
import { ProviderGrid } from "@/components/providers/provider-grid";
import { ArrowRight, Star, Wrench } from "lucide-react";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; ordenar?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const [providersResult, currentUser] = await Promise.all([
    getActiveProviders(supabase, {
      categorySlug: params.categoria,
      orderBy: params.ordenar === "avaliacao" ? "rating" : "recent",
    }),
    getCurrentUser(supabase),
  ]);
  const providers = providersResult.providers;

  const favoriteIds = currentUser
    ? await getUserFavorites(supabase, currentUser.id)
    : [];

  // Featured providers (top rated)
  const featured = providers.filter(
    (p) => p.average_rating !== null && p.average_rating >= 4.5
  );

  return (
    <div className="space-y-6">
      <HomeHero />

      <AdBanner />

      <CategoryPendingProvider>
        <CategoryFilter
          activeSlug={params.categoria}
          limit={6}
        />

        <ProviderListLoading>
          {/* Featured professionals section */}
          {featured.length > 0 && !params.categoria && (
            <div className="rounded-xl bg-linear-to-r from-amber-50/80 to-orange-50/50 p-4 -mx-4 sm:mx-0 sm:p-5">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                  <h2 className="text-lg font-semibold">Profissionais em Destaque</h2>
                </div>
                <Link
                  href="/search?ordenar=avaliacao"
                  className="flex items-center gap-1 text-sm font-medium text-primary"
                >
                  Ver todos
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:overflow-visible">
                {featured.slice(0, 6).map((provider) => (
                  <div key={provider.id} className="min-w-70 sm:min-w-0">
                    <ProviderCard
                      provider={provider}
                      featured
                      userId={currentUser?.id ?? null}
                      isFavorited={favoriteIds.includes(provider.id)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All providers */}
          <div>
            <h2 className="mb-3 text-lg font-semibold">Profissionais</h2>
            {providers.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-center">
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-muted">
                  <svg
                    className="h-7 w-7 text-muted-foreground"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <p className="font-medium text-foreground">
                  Nenhum prestador encontrado
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Tente buscar por outra categoria
                </p>
              </div>
            ) : (
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
            )}
          </div>
        </ProviderListLoading>
      </CategoryPendingProvider>

      {/* CTA Banner - only for CLIENT users or unauthenticated */}
      {(!currentUser || currentUser.role === "CLIENT") && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Wrench className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">
                Quer oferecer seus serviços?
              </h3>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Cadastre-se como prestador e comece a receber clientes
              </p>
              <Link
                href={currentUser ? "/become-provider" : "/register"}
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary"
              >
                Começar agora
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
