import type { PushResult } from "./push";

/**
 * Push não existe na versão web do app.
 *
 * Este arquivo é o que o Metro resolve para `platform=web`, mantendo o
 * `expo-notifications` — que não tem implementação de navegador — fora do
 * bundle. Sem isso, o build web falha ao resolver NotificationsEmitter.
 */
export async function requestPushToken(): Promise<PushResult> {
  return {
    token: null,
    platform: "android",
    error: "As notificações funcionam no aplicativo, não no navegador.",
  };
}

export type { PushResult };
