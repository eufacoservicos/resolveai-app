import type { SupabaseClient } from "@supabase/supabase-js";

export type ReportTarget = "provider" | "review";

export type ReportReason =
  | "fake_profile"
  | "service_not_done"
  | "offensive"
  | "wrong_photos"
  | "abusive_pricing"
  | "other";

/** Rótulos na ordem em que aparecem na tela de denúncia. */
export const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: "fake_profile", label: "Perfil falso ou golpe" },
  { value: "service_not_done", label: "Serviço não foi prestado" },
  { value: "offensive", label: "Conteúdo ofensivo ou discriminatório" },
  { value: "wrong_photos", label: "As fotos não são do profissional" },
  { value: "abusive_pricing", label: "Cobrança abusiva" },
  { value: "other", label: "Outro motivo" },
];

export async function createReport(
  supabase: SupabaseClient,
  reporterId: string,
  input: {
    targetType: ReportTarget;
    targetId: string;
    reason: ReportReason;
    details?: string | null;
  },
) {
  const { error } = await supabase.from("reports").insert({
    reporter_id: reporterId,
    target_type: input.targetType,
    target_id: input.targetId,
    reason: input.reason,
    details: input.details?.trim() || null,
  });

  // O índice único impede denunciar o mesmo alvo duas vezes
  if (error?.code === "23505") {
    return { error: null, alreadyReported: true };
  }

  return { error, alreadyReported: false };
}

export async function blockUser(supabase: SupabaseClient, blockerId: string, blockedId: string) {
  const { error } = await supabase
    .from("user_blocks")
    .insert({ blocker_id: blockerId, blocked_id: blockedId });

  // Já bloqueado: o resultado desejado já vale
  if (error?.code === "23505") return { error: null };
  return { error };
}

export async function unblockUser(supabase: SupabaseClient, blockerId: string, blockedId: string) {
  const { error } = await supabase
    .from("user_blocks")
    .delete()
    .eq("blocker_id", blockerId)
    .eq("blocked_id", blockedId);

  return { error };
}

/** Ids de prestadores bloqueados, para sumir da busca. */
export async function getBlockedProviderIds(supabase: SupabaseClient): Promise<string[]> {
  const { data } = await supabase.rpc("blocked_provider_ids");
  return ((data ?? []) as { blocked_provider_ids: string }[] | string[])
    .map((row) => (typeof row === "string" ? row : row.blocked_provider_ids))
    .filter(Boolean);
}

export async function isUserBlocked(
  supabase: SupabaseClient,
  blockerId: string,
  blockedId: string,
): Promise<boolean> {
  const { count } = await supabase
    .from("user_blocks")
    .select("id", { count: "exact", head: true })
    .eq("blocker_id", blockerId)
    .eq("blocked_id", blockedId);

  return (count ?? 0) > 0;
}
