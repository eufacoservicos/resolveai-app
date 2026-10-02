// ============================================
// send-push — entrega no aparelho o aviso que o banco criou
// ============================================
//
// Os gatilhos da migration v21 gravam em `notifications` e a central do app
// já lê de lá. Esta função é o pedaço que faltava: pega o aviso recém-criado,
// procura os aparelhos daquela pessoa em `push_tokens` e manda para a API de
// push do Expo, que fala com o FCM e o APNs por nós.
//
// Chamada pelo gatilho `on_notification_created_push` (migration v22), que
// passa só o id — o corpo do aviso é relido aqui com o service role, para
// nada sensível trafegar por webhook.
//
// Deploy:  supabase functions deploy send-push
// Segredo: nenhum além dos que o runtime já injeta (SUPABASE_URL e
//          SUPABASE_SERVICE_ROLE_KEY). Contas Expo com "Enhanced Security"
//          para push exigem também EXPO_ACCESS_TOKEN.

/// <reference types="npm:@supabase/functions-js/edge-runtime.d.ts" />

// Especificador completo, não um nu com import map: o deploy sobe este
// arquivo sozinho, então tudo que ele precisa para resolver vem aqui dentro.
import { createClient } from "npm:@supabase/supabase-js@2";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

/** Lote máximo aceito pela API do Expo numa chamada só. */
const EXPO_BATCH_SIZE = 100;

interface PushToken {
  token: string;
  platform: string;
}

interface NotificationRow {
  id: string;
  user_id: string;
  title: string;
  body: string;
  data: Record<string, unknown>;
}

interface Preferences {
  push_enabled: boolean;
  quiet_hours_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
}

/**
 * Está dentro do "não perturbe"?
 *
 * A janela pode virar a meia-noite (22:00 às 08:00), então o caso em que o
 * fim é menor que o começo é o normal, não a exceção.
 *
 * O horário de referência é o de Brasília: o banco guarda a preferência como
 * `time` sem fuso, e o público do app está todo no mesmo país.
 */
function isQuietNow(prefs: Preferences): boolean {
  if (!prefs.quiet_hours_enabled) return false;

  const now = new Date().toLocaleTimeString("en-GB", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
  });

  const start = prefs.quiet_hours_start.slice(0, 5);
  const end = prefs.quiet_hours_end.slice(0, 5);

  return start <= end ? now >= start && now < end : now >= start || now < end;
}

Deno.serve(async (request: Request) => {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  let notificationId: string | undefined;
  try {
    const payload = await request.json();
    // Aceita tanto o formato do gatilho quanto o de Database Webhook, para
    // quem preferir configurar pelo painel em vez da migration.
    notificationId = payload?.notification_id ?? payload?.record?.id;
  } catch {
    return new Response("Corpo inválido", { status: 400 });
  }

  if (!notificationId) {
    return new Response("notification_id ausente", { status: 400 });
  }

  const { data: notification } = await supabase
    .from("notifications")
    .select("id, user_id, title, body, data")
    .eq("id", notificationId)
    .maybeSingle<NotificationRow>();

  if (!notification) {
    // Aviso apagado entre o gatilho e a chamada: nada a fazer, e repetir
    // não ajudaria — 200 para o pg_net não ficar reenfileirando.
    return Response.json({ skipped: "notification_not_found" });
  }

  const { data: prefs } = await supabase
    .from("notification_preferences")
    .select("push_enabled, quiet_hours_enabled, quiet_hours_start, quiet_hours_end")
    .eq("user_id", notification.user_id)
    .maybeSingle<Preferences>();

  // A chave mestra desligada silencia tudo. Sem linha de preferência vale o
  // padrão da v19, que é receber.
  if (prefs && !prefs.push_enabled) {
    return Response.json({ skipped: "push_disabled" });
  }

  // O silêncio noturno vale para o aparelho, não para a central: o aviso
  // continua gravado e a pessoa acha de manhã.
  if (prefs && isQuietNow(prefs)) {
    return Response.json({ skipped: "quiet_hours" });
  }

  const { data: tokens } = await supabase
    .from("push_tokens")
    .select("token, platform")
    .eq("user_id", notification.user_id);

  const list = (tokens ?? []) as PushToken[];
  if (list.length === 0) {
    return Response.json({ skipped: "no_devices" });
  }

  const expoAccessToken = Deno.env.get("EXPO_ACCESS_TOKEN");
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (expoAccessToken) headers.Authorization = `Bearer ${expoAccessToken}`;

  /** Tokens que o Expo disse não existirem mais, para limpar do banco. */
  const stale: string[] = [];
  let sent = 0;

  for (let i = 0; i < list.length; i += EXPO_BATCH_SIZE) {
    const batch = list.slice(i, i + EXPO_BATCH_SIZE);

    const messages = batch.map((device) => ({
      to: device.token,
      title: notification.title,
      body: notification.body,
      data: notification.data ?? {},
      sound: "default",
      channelId: "default",
    }));

    const response = await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(messages),
    });

    if (!response.ok) continue;

    const result = await response.json();
    const tickets = (result?.data ?? []) as { status: string; details?: { error?: string } }[];

    tickets.forEach((ticket, index) => {
      if (ticket.status === "ok") {
        sent += 1;
        return;
      }
      // Aparelho que desinstalou o app: guardar o token só faria a próxima
      // entrega falhar de novo.
      if (ticket.details?.error === "DeviceNotRegistered") {
        const device = batch[index];
        if (device) stale.push(device.token);
      }
    });
  }

  if (stale.length > 0) {
    await supabase.from("push_tokens").delete().in("token", stale);
  }

  await supabase
    .from("notifications")
    .update({ push_sent_at: new Date().toISOString() })
    .eq("id", notification.id);

  return Response.json({ sent, devices: list.length, removed: stale.length });
});
