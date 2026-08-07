import { useEffect } from "react";
import { ActivityIndicator, ScrollView } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getCategories,
  getCurrentUser,
  getProviderByUserId,
} from "@resolveai/shared/supabase/queries";
import type { BusinessHours } from "@resolveai/shared/supabase/types";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-provider";
import {
  ProviderProfileForm,
  type ProviderProfileFormData,
} from "@/components/providers/provider-profile-form";
import { BusinessHoursEditor } from "@/components/providers/business-hours-editor";
import type { Category } from "@/components/ui/category-multi-select";
import { AmbientBg } from "@/components/ui/ambient-bg";
import { Display, Muted, Text } from "@/components/ui/text";
import { useTabBarPadding } from "@/lib/layout";
import { View } from "react-native";

export default function ProviderEditScreen() {
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

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories(supabase),
  });

  // Mesmos redirects do PWA: nao prestador ou sem perfil volta pro /profile
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
    authLoading ||
    userQuery.isLoading ||
    providerQuery.isLoading ||
    categoriesQuery.isLoading;

  if (isLoading || !providerQuery.data || notProvider) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#22d3ee" />
      </SafeAreaView>
    );
  }

  const profile = providerQuery.data as unknown as ProviderProfileFormData & {
    business_hours?: BusinessHours[];
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="absolute inset-x-0 top-0 h-[280px]">
        <AmbientBg />
      </View>
      <ScrollView
        contentContainerStyle={{ padding: 20, gap: 24, paddingBottom: tabBarPad }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View>
          <Display className="text-[30px] leading-[32px]">
            Editar{"\n"}
            <Text className="text-[30px] font-black text-primary">
              perfil profissional.
            </Text>
          </Display>
          <Muted className="mt-3">
            Atualize seus dados, categorias e horário de atendimento.
          </Muted>
        </View>

        <ProviderProfileForm
          profile={profile}
          categories={(categoriesQuery.data ?? []) as Category[]}
        />

        <BusinessHoursEditor
          providerId={profile.id}
          initialHours={profile.business_hours ?? []}
          onSaved={() =>
            queryClient.invalidateQueries({ queryKey: ["provider-by-user"] })
          }
        />
      </ScrollView>
    </SafeAreaView>
  );
}
