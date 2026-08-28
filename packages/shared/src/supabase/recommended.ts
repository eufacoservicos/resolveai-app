import type { SupabaseClient } from "@supabase/supabase-js";
import { getActiveOffersFor, type ProviderOffer } from "./offers";
import type { ProviderWithDetails } from "../types";

export interface RecommendedProvider {
  provider: ProviderWithDetails;
  /** Oferta vigente, quando existir. */
  offer: ProviderOffer | null;
  /** Primeira foto do portfólio, usada como capa do card em destaque. */
  coverUrl: string | null;
}

/**
 * Profissionais em destaque: quem tem o plano pago em vigor.
 *
 * A ordem é aleatória a cada carregamento para não privilegiar sempre os
 * mesmos assinantes — colocação paga que sempre mostra os mesmos perfis
 * deixa de valer para quem entrou depois.
 */
export async function getRecommendedProviders(
  supabase: SupabaseClient,
  limit = 8,
): Promise<RecommendedProvider[]> {
  const { data: subs } = await supabase
    .from("provider_subscriptions")
    .select("provider_id")
    .eq("plan", "pro")
    .in("status", ["active", "canceled"])
    .gt("current_period_end", new Date().toISOString())
    .limit(limit * 2);

  const ids = ((subs ?? []) as { provider_id: string }[]).map((s) => s.provider_id);
  if (ids.length === 0) return [];

  const { data } = await supabase
    .from("provider_profiles")
    .select(
      `
      *,
      user:users!provider_profiles_user_id_fkey(full_name, avatar_url),
      categories:provider_categories(category:categories(*)),
      portfolio:portfolio_images(*),
      reviews(rating)
    `,
    )
    .in("id", ids)
    .eq("is_active", true);

  // A consulta devolve categorias aninhadas em { category }, diferente
  // do formato achatado de ProviderWithDetails.
  type Row = Omit<ProviderWithDetails, "categories"> & {
    categories: { category: unknown }[];
    reviews: { rating: number }[];
  };

  const providers = ((data ?? []) as unknown as Row[]).map((row) => {
    const ratings = row.reviews ?? [];
    const average =
      ratings.length > 0 ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length : null;

    return {
      ...row,
      categories: (row.categories ?? [])
        .map((c) => c.category)
        .filter(Boolean) as ProviderWithDetails["categories"],
      average_rating: average,
      review_count: ratings.length,
      business_hours: row.business_hours ?? [],
    } as ProviderWithDetails;
  });

  const offers = await getActiveOffersFor(
    supabase,
    providers.map((p) => p.id),
  );

  return providers
    .map((provider) => ({
      provider,
      offer: offers.get(provider.id) ?? null,
      coverUrl: provider.portfolio?.[0]?.image_url ?? provider.user.avatar_url ?? null,
    }))
    .sort(() => Math.random() - 0.5)
    .slice(0, limit);
}
