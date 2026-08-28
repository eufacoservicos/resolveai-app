import type { SupabaseClient } from "@supabase/supabase-js";

export interface ContactedProvider {
  providerId: string;
  fullName: string;
  categoryName: string | null;
  neighborhood: string;
  /** Contato mais recente com este profissional. */
  lastContactAt: string;
  /** Nota que o usuário deu, ou null se ainda não avaliou. */
  myRating: number | null;
}

/**
 * Profissionais que o usuário já chamou no WhatsApp, do mais recente ao mais antigo.
 *
 * Existe para dar destino à tela de avaliação: sem uma lista de "com quem
 * você falou", nada leva a pessoa de volta para avaliar, e o perfil do
 * profissional fica sem nota.
 *
 * Agrupa por profissional — dez cliques no mesmo perfil são um contato só.
 */
export async function getUserContacts(
  supabase: SupabaseClient,
  userId: string,
  limit = 50,
): Promise<ContactedProvider[]> {
  const { data } = await supabase
    .from("whatsapp_clicks")
    .select(
      `
      provider_id,
      created_at,
      provider:provider_profiles!whatsapp_clicks_provider_id_fkey(
        id,
        neighborhood,
        user:users!provider_profiles_user_id_fkey(full_name),
        provider_categories(category:categories(name))
      )
    `,
    )
    .eq("clicker_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit * 4);

  type Row = {
    provider_id: string;
    created_at: string;
    provider: {
      id: string;
      neighborhood: string;
      user: { full_name: string } | null;
      provider_categories: { category: { name: string } | null }[] | null;
    } | null;
  };

  const seen = new Map<string, ContactedProvider>();

  for (const row of (data ?? []) as unknown as Row[]) {
    if (!row.provider || seen.has(row.provider_id)) continue;

    seen.set(row.provider_id, {
      providerId: row.provider_id,
      fullName: row.provider.user?.full_name ?? "Profissional",
      categoryName: row.provider.provider_categories?.[0]?.category?.name ?? null,
      neighborhood: row.provider.neighborhood,
      lastContactAt: row.created_at,
      myRating: null,
    });
  }

  const contacts = Array.from(seen.values()).slice(0, limit);
  if (contacts.length === 0) return [];

  // Marca quais já foram avaliados, para a lista separar pendentes de concluídos
  const { data: reviews } = await supabase
    .from("reviews")
    .select("provider_id, rating")
    .eq("client_id", userId)
    .in(
      "provider_id",
      contacts.map((c) => c.providerId),
    );

  const ratings = new Map(
    ((reviews ?? []) as { provider_id: string; rating: number }[]).map((r) => [r.provider_id, r.rating]),
  );

  return contacts.map((contact) => ({
    ...contact,
    myRating: ratings.get(contact.providerId) ?? null,
  }));
}

/** Registra o clique no botão de orçamento. Alimenta a cota e o histórico. */
export async function trackWhatsAppClick(
  supabase: SupabaseClient,
  providerId: string,
  clickerId: string | null,
) {
  const { error } = await supabase
    .from("whatsapp_clicks")
    .insert({ provider_id: providerId, clicker_id: clickerId });

  return { error };
}
