import { useEffect } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getCurrentUser,
  getProviderByUserId,
} from "@resolveai/shared/supabase/queries";
import { MAX_PORTFOLIO_IMAGES } from "@resolveai/shared/constants";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-provider";
import {
  PortfolioManager,
  type PortfolioImage,
} from "@/components/providers/portfolio-manager";
import { AmbientBg } from "@/components/ui/ambient-bg";
import { Display, Muted, Text } from "@/components/ui/text";
import { useTabBarPadding } from "@/lib/layout";

export default function ProviderPortfolioScreen() {
  const { user: authUser, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const tabBarPad = useTabBarPadding();

  const userQuery = useQuery({
    queryKey: ["current-user", authUser?.id],
    queryFn: () => getCurrentUser(supabase),
    enabled: !!authUser,
  });
  const user = userQuery.data as { id: string; role: string } | undefined;

  const providerQuery = useQuery({
    queryKey: ["provider-by-user", user?.id],
    queryFn: () => getProviderByUserId(supabase, user!.id),
    enabled: !!user && user.role === "PROVIDER",
  });

  const notProvider = userQuery.isFetched && (!user || user.role !== "PROVIDER");
  const profileMissing = providerQuery.isFetched && !providerQuery.data;

  useEffect(() => {
    if (!authLoading && !authUser) {
      router.replace("/login");
    } else if (notProvider || profileMissing) {
      router.replace("/profile");
    }
  }, [authLoading, authUser, notProvider, profileMissing]);

  const isLoading =
    authLoading || userQuery.isLoading || providerQuery.isLoading;

  if (isLoading || !providerQuery.data || !user || notProvider) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#22d3ee" />
      </SafeAreaView>
    );
  }

  const profile = providerQuery.data as unknown as {
    id: string;
    portfolio?: PortfolioImage[];
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="absolute inset-x-0 top-0 h-[280px]">
        <AmbientBg variant="warm" />
      </View>
      <ScrollView
        contentContainerStyle={{ padding: 20, gap: 20, paddingBottom: tabBarPad }}
        showsVerticalScrollIndicator={false}
      >
        <View>
          <Display className="text-[30px] leading-[32px]">
            Meu{"\n"}
            <Text className="text-[30px] font-black text-primary">
              portfólio.
            </Text>
          </Display>
          <Muted className="mt-3">
            Adicione até {MAX_PORTFOLIO_IMAGES} fotos dos seus trabalhos para
            conquistar mais clientes.
          </Muted>
        </View>

        <PortfolioManager
          providerId={profile.id}
          userId={user.id}
          images={profile.portfolio ?? []}
          onChanged={() =>
            queryClient.invalidateQueries({ queryKey: ["provider-by-user"] })
          }
        />
      </ScrollView>
    </SafeAreaView>
  );
}
