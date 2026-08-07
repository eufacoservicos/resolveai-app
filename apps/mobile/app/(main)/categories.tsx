import { ActivityIndicator, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { getCategories } from "@resolveai/shared/supabase/queries";
import { supabase } from "@/lib/supabase";
import { CategoryList } from "@/components/providers/category-list";
import { AmbientBg } from "@/components/ui/ambient-bg";
import { Display, Muted, Text } from "@/components/ui/text";
import { useTabBarPadding } from "@/lib/layout";

export default function CategoriesScreen() {
  const query = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories(supabase),
  });
  const tabBarPad = useTabBarPadding();

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="absolute inset-x-0 top-0 h-[300px]">
        <AmbientBg variant="violet" />
      </View>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: tabBarPad, gap: 20 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View>
          <Display className="text-[32px] leading-[34px]">
            Todas as{"\n"}
            <Text className="text-[32px] font-black text-primary">
              categorias.
            </Text>
          </Display>
          <Muted className="mt-3 text-base">
            Escolha o tipo de serviço que você precisa.
          </Muted>
        </View>

        {query.isLoading ? (
          <View className="items-center py-16">
            <ActivityIndicator size="large" color="#22d3ee" />
          </View>
        ) : query.error ? (
          <Muted className="py-12 text-center">
            Erro ao carregar categorias.
          </Muted>
        ) : (
          <CategoryList categories={query.data ?? []} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
