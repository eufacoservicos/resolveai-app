import {
  getProviderByUserId,
  getQuoteUsage,
  getSubscription,
  type ProviderWithDetails,
  type ProviderSubscription,
  type QuoteUsage,
} from "@eufaco/shared";
import { useCallback, useEffect, useState } from "react";
import { useSession } from "@/lib/session";
import { supabase } from "@/lib/supabase";

interface State {
  /** `null` quando a pessoa ainda não é prestadora. */
  provider: ProviderWithDetails | null;
  subscription: ProviderSubscription | null;
  usage: QuoteUsage | null;
  loading: boolean;
  refresh: () => void;
}

/**
 * Conta do prestador logado: perfil, assinatura e uso da cota.
 *
 * Junta as três consultas porque nenhuma tela usa uma sem a outra — plano
 * sem cota não diz nada, e cota sem plano não sabe qual é o limite.
 */
export function useProviderAccount(): State {
  const { session } = useSession();
  const [provider, setProvider] = useState<ProviderWithDetails | null>(null);
  const [subscription, setSubscription] = useState<ProviderSubscription | null>(null);
  const [usage, setUsage] = useState<QuoteUsage | null>(null);
  const [loading, setLoading] = useState(true);
  const [nonce, setNonce] = useState(0);

  const userId = session?.user.id;

  useEffect(() => {
    if (!userId) {
      setProvider(null);
      setSubscription(null);
      setUsage(null);
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);

    getProviderByUserId(supabase, userId)
      .then(async (result) => {
        const found = result as ProviderWithDetails | null;
        if (!active) return;
        setProvider(found);

        if (!found) {
          setSubscription(null);
          setUsage(null);
          return;
        }

        const [sub, quota] = await Promise.all([
          getSubscription(supabase, found.id),
          getQuoteUsage(supabase, found.id),
        ]);

        if (!active) return;
        setSubscription(sub);
        setUsage(quota);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [userId, nonce]);

  const refresh = useCallback(() => setNonce((n) => n + 1), []);

  return { provider, subscription, usage, loading, refresh };
}
