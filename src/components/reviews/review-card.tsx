"use client";

import { useState } from "react";
import { Star, MessageSquare, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { createReviewReply } from "@/lib/supabase/mutations";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ReviewCardProps {
  review: {
    id: string;
    rating: number;
    comment: string | null;
    created_at: string;
    client: { full_name: string; avatar_url: string | null };
    reply?: { content: string; created_at: string } | null;
  };
  canReply?: boolean;
  providerId?: string;
}

export function ReviewCard({ review, canReply, providerId }: ReviewCardProps) {
  const router = useRouter();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const initials = review.client.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const date = new Date(review.created_at).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  async function handleSubmitReply() {
    if (!replyContent.trim() || !providerId) return;
    setSubmitting(true);

    const supabase = createClient();
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
      router.refresh();
    }
    setSubmitting(false);
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start gap-3">
        <Avatar className="h-9 w-9">
          <AvatarImage src={review.client.avatar_url ?? undefined} />
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold truncate">
              {review.client.full_name}
            </span>
            <span className="text-[11px] text-muted-foreground whitespace-nowrap">
              {date}
            </span>
          </div>
          <div className="my-1.5 flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 ${
                  i < review.rating
                    ? "fill-amber-400 text-amber-400"
                    : "text-border"
                }`}
              />
            ))}
          </div>
          {review.comment && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {review.comment}
            </p>
          )}

          {/* Provider reply */}
          {review.reply && (
            <div className="mt-3 rounded-lg bg-muted/50 border border-border/50 p-3">
              <p className="text-xs font-semibold text-foreground mb-1">
                Resposta do profissional
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {review.reply.content}
              </p>
            </div>
          )}

          {/* Reply button for provider */}
          {canReply && !review.reply && !showReplyForm && (
            <button
              onClick={() => setShowReplyForm(true)}
              className="mt-2 flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              Responder
            </button>
          )}

          {/* Reply form */}
          {showReplyForm && (
            <div className="mt-3 space-y-2">
              <Textarea
                placeholder="Escreva sua resposta..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                rows={3}
                className="rounded-lg border-border resize-none text-sm"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="rounded-lg font-medium gradient-bg"
                  onClick={handleSubmitReply}
                  disabled={submitting || !replyContent.trim()}
                >
                  {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Enviar"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-lg border-border"
                  onClick={() => { setShowReplyForm(false); setReplyContent(""); }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
