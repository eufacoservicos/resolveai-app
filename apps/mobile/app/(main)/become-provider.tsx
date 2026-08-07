import { useEffect } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { Wrench } from "lucide-react-native";
import {
  getCategories,
  getCurrentUser,
} from "@resolveai/shared/supabase/queries";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-provider";
import { useTabBarPadding } from "@/lib/layout";
import { BecomeProviderForm } from "@/components/providers/become-provider-form";
import type { Category } from "@/components/ui/category-multi-select";
import { AmbientBg } from "@/components/ui/ambient-bg";
import { Display, Muted, Text } from "@/components/ui/text";

export default function BecomeProviderScreen() {
  const { user: authUser, loading: authLoading } = useAuth();
  const tabBarPad = useTabBarPadding();

  const userQuery = useQuery({
    queryKey: ["current-user", authUser?.id],
    queryFn: () => getCurrentUser(supabase),
    enabled: !!authUser,
  });
  const user = userQuery.data as { id: string; role: string } | undefined;

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories(supabase),
  });

  const alreadyProvider = user?.role === "PROVIDER";

  useEffect(() => {
    if (!authLoading && !authUser) {
      router.replace("/login");
    } else if (alreadyProvider) {
      router.replace("/provider/edit");
    }
  }, [authLoading, authUser, alreadyProvider]);

  const isLoading =
    authLoading || userQuery.isLoading || categoriesQuery.isLoading;

  if (isLoading || !user || alreadyProvider) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#22d3ee" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="absolute inset-x-0 top-0 h-[380px]">
        <AmbientBg variant="violet" />
      </View>
      <ScrollView
        contentContainerStyle={{ padding: 20, gap: 24, paddingBottom: tabBarPad }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View>
          <View className="mb-4 h-14 w-14 items-center justify-center rounded-2xl border border-primary/30 bg-primary/15">
            <Wrench size={26} color="#22d3ee" />
          </View>
          <Display className="text-[32px] leading-[34px]">
            Torne-se um{"\n"}
            <Text className="text-[32px] font-black text-primary">
              prestador.
            </Text>
          </Display>
          <Muted className="mt-3 text-base">
            Preencha seus dados e comece a receber clientes hoje mesmo. Sem taxa,
            sem comissão.
          </Muted>
        </View>

        <BecomeProviderForm
          categories={(categoriesQuery.data ?? []) as Category[]}
          userId={user.id}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
