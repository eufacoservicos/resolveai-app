import { useEffect } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import {
  getCurrentUser,
  getProviderById,
  hasUserReviewedProvider,
} from "@resolveai/shared/supabase/queries";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-provider";
import { ReviewForm } from "@/components/reviews/review-form";
import { Heading, Text, Muted } from "@/components/ui/text";

export default function ReviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user: authUser, loading: authLoading } = useAuth();

  const currentUserQuery = useQuery({
    queryKey: ["current-user", authUser?.id],
    queryFn: () => getCurrentUser(supabase),
    enabled: !!authUser,
  });

  const providerQuery = useQuery({
    queryKey: ["provider", id],
    queryFn: () => getProviderById(supabase, id),
    enabled: !!id,
  });

  const currentUser = currentUserQuery.data ?? null;

  const alreadyReviewedQuery = useQuery({
    queryKey: ["has-reviewed", id, currentUser?.id],
    queryFn: () => hasUserReviewedProvider(supabase, id, currentUser!.id),
    enabled: !!id && !!currentUser,
  });

  // Mesmos redirects do PWA: sem login/prestador vai pra home; ja avaliou
  // volta pro perfil.
  const noUser = !authLoading && !authUser;
  const providerMissing = providerQuery.isFetched && !providerQuery.data;
  const alreadyReviewed = alreadyReviewedQuery.data === true;

  useEffect(() => {
    if (noUser || providerMissing) {
      router.replace("/home");
    } else if (alreadyReviewed) {
      router.replace(`/provider/${id}`);
    }
  }, [noUser, providerMissing, alreadyReviewed, id]);

  const isLoading =
    authLoading ||
    providerQuery.isLoading ||
    (!!authUser && currentUserQuery.isLoading);

  if (isLoading || noUser || providerMissing || alreadyReviewed) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#22d3ee" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 24 }}>
        <View className="gap-2">
          <Heading>Avaliar Prestador</Heading>
          <Muted>
            Avaliando:{" "}
            <Text className="text-sm font-bold">
              {providerQuery.data?.user.full_name}
            </Text>
          </Muted>
        </View>

        <ReviewForm providerId={id} />
      </ScrollView>
    </SafeAreaView>
  );
}
