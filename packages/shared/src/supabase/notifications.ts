import type { SupabaseClient } from "@supabase/supabase-js";

export type NotificationType =
  | "quote_request"
  | "new_review"
  | "review_reply"
  | "review_reminder"
  | "quota_warning"
  | "offer_expiring"
  | "system";

export interface AppNotification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  /** Destino do toque, ex.: { route: "/provider/123" }. */
  data: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
}

export interface NotificationPreferences {
  user_id: string;
  push_enabled: boolean;
  quote_requests: boolean;
  new_reviews: boolean;
  quota_warnings: boolean;
  offers_expiring: boolean;
  review_reminders: boolean;
  review_replies: boolean;
  product_news: boolean;
  promotions: boolean;
  quiet_hours_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
  updated_at: string;
}

/** Chaves que a tela de ajustes controla, fora da chave mestra. */
export type NotificationToggle = Exclude<
  keyof NotificationPreferences,
  "user_id" | "updated_at" | "push_enabled" | "quiet_hours_start" | "quiet_hours_end"
>;

export async function getNotifications(
  supabase: SupabaseClient,
  userId: string,
  limit = 50,
): Promise<AppNotification[]> {
  const { data } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data ?? []) as AppNotification[];
}

export async function getUnreadCount(supabase: SupabaseClient, userId: string): Promise<number> {
  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .is("read_at", null);

  return count ?? 0;
}

export async function markNotificationRead(supabase: SupabaseClient, notificationId: string) {
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", notificationId);

  return { error };
}

export async function markAllNotificationsRead(supabase: SupabaseClient, userId: string) {
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", userId)
    .is("read_at", null);

  return { error };
}

/**
 * Preferências do usuário. O trigger da migration v19 cria a linha junto com
 * a conta, então a ausência só acontece em dados anteriores à migração.
 */
export async function getNotificationPreferences(
  supabase: SupabaseClient,
  userId: string,
): Promise<NotificationPreferences | null> {
  const { data } = await supabase
    .from("notification_preferences")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  return (data as NotificationPreferences | null) ?? null;
}

export async function updateNotificationPreferences(
  supabase: SupabaseClient,
  userId: string,
  patch: Partial<Omit<NotificationPreferences, "user_id" | "updated_at">>,
) {
  const { error } = await supabase
    .from("notification_preferences")
    .upsert({ user_id: userId, ...patch }, { onConflict: "user_id" });

  return { error };
}

/** Registra o aparelho para push. O token é único, então reenviar é seguro. */
export async function registerPushToken(
  supabase: SupabaseClient,
  userId: string,
  token: string,
  platform: "android" | "ios",
) {
  const { error } = await supabase.from("push_tokens").upsert(
    { user_id: userId, token, platform, last_used_at: new Date().toISOString() },
    { onConflict: "token" },
  );

  return { error };
}

export async function removePushToken(supabase: SupabaseClient, token: string) {
  const { error } = await supabase.from("push_tokens").delete().eq("token", token);
  return { error };
}
