import { supabase } from "./supabase";

// Porta das server actions de apps/web (provider/[id]/actions.ts). No RN nao ha
// server actions, entao os inserts saem direto do client. Como no PWA, qualquer
// falha e engolida: tracking nunca pode quebrar a tela.

/** Registra a visualizacao de um perfil, ignorando o dono do proprio perfil. */
export async function trackProfileView(
  providerId: string,
  userId: string | null
) {
  try {
    if (userId) {
      const { data: ownProfile } = await supabase
        .from("provider_profiles")
        .select("id")
        .eq("user_id", userId)
        .eq("id", providerId)
        .maybeSingle();

      if (ownProfile) return;
    }

    await supabase.from("profile_views").insert({
      provider_id: providerId,
      viewer_id: userId,
    });
  } catch {
    // silencioso
  }
}

export async function trackWhatsAppClick(
  providerId: string,
  userId: string | null
) {
  try {
    await supabase.from("whatsapp_clicks").insert({
      provider_id: providerId,
      clicker_id: userId,
    });
  } catch {
    // silencioso
  }
}
