import { useState } from "react";
import { Pressable } from "react-native";
import { router } from "expo-router";
import { Heart } from "lucide-react-native";
import { usePostHog } from "posthog-react-native";
import { toast } from "sonner-native";
import { toggleFavorite } from "@resolveai/shared/supabase/mutations";
import { supabase } from "@/lib/supabase";
import { cn } from "@resolveai/shared/cn";

// Porta do FavoriteButton do PWA, com update otimista e rollback em erro.
type Props = {
  providerId: string;
  userId: string | null;
  isFavorited: boolean;
  className?: string;
  size?: number;
  onToggled?: (isFavorited: boolean) => void;
};

export function FavoriteButton({
  providerId,
  userId,
  isFavorited: initialFavorited,
  className,
  size = 18,
  onToggled,
}: Props) {
  const posthog = usePostHog();
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    if (!userId) {
      toast("Para favoritar, você precisa ter uma conta.", {
        action: {
          label: "Entrar",
          onClick: () => router.push("/login"),
        },
      });
      return;
    }

    setLoading(true);
    const previous = isFavorited;
    setIsFavorited(!previous);

    const { isFavorited: newState, error } = await toggleFavorite(
      supabase,
      userId,
      providerId
    );

    if (error) {
      setIsFavorited(previous);
      toast.error("Erro ao atualizar favorito.");
    } else {
      setIsFavorited(newState);
      onToggled?.(newState);
      // usePostHog() retorna undefined fora do PostHogProvider (sem API key ou
      // durante o prerender), apesar do tipo declarar PostHog nao-nulo.
      posthog?.capture(newState ? "provider_favorited" : "provider_unfavorited", {
        provider_id: providerId,
      });
    }

    setLoading(false);
  }

  return (
    <Pressable
      onPress={handleToggle}
      disabled={loading}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={
        isFavorited ? "Remover dos favoritos" : "Adicionar aos favoritos"
      }
      className={cn(
        "h-9 w-9 items-center justify-center rounded-full border",
        isFavorited
          ? "border-rose-500/40 bg-rose-500/15"
          : "border-white/10 bg-white/[0.04]",
        loading && "opacity-50",
        className
      )}
    >
      <Heart
        size={size}
        color={isFavorited ? "#f43f5e" : "#8891a4"}
        fill={isFavorited ? "#f43f5e" : "transparent"}
      />
    </Pressable>
  );
}
