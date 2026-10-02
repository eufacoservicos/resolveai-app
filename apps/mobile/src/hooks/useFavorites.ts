import { getUserFavorites, toggleFavorite } from "@eufaco/shared";
import { useCallback, useEffect, useState } from "react";
import { useSession } from "@/lib/session";
import { supabase } from "@/lib/supabase";

interface State {
  /** Ids dos prestadores favoritados pelo usuário atual. */
  favoriteIds: Set<string>;
  /** Alterna o favorito. Retorna false se não houver sessão. */
  toggle: (providerId: string) => Promise<boolean>;
}

export function useFavorites(): State {
  const { session } = useSession();
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  const userId = session?.user.id;

  useEffect(() => {
    if (!userId) {
      setFavoriteIds(new Set());
      return;
    }
    let active = true;
    getUserFavorites(supabase, userId)
      .then((ids) => {
        if (active) setFavoriteIds(new Set(ids));
      })
      .catch(() => {
        // Silencioso: favoritar é secundário e a lista real vive na aba Favoritos
      });
    return () => {
      active = false;
    };
  }, [userId]);

  const toggle = useCallback(
    async (providerId: string) => {
      if (!userId) return false;

      // Atualiza na hora e desfaz se o servidor recusar
      const optimistic = new Set(favoriteIds);
      const wasFavorite = optimistic.has(providerId);
      if (wasFavorite) optimistic.delete(providerId);
      else optimistic.add(providerId);
      setFavoriteIds(optimistic);

      try {
        await toggleFavorite(supabase, userId, providerId);
        return true;
      } catch {
        const reverted = new Set(optimistic);
        if (wasFavorite) reverted.add(providerId);
        else reverted.delete(providerId);
        setFavoriteIds(reverted);
        return false;
      }
    },
    [userId, favoriteIds],
  );

  return { favoriteIds, toggle };
}
