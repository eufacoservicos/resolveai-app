import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export interface PushResult {
  /** Token do aparelho, quando a permissão foi concedida. */
  token: string | null;
  platform: "android" | "ios";
  /** Mensagem pronta para exibir quando algo impediu o registro. */
  error: string | null;
}

/**
 * O Expo Go não entrega push desde o SDK 53 no Android, e desde o 54 em
 * nenhuma plataforma — é preciso uma development build. Detectar isso deixa
 * a mensagem honesta em vez de "não conseguimos registrar este aparelho",
 * que faria procurar defeito onde não há.
 */
const IS_EXPO_GO = Constants.appOwnership === "expo";

const EXPO_GO_MESSAGE =
  "As notificações não funcionam no Expo Go. Instale uma development build para testá-las.";

/**
 * O que fazer com um aviso que chega com o app aberto.
 *
 * Sem isto o Android e o iOS engolem a notificação em primeiro plano: ela
 * entra na central, mas a pessoa não vê nada acontecer na hora.
 *
 * Roda no import, então uma exceção aqui derrubaria a abertura do app —
 * daí o try. Notificação é acessório; abrir o app não é.
 */
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
} catch {
  // Ambiente sem suporte a notificação: o resto do app não depende disto.
}

/**
 * Canal padrão do Android.
 *
 * A partir do Android 8 toda notificação precisa de um canal; sem criar um,
 * o sistema usa um mudo e sem prioridade, e o aviso não aparece na tela.
 */
async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync("default", {
    name: "Avisos do eufaço!",
    importance: Notifications.AndroidImportance.DEFAULT,
    lightColor: "#0EA5E9",
  });
}

/** Busca o token do Expo. Devolve null quando o registro falha. */
async function fetchExpoToken(): Promise<string | null> {
  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId as string | undefined;
    const token = await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined);
    return token.data;
  } catch {
    return null;
  }
}

/**
 * Pede permissão e registra o aparelho para push.
 *
 * Existe em versão `.web.ts` separada porque `expo-notifications` não tem
 * implementação de navegador: importá-lo no bundle web quebra a resolução.
 */
export async function requestPushToken(): Promise<PushResult> {
  const platform = Platform.OS === "ios" ? "ios" : "android";

  if (IS_EXPO_GO) return { token: null, platform, error: EXPO_GO_MESSAGE };

  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") {
    return {
      token: null,
      platform,
      error: "Você recusou as notificações. Para ativar depois, use os ajustes do aparelho.",
    };
  }

  await ensureAndroidChannel();
  const token = await fetchExpoToken();

  if (!token) {
    return {
      token: null,
      platform,
      error: "Notificações ativadas, mas não conseguimos registrar este aparelho. Tente mais tarde.",
    };
  }

  return { token, platform, error: null };
}

/**
 * Token de quem já concedeu a permissão antes, sem abrir diálogo nenhum.
 *
 * O token do Expo troca quando a pessoa reinstala o app ou muda de aparelho.
 * Se só a tela de permissão registrasse, quem já tinha aceitado ficaria com
 * um token velho no banco e pararia de receber sem saber por quê.
 */
export async function getGrantedPushToken(): Promise<PushResult | null> {
  const platform = Platform.OS === "ios" ? "ios" : "android";

  if (IS_EXPO_GO) return null;

  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted") return null;

    await ensureAndroidChannel();
    const token = await fetchExpoToken();
    return token ? { token, platform, error: null } : null;
  } catch {
    // Roda em toda abertura do app: falhar aqui não pode impedir ninguém de
    // usar o resto. Quem quiser ativar de novo passa pela tela de permissão.
    return null;
  }
}

/** Rota guardada no `data` do aviso, quando houver. */
function routeOf(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const route = (data as { route?: unknown }).route;
  return typeof route === "string" && route.startsWith("/") ? route : null;
}

/**
 * Avisa quando a pessoa toca numa notificação, para o app abrir o destino.
 * Devolve a função que cancela a inscrição.
 */
export function onNotificationTap(handler: (route: string) => void): () => void {
  const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
    const route = routeOf(response.notification.request.content.data);
    if (route) handler(route);
  });
  return () => subscription.remove();
}

/**
 * Destino do toque que abriu o app do zero.
 *
 * Quando o app estava fechado, o toque acontece antes de qualquer listener
 * existir — este é o único jeito de não perder a navegação.
 */
export async function getColdStartRoute(): Promise<string | null> {
  const response = await Notifications.getLastNotificationResponseAsync();
  return response ? routeOf(response.notification.request.content.data) : null;
}
