import { useState } from "react";
import { Pressable, View } from "react-native";
import { MessageSquare, Star } from "lucide-react-native";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner-native";
import { createReviewReply } from "@resolveai/shared/supabase/mutations";
import { supabase } from "@/lib/supabase";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Text, Muted } from "@/components/ui/text";

export type ReviewData = {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  client: { full_name: string; avatar_url: string | null };
  reply?: { content: string; created_at: string } | null;
};

type Props = {
  review: ReviewData;
  canReply?: boolean;
  providerId?: string;
};

export function ReviewCard({ review, canReply, providerId }: Props) {
  const queryClient = useQueryClient();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const date = new Date(review.created_at).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  async function handleSubmitReply() {
    if (!replyContent.trim() || !providerId) return;
    setSubmitting(true);

    const { error } = await createReviewReply(
      supabase,
      review.id,
      providerId,
      replyContent.trim()
    );

    if (error) {
      toast.error("Erro ao enviar resposta.");
    } else {
      toast.success("Resposta enviada!");
      setShowReplyForm(false);
      setReplyContent("");
      // Equivalente ao router.refresh() do PWA
      void queryClient.invalidateQueries({ queryKey: ["reviews", providerId] });
    }
    setSubmitting(false);
  }

  return (
    <View className="rounded-lg border border-border bg-card p-4">
      <View className="flex-row items-start gap-3">
        <Avatar
          src={review.client.avatar_url}
          fallback={review.client.full_name}
          size={36}
        />
        <View className="flex-1">
          <View className="flex-row items-center justify-between gap-2">
            <Text numberOfLines={1} className="flex-1 text-sm font-semibold">
              {review.client.full_name}
            </Text>
            <Muted className="text-[11px]">{date}</Muted>
          </View>

          <View className="my-1.5 flex-row gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={14}
                color={i < review.rating ? "#fbbf24" : "#1c2030"}
                fill={i < review.rating ? "#fbbf24" : "transparent"}
              />
            ))}
          </View>

          {review.comment && (
            <Muted className="leading-relaxed">{review.comment}</Muted>
          )}

          {review.reply && (
            <View className="mt-3 rounded-lg border border-border/50 bg-muted/50 p-3">
              <Text className="mb-1 text-xs font-semibold">
                Resposta do profissional
              </Text>
              <Muted className="leading-relaxed">{review.reply.content}</Muted>
            </View>
          )}

          {canReply && !review.reply && !showReplyForm && (
            <Pressable
              onPress={() => setShowReplyForm(true)}
              className="mt-2 flex-row items-center gap-1.5 self-start"
            >
              <MessageSquare size={14} color="#22d3ee" />
              <Text className="text-xs font-medium text-primary">Responder</Text>
            </Pressable>
          )}

          {showReplyForm && (
            <View className="mt-3 gap-2">
              <Textarea
                placeholder="Escreva sua resposta..."
                value={replyContent}
                onChangeText={setReplyContent}
                rows={3}
              />
              <View className="flex-row gap-2">
                <Button
                  size="sm"
                  onPress={handleSubmitReply}
                  loading={submitting}
                  disabled={!replyContent.trim()}
                >
                  Enviar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onPress={() => {
                    setShowReplyForm(false);
                    setReplyContent("");
                  }}
                >
                  Cancelar
                </Button>
              </View>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
