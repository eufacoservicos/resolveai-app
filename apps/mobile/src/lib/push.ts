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
 * Pede permissão e registra o aparelho para push.
 *
 * Existe em versão `.web.ts` separada porque `expo-notifications` não tem
 * implementação de navegador: importá-lo no bundle web quebra a resolução.
 */
export async function requestPushToken(): Promise<PushResult> {
  const platform = Platform.OS === "ios" ? "ios" : "android";

  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") {
    return {
      token: null,
      platform,
      error: "Você recusou as notificações. Para ativar depois, use os ajustes do aparelho.",
    };
  }

  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId as string | undefined;
    const token = await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined);
    return { token: token.data, platform, error: null };
  } catch {
    return {
      token: null,
      platform,
      error: "Notificações ativadas, mas não conseguimos registrar este aparelho. Tente mais tarde.",
    };
  }
}
