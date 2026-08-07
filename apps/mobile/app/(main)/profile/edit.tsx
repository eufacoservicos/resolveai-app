import { useEffect } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "@resolveai/shared/supabase/queries";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-provider";
import { UserProfileForm } from "@/components/auth/user-profile-form";
import { AmbientBg } from "@/components/ui/ambient-bg";
import { Display, Muted, Text } from "@/components/ui/text";
import { useTabBarPadding } from "@/lib/layout";

export default function EditProfileScreen() {
  const { user: authUser, loading: authLoading } = useAuth();
  const tabBarPad = useTabBarPadding();

  const userQuery = useQuery({
    queryKey: ["current-user", authUser?.id],
    queryFn: () => getCurrentUser(supabase),
    enabled: !!authUser,
  });

  useEffect(() => {
    if (!authLoading && !authUser) router.replace("/login");
  }, [authLoading, authUser]);

  const user = userQuery.data as
    | { id: string; full_name: string; email: string; avatar_url: string | null }
    | undefined;

  if (authLoading || userQuery.isLoading || !user) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#22d3ee" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="absolute inset-x-0 top-0 h-[280px]">
        <AmbientBg />
      </View>
      <ScrollView
        contentContainerStyle={{ padding: 20, gap: 24, paddingBottom: tabBarPad }}
        showsVerticalScrollIndicator={false}
      >
        <View>
          <Display className="text-[30px] leading-[32px]">
            Editar{"\n"}
            <Text className="text-[30px] font-black text-primary">
              dados pessoais.
            </Text>
          </Display>
          <Muted className="mt-3">
            Atualize seu nome, email e foto de perfil.
          </Muted>
        </View>
        <UserProfileForm user={user} />
      </ScrollView>
    </SafeAreaView>
  );
}
