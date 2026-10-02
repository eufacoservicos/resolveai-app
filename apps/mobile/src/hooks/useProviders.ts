import { getActiveProviders, type ProviderWithDetails } from "@eufaco/shared";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Filters = Parameters<typeof getActiveProviders>[1];

interface State {
  providers: ProviderWithDetails[];
  total: number;
  loading: boolean;
  /** Mensagem pronta para exibir. `null` quando deu tudo certo. */
  error: string | null;
  refresh: () => void;
}

export function useProviders(filters?: Filters): State {
  const [providers, setProviders] = useState<ProviderWithDetails[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  // Serializa os filtros: evita refetch a cada render só porque o objeto é novo
  const key = JSON.stringify(filters ?? {});

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    getActiveProviders(supabase, JSON.parse(key) as Filters)
      .then((result) => {
        if (!active) return;
        setProviders(result.providers as ProviderWithDetails[]);
        setTotal(result.total);
      })
      .catch(() => {
        if (!active) return;
        setError(
          "Não foi possível carregar os profissionais. Verifique sua conexão e tente de novo.",
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [key, nonce]);

  const refresh = useCallback(() => setNonce((n) => n + 1), []);

  return { providers, total, loading, error, refresh };
}
