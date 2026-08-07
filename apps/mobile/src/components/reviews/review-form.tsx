import { useState } from "react";
import { Pressable, View } from "react-native";
import { router } from "expo-router";
import { Send, Star } from "lucide-react-native";
import { useQueryClient } from "@tanstack/react-query";
import { usePostHog } from "posthog-react-native";
import { toast } from "sonner-native";
import { createReview } from "@resolveai/shared/supabase/mutations";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Text, Muted } from "@/components/ui/text";

const RATING_LABELS = ["", "Ruim", "Regular", "Bom", "Muito bom", "Excelente"];

export function ReviewForm({ providerId }: { providerId: string }) {
  const posthog = usePostHog();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (rating === 0) {
      toast.error("Selecione uma nota.");
      return;
    }

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Você precisa estar logado.");
      setLoading(false);
      return;
    }

    const { error } = await createReview(
      supabase,
      providerId,
      user.id,
      rating,
      comment || null
    );

    if (error) {
      toast.error("Erro ao enviar avaliação.");
    } else {
      posthog?.capture("review_submitted", {
        provider_id: providerId,
        rating,
        has_comment: !!comment,
      });
      toast.success("Avaliação enviada!");
      // Equivalente ao router.refresh() do PWA
      void queryClient.invalidateQueries({ queryKey: ["reviews", providerId] });
      void queryClient.invalidateQueries({ queryKey: ["provider", providerId] });
      void queryClient.invalidateQueries({ queryKey: ["has-reviewed", providerId] });
      router.replace(`/provider/${providerId}`);
    }

    setLoading(false);
  }

  return (
    <View className="rounded-xl border border-border bg-card p-5">
      <View className="gap-5">
        <View className="gap-3">
          <Label className="text-sm font-semibold">
            Como foi sua experiência?
          </Label>
          <View className="items-center gap-2 rounded-lg bg-muted/50 p-5">
            <Muted className="mb-1 text-xs">
              Toque nas estrelas para avaliar
            </Muted>
            <View className="flex-row gap-1.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Pressable
                  key={i}
                  onPress={() => setRating(i + 1)}
                  hitSlop={4}
                  accessibilityRole="button"
                  accessibilityLabel={`${i + 1} estrela${i > 0 ? "s" : ""}`}
                >
                  <Star
                    size={40}
                    color={i < rating ? "#fbbf24" : "#1c2030"}
                    fill={i < rating ? "#fbbf24" : "transparent"}
                  />
                </Pressable>
              ))}
            </View>
            {rating > 0 && (
              <Text className="text-sm font-medium">{RATING_LABELS[rating]}</Text>
            )}
          </View>
        </View>

        <View className="gap-1.5">
          <Label className="text-sm font-medium">
            Comentário{" "}
            <Text className="text-sm font-normal text-muted-foreground">
              (opcional)
            </Text>
          </Label>
          <Textarea
            placeholder="Conte como foi sua experiência..."
            value={comment}
            onChangeText={setComment}
            rows={4}
          />
        </View>

        <Button onPress={handleSubmit} loading={loading} className="h-11 w-full">
          <Send size={16} color="#ffffff" />
          <Text className="text-base font-semibold text-primary-foreground">
            Enviar Avaliação
          </Text>
        </Button>
      </View>
    </View>
  );
}
