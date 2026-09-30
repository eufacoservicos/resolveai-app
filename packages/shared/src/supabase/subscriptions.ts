import type { SupabaseClient } from "@supabase/supabase-js";

export type SubscriptionPlan = "free" | "pro";
export type SubscriptionStatus = "active" | "canceled" | "past_due";

export interface ProviderSubscription {
  id: string;
  provider_id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  current_period_start: string;
  current_period_end: string;
  external_id: string | null;
  external_provider: "play_billing" | "stripe" | "mercadopago" | null;
  created_at: string;
  updated_at: string;
}

export interface QuoteUsage {
  plan: SubscriptionPlan;
  used: number;
  /** `null` significa ilimitado, no plano pago. */
  quota: number | null;
  periodStart: string;
  exhausted: boolean;
}

/** Plano em vigor. Assinatura cancelada continua valendo até o fim do período pago. */
export async function getProviderPlan(
  supabase: SupabaseClient,
  providerId: string,
): Promise<SubscriptionPlan> {
  const { data } = await supabase.rpc("provider_plan", { p_provider_id: providerId });
  return (data as SubscriptionPlan | null) ?? "free";
}

/** Orçamentos recebidos no mês corrente, derivados de whatsapp_clicks. */
export async function getQuoteUsage(
  supabase: SupabaseClient,
  providerId: string,
): Promise<QuoteUsage> {
  const { data } = await supabase
    .rpc("provider_quote_usage", { p_provider_id: providerId })
    .single();

  const row = data as
    | { plan: SubscriptionPlan; used: number; quota: number | null; period_start: string; exhausted: boolean }
    | null;

  if (!row) {
    return { plan: "free", used: 0, quota: 10, periodStart: new Date().toISOString(), exhausted: false };
  }

  return {
    plan: row.plan,
    used: row.used,
    quota: row.quota,
    periodStart: row.period_start,
    exhausted: row.exhausted,
  };
}

/**
 * O prestador ainda pode receber orçamento este mês?
 *
 * Devolve só o booleano — a contagem de quem já recebeu quanto não é
 * pública. Serve para a tela do prestador decidir se mostra o botão de
 * WhatsApp; o gatilho `enforce_quote_quota` é quem de fato barra a escrita.
 *
 * Em caso de falha assume que aceita: é melhor um contato a mais do que
 * pausar o botão de quem está em dia por causa de uma consulta que caiu.
 */
export async function providerAcceptsQuotes(
  supabase: SupabaseClient,
  providerId: string,
): Promise<boolean> {
  const { data, error } = await supabase.rpc("provider_accepts_quotes", {
    p_provider_id: providerId,
  });

  if (error) return true;
  return (data as boolean | null) ?? true;
}

export async function getSubscription(
  supabase: SupabaseClient,
  providerId: string,
): Promise<ProviderSubscription | null> {
  const { data } = await supabase
    .from("provider_subscriptions")
    .select("*")
    .eq("provider_id", providerId)
    .maybeSingle();

  return (data as ProviderSubscription | null) ?? null;
}
