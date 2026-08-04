import { FlatList, RefreshControl, View, ActivityIndicator } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { ProviderCard, type ProviderCardData } from "./provider-card";
import { Muted } from "@/components/ui/text";

type ProviderGridProps = {
  categorySlug?: string;
  city?: string;
  search?: string;
  limit?: number;
};

async function fetchProviders({
  categorySlug,
  city,
  search,
  limit = 30,
}: ProviderGridProps): Promise<ProviderCardData[]> {
  let query = supabase
    .from("provider_profiles")
    .select(
      `
      id,
      description,
      city,
      state,
      average_rating,
      review_count,
      is_verified,
      user:users!inner (full_name, avatar_url),
      categories:provider_categories (
        category:categories (id, name, slug)
      )
    `
    )
    .eq("is_active", true)
    .order("average_rating", { ascending: false, nullsFirst: false })
    .limit(limit);

  if (city) query = query.ilike("city", `%${city}%`);
  if (search) query = query.ilike("description", `%${search}%`);

  const { data, error } = await query;
  if (error) throw error;

  type Row = {
    id: string;
    description: string | null;
    city: string;
    state: string | null;
    average_rating: number | null;
    review_count: number;
    is_verified: boolean | null;
    user: { full_name: string; avatar_url: string | null };
    categories: {
      category: { id: string; name: string; slug: string } | null;
    }[];
  };

  const rows = (data as unknown as Row[]) ?? [];
  const results: ProviderCardData[] = [];

  for (const row of rows) {
    const categories = (row.categories ?? [])
      .map((c) => c.category)
      .filter((c): c is { id: string; name: string; slug: string } => c != null);

    if (categorySlug && !categories.some((c) => c.slug === categorySlug)) {
      continue;
    }

    results.push({
      id: row.id,
      user: row.user,
      categories,
      description: row.description,
      city: row.city,
      state: row.state,
      average_rating: row.average_rating,
      review_count: row.review_count,
      is_verified: row.is_verified ?? false,
    });
  }

  return results;
}

export function ProviderGrid(props: ProviderGridProps) {
  const query = useQuery({
    queryKey: ["providers", props],
    queryFn: () => fetchProviders(props),
  });

  if (query.isLoading) {
    return (
      <View className="items-center py-10">
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );
  }

  if (query.error) {
    return (
      <View className="items-center py-10">
        <Muted>Erro ao carregar prestadores.</Muted>
      </View>
    );
  }

  const data = query.data ?? [];

  if (data.length === 0) {
    return (
      <View className="items-center py-10">
        <Muted>Nenhum prestador encontrado.</Muted>
      </View>
    );
  }

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <ProviderCard provider={item} />}
      ItemSeparatorComponent={() => <View className="h-3" />}
      contentContainerStyle={{ paddingBottom: 24 }}
      refreshControl={
        <RefreshControl
          refreshing={query.isFetching && !query.isLoading}
          onRefresh={() => query.refetch()}
        />
      }
    />
  );
}
