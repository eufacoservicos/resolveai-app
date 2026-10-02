import type { PushResult } from "./push";

/**
 * Push não existe na versão web do app.
 *
 * Este arquivo é o que o Metro resolve para `platform=web`, mantendo o
 * `expo-notifications` — que não tem implementação de navegador — fora do
 * bundle. Sem isso, o build web falha ao resolver NotificationsEmitter.
 *
 * A superfície precisa bater com a de `push.ts`: quem importa não sabe em
 * qual plataforma está.
 */
export async function requestPushToken(): Promise<PushResult> {
  return {
    token: null,
    platform: "android",
    error: "As notificações funcionam no aplicativo, não no navegador.",
  };
}

export async function getGrantedPushToken(): Promise<PushResult | null> {
  return null;
}

export function onNotificationTap(_handler: (route: string) => void): () => void {
  return () => undefined;
}

export async function getColdStartRoute(): Promise<string | null> {
  return null;
}

export type { PushResult };
