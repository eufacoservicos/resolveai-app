"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { createReview } from "@/lib/supabase/mutations";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import posthog from "posthog-js";

interface ReviewFormProps {
  providerId: string;
}

export function ReviewForm({ providerId }: ReviewFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const ratingLabels = ["", "Ruim", "Regular", "Bom", "Muito bom", "Excelente"];
  const activeRating = hoverRating || rating;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

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
      posthog.capture("review_submitted", {
        provider_id: providerId,
        rating,
        has_comment: !!comment,
      });
      toast.success("Avaliação enviada!");
      router.push(`/provider/${providerId}`);
      router.refresh();
    }

    setLoading(false);
  }

  return (
    <div className="rounded-xl border border-border bg-white p-5">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-3">
          <Label className="text-sm font-semibold">
            Como foi sua experiência?
          </Label>
          <div className="flex flex-col items-center gap-2 rounded-lg bg-muted/50 p-5">
            <p className="text-xs text-muted-foreground mb-1">
              Toque nas estrelas para avaliar
            </p>
            <div className="flex gap-1.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onMouseEnter={() => setHoverRating(i + 1)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(i + 1)}
                  className="outline-none"
                >
                  <Star
                    className={`h-10 w-10 transition-colors ${
                      i < activeRating
                        ? "fill-amber-400 text-amber-400"
                        : "text-border"
                    }`}
                  />
                </button>
              ))}
            </div>
            {activeRating > 0 && (
              <span className="text-sm font-medium text-foreground">
                {ratingLabels[activeRating]}
              </span>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="comment" className="text-sm font-medium">
            Comentário{" "}
            <span className="font-normal text-muted-foreground">
              (opcional)
            </span>
          </Label>
          <Textarea
            id="comment"
            placeholder="Conte como foi sua experiência..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className="rounded-lg border-border resize-none"
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-11 rounded-lg font-semibold gap-2 gradient-bg"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Send className="h-4 w-4" />
              Enviar Avaliação
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
