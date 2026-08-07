import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import {
  getCurrentUser,
  getProviderById,
  getProviderReviews,
  hasUserReviewedProvider,
} from "@resolveai/shared/supabase/queries";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-provider";
import { trackProfileView } from "@/lib/tracking";
import {
  ProviderDetail,
  type ProviderDetailData,
} from "@/components/providers/provider-detail";
import type { ReviewData } from "@/components/reviews/review-card";
import { Text, Muted } from "@/components/ui/text";

export default function ProviderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user: authUser } = useAuth();

  const currentUserQuery = useQuery({
    queryKey: ["current-user", authUser?.id],
    queryFn: () => getCurrentUser(supabase),
    enabled: !!authUser,
  });
  const currentUser = (currentUserQuery.data ?? null) as {
    id: string;
    role: string;
  } | null;

  const providerQuery = useQuery({
    queryKey: ["provider", id],
    queryFn: () => getProviderById(supabase, id),
    enabled: !!id,
  });

  const reviewsQuery = useQuery({
    queryKey: ["reviews", id],
    queryFn: () => getProviderReviews(supabase, id),
    enabled: !!id,
  });

  const alreadyReviewedQuery = useQuery({
    queryKey: ["has-reviewed", id, currentUser?.id],
    queryFn: () => hasUserReviewedProvider(supabase, id, currentUser!.id),
    enabled: !!id && !!currentUser,
  });

  useEffect(() => {
    if (!id) return;
    if (authUser && !currentUserQuery.isFetched) return;
    void trackProfileView(id, currentUser?.id ?? null);
  }, [id, authUser, currentUserQuery.isFetched, currentUser?.id]);

  const isLoading =
    providerQuery.isLoading ||
    reviewsQuery.isLoading ||
    (!!authUser && currentUserQuery.isLoading);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#22d3ee" />
      </View>
    );
  }

  if (providerQuery.error || !providerQuery.data) {
    return (
      <View className="flex-1 items-center justify-center bg-background p-6">
        <Text className="text-center font-medium">
          Prestador não encontrado
        </Text>
        <Muted className="mt-1 text-center">
          Este perfil pode ter sido removido ou desativado.
        </Muted>
      </View>
    );
  }

  const raw = providerQuery.data;

  const provider: ProviderDetailData = {
    ...(raw as unknown as ProviderDetailData),
    whatsapp: currentUser ? raw.whatsapp : null,
    average_rating: currentUser ? raw.average_rating : null,
    review_count: currentUser ? raw.review_count : 0,
  };

  const reviews = currentUser ? ((reviewsQuery.data ?? []) as ReviewData[]) : [];
  const alreadyReviewed = currentUser
    ? (alreadyReviewedQuery.data ?? true)
    : true;

  return (
    <View className="flex-1 bg-background">
      <ProviderDetail
        provider={provider}
        reviews={reviews}
        currentUser={currentUser}
        alreadyReviewed={alreadyReviewed}
      />
    </View>
  );
}
