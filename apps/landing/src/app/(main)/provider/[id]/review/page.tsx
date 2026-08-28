import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getCurrentUser,
  getProviderById,
  hasUserReviewedProvider,
} from "@/lib/supabase/queries";
import { ReviewForm } from "@/components/reviews/review-form";

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [currentUser, provider] = await Promise.all([
    getCurrentUser(supabase),
    getProviderById(supabase, id),
  ]);

  if (!currentUser || !provider) {
    redirect("/home");
  }

  const alreadyReviewed = await hasUserReviewedProvider(
    supabase,
    id,
    currentUser.id
  );

  if (alreadyReviewed) {
    redirect(`/provider/${id}`);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Avaliar Prestador</h1>
      <p className="text-muted-foreground">
        Avaliando: <strong>{provider.user.full_name}</strong>
      </p>
      <ReviewForm providerId={id} />
    </div>
  );
}
