"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/queries";

export async function trackProfileView(providerId: string) {
  try {
    const supabase = await createClient();
    const user = await getCurrentUser(supabase);

    // Don't track the provider viewing their own profile
    if (user) {
      const { data: ownProfile } = await supabase
        .from("provider_profiles")
        .select("id")
        .eq("user_id", user.id)
        .eq("id", providerId)
        .maybeSingle();

      if (ownProfile) return;
    }

    await supabase.from("profile_views").insert({
      provider_id: providerId,
      viewer_id: user?.id ?? null,
    });
  } catch {
    // Silently fail — tracking should never break the page
  }
}

export async function trackWhatsAppClick(providerId: string) {
  try {
    const supabase = await createClient();
    const user = await getCurrentUser(supabase);

    await supabase.from("whatsapp_clicks").insert({
      provider_id: providerId,
      clicker_id: user?.id ?? null,
    });
  } catch {
    // Silently fail
  }
}
