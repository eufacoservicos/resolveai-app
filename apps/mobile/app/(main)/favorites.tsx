import { useEffect } from "react";
import { ActivityIndicator, FlatList, View } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart } from "lucide-react-native";
import { getUserFavoriteProviders } from "@resolveai/shared/supabase/queries";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-provider";
import { useTabBarPadding } from "@/lib/layout";
import {
  ProviderCard,
  type ProviderCardData,
} from "@/components/providers/provider-card";
import { AmbientBg } from "@/components/ui/ambient-bg";
import { Button } from "@/components/ui/button";
import { Display, Muted, Text } from "@/components/ui/text";

export default function FavoritesScreen() {
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const tabBarPad = useTabBarPadding();

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user]);

  const query = useQuery({
    queryKey: ["favorite-providers", user?.id],
    queryFn: () => getUserFavoriteProviders(supabase, user!.id),
    enabled: !!user,
  });

  const providers = (query.data ?? []) as ProviderCardData[];

  const header = (
    <View className="mb-4 gap-2">
      <View className="flex-row items-center gap-3">
        <View className="h-11 w-11 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10">
          <Heart size={20} color="#22d3ee" fill="#22d3ee" />
        </View>
        <Display className="text-[32px] leading-[34px]">
          Favoritos<Text className="text-[32px] font-black text-primary">.</Text>
        </Display>
      </View>
      <Muted className="ml-14 text-base">
        Prestadores salvos para você voltar quando precisar.
      </Muted>
    </View>
  );

  if (authLoading || query.isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#22d3ee" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="absolute inset-x-0 top-0 h-[300px]">
        <AmbientBg variant="warm" />
      </View>
      <FlatList
        data={providers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProviderCard
            provider={item}
            userId={user?.id ?? null}
            isFavorited
            onFavoriteToggled={() => {
              void queryClient.invalidateQueries({
                queryKey: ["favorite-providers"],
              });
              void queryClient.invalidateQueries({ queryKey: ["favorites"] });
            }}
          />
        )}
        ItemSeparatorComponent={() => <View className="h-3" />}
        ListHeaderComponent={header}
        ListEmptyComponent={
          <View className="items-center py-16">
            <View className="mb-4 h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-card/60">
              <Heart size={30} color="#8891a4" />
            </View>
            <Text className="text-center text-lg font-bold">
              Nenhum favorito ainda
            </Text>
            <Muted className="mt-1.5 max-w-xs text-center">
              Explore prestadores e toque no coração para salvar seus favoritos.
            </Muted>
            <Button
              variant="gradient"
              size="default"
              className="mt-6"
              onPress={() => router.push("/search")}
            >
              Buscar prestadores
            </Button>
          </View>
        }
        contentContainerStyle={{ padding: 20, paddingBottom: tabBarPad }}
        refreshing={query.isFetching && !query.isLoading}
        onRefresh={() => {
          void queryClient.invalidateQueries({
            queryKey: ["favorite-providers"],
          });
        }}
      />
    </SafeAreaView>
  );
}
