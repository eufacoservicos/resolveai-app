import type { SupabaseClient } from "@supabase/supabase-js";

export type DiscountType = "percent" | "fixed";

export interface ProviderOffer {
  id: string;
  provider_id: string;
  title: string;
  discount_type: DiscountType;
  /** percent: 1 a 90. fixed: centavos, para não usar float com dinheiro. */
  discount_value: number;
  valid_until: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/** Rótulo curto para o selo no card: "-15%" ou "-R$ 30". */
export function formatDiscount(offer: Pick<ProviderOffer, "discount_type" | "discount_value">): string {
  if (offer.discount_type === "percent") return `-${offer.discount_value}%`;
  const reais = offer.discount_value / 100;
  return `-R$ ${reais.toFixed(2).replace(".", ",").replace(",00", "")}`;
}

/** Oferta vigente de um prestador, ou null. A RLS já filtra validade. */
export async function getActiveOffer(
  supabase: SupabaseClient,
  providerId: string,
): Promise<ProviderOffer | null> {
  const { data } = await supabase
    .from("provider_offers")
    .select("*")
    .eq("provider_id", providerId)
    .eq("is_active", true)
    .maybeSingle();

  return (data as ProviderOffer | null) ?? null;
}

/** Ofertas vigentes de vários prestadores de uma vez, para listas. */
export async function getActiveOffersFor(
  supabase: SupabaseClient,
  providerIds: string[],
): Promise<Map<string, ProviderOffer>> {
  if (providerIds.length === 0) return new Map();

  const { data } = await supabase
    .from("provider_offers")
    .select("*")
    .in("provider_id", providerIds)
    .eq("is_active", true);

  const map = new Map<string, ProviderOffer>();
  for (const offer of (data ?? []) as ProviderOffer[]) {
    map.set(offer.provider_id, offer);
  }
  return map;
}

/** Histórico completo, incluindo encerradas. Só o dono enxerga. */
export async function getProviderOffers(
  supabase: SupabaseClient,
  providerId: string,
): Promise<ProviderOffer[]> {
  const { data } = await supabase
    .from("provider_offers")
    .select("*")
    .eq("provider_id", providerId)
    .order("created_at", { ascending: false });

  return (data ?? []) as ProviderOffer[];
}

export async function createOffer(
  supabase: SupabaseClient,
  providerId: string,
  input: { title: string; discountType: DiscountType; discountValue: number; validUntil: string },
) {
  // Só uma oferta ativa por vez — o índice único no banco garante, mas
  // encerrar antes evita que o insert falhe por conflito.
  await deactivateOffers(supabase, providerId);

  const { data, error } = await supabase
    .from("provider_offers")
    .insert({
      provider_id: providerId,
      title: input.title.trim(),
      discount_type: input.discountType,
      discount_value: input.discountValue,
      valid_until: input.validUntil,
    })
    .select("*")
    .single();

  return { data: data as ProviderOffer | null, error };
}

export async function deactivateOffers(supabase: SupabaseClient, providerId: string) {
  const { error } = await supabase
    .from("provider_offers")
    .update({ is_active: false })
    .eq("provider_id", providerId)
    .eq("is_active", true);

  return { error };
}

export async function setOfferActive(supabase: SupabaseClient, offerId: string, isActive: boolean) {
  const { error } = await supabase
    .from("provider_offers")
    .update({ is_active: isActive })
    .eq("id", offerId);

  return { error };
}
