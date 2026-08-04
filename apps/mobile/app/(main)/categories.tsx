import { View, ScrollView, Pressable } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { Heading, Text, Muted } from "@/components/ui/text";
import { supabase } from "@/lib/supabase";
import { getCategoryIcon } from "@/lib/category-icons";

type Category = { id: string; name: string; slug: string };

async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, parent_id")
    .order("name");
  if (error) throw error;
  const rows = (data ?? []) as (Category & { parent_id: string | null })[];
  const hasParents = rows.some((c) => c.parent_id);
  return hasParents ? rows.filter((c) => c.parent_id !== null) : rows;
}

export default function CategoriesScreen() {
  const query = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <View>
          <Heading>Categorias</Heading>
          <Muted className="mt-1">Escolha o tipo de serviço</Muted>
        </View>

        {query.isLoading && <Muted>Carregando...</Muted>}
        {query.error && <Muted>Erro ao carregar categorias.</Muted>}

        <View className="flex-row flex-wrap gap-3">
          {(query.data ?? []).map((category) => {
            const Icon = getCategoryIcon(category.slug);
            return (
              <Pressable
                key={category.id}
                onPress={() =>
                  router.push(`/(main)/search?category=${category.slug}`)
                }
                className="w-[30%] items-center gap-2 rounded-2xl border border-border bg-background p-3 active:opacity-70"
              >
                <View className="h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Icon size={24} color="#0ea5e9" />
                </View>
                <Text
                  className="text-center text-xs font-medium"
                  numberOfLines={2}
                >
                  {category.name}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
