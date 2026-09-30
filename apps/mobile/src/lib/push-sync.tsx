import { registerPushToken } from "@eufaco/shared";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { getColdStartRoute, getGrantedPushToken, onNotificationTap } from "./push";
import { useSession } from "./session";
import { supabase } from "./supabase";

/**
 * Mantém o aparelho registrado e faz o toque no aviso abrir o destino certo.
 *
 * Fica montado no layout raiz, dentro do SessionProvider, porque as duas
 * coisas dependem da sessão e precisam valer em qualquer tela — não só
 * enquanto a central de avisos está aberta.
 *
 * Não renderiza nada.
 */
export function PushSync() {
  const router = useRouter();
  const { session } = useSession();
  const userId = session?.user.id;

  // Reenvia o token a cada abertura com sessão: ele troca quando a pessoa
  // reinstala o app ou muda de aparelho, e o upsert por token torna repetir
  // barato. Quem nunca concedeu a permissão não é incomodado aqui.
  useEffect(() => {
    if (!userId) return;
    let active = true;

    void getGrantedPushToken()
      .then((result) => {
        if (!active || !result?.token) return;
        return registerPushToken(supabase, userId, result.token, result.platform);
      })
      .catch(() => {
        // Registrar aparelho é acessório e roda em toda abertura: uma falha
        // aqui não pode virar rejeição não tratada na inicialização.
      });

    return () => {
      active = false;
    };
  }, [userId]);

  // Toque num aviso com o app aberto ou em segundo plano
  useEffect(() => {
    try {
      return onNotificationTap((route) => router.push(route));
    } catch {
      return undefined;
    }
  }, [router]);

  // Toque que abriu o app do zero: acontece antes de qualquer listener existir
  useEffect(() => {
    let active = true;
    void getColdStartRoute()
      .then((route) => {
        if (active && route) router.push(route);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [router]);

  return null;
}
