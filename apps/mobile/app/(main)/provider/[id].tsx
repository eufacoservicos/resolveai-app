import { ScrollView, View, Linking, ActivityIndicator } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { MapPin, MessageCircle, Star } from "lucide-react-native";
import { Heading, Text, Muted } from "@/components/ui/text";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";

async function fetchProvider(id: string) {
  const { data, error } = await supabase
    .from("provider_profiles")
    .select(
      `
      id, description, city, state, whatsapp, average_rating, review_count,
      is_verified, provider_type,
      user:users!inner (full_name, avatar_url),
      categories:provider_categories (
        category:categories (id, name, slug)
      )
    `
    )
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as unknown as {
    id: string;
    description: string | null;
    city: string;
    state: string | null;
    whatsapp: string | null;
    average_rating: number | null;
    review_count: number;
    is_verified: boolean | null;
    provider_type: "individual" | "company" | null;
    user: { full_name: string; avatar_url: string | null };
    categories: { category: { id: string; name: string; slug: string } | null }[];
  };
}

function normalizeWhats(raw: string | null): string | null {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, "");
  if (!digits) return null;
  return digits.startsWith("55") ? digits : `55${digits}`;
}

export default function ProviderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const query = useQuery({
    queryKey: ["provider", id],
    queryFn: () => fetchProvider(id!),
    enabled: !!id,
  });

  if (query.isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#0ea5e9" />
      </SafeAreaView>
    );
  }

  if (query.error || !query.data) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <Muted>Prestador não encontrado.</Muted>
      </SafeAreaView>
    );
  }

  const provider = query.data;
  const whatsapp = normalizeWhats(provider.whatsapp);
  const categories = provider.categories
    .map((c) => c.category)
    .filter((c): c is NonNullable<typeof c> => c != null);

  function handleWhatsapp() {
    if (!whatsapp) return;
    const msg = encodeURIComponent(
      `Oi! Vi seu perfil no eufaço! e gostaria de conversar sobre um serviço.`
    );
    Linking.openURL(`https://wa.me/${whatsapp}?text=${msg}`);
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <View className="items-center gap-3">
          <Avatar
            src={provider.user.avatar_url}
            fallback={provider.user.full_name}
            size={96}
          />
          <View className="items-center">
            <Heading className="text-center">{provider.user.full_name}</Heading>
            <View className="mt-1 flex-row items-center gap-1">
              <MapPin size={14} color="#64748b" />
              <Muted>
                {provider.city}
                {provider.state ? `, ${provider.state}` : ""}
              </Muted>
            </View>
            {provider.average_rating != null && (
              <View className="mt-1 flex-row items-center gap-1">
                <Star size={14} color="#f59e0b" fill="#f59e0b" />
                <Text className="font-medium">
                  {provider.average_rating.toFixed(1)}
                  <Muted> ({provider.review_count} avaliações)</Muted>
                </Text>
              </View>
            )}
          </View>
        </View>

        {categories.length > 0 && (
          <View className="flex-row flex-wrap gap-2">
            {categories.map((c) => (
              <Badge key={c.id} variant="secondary">
                {c.name}
              </Badge>
            ))}
          </View>
        )}

        {provider.description && (
          <Card>
            <CardTitle>Sobre</CardTitle>
            <Text className="mt-2">{provider.description}</Text>
          </Card>
        )}

        <Card>
          <CardTitle>Horário e portfólio</CardTitle>
          <CardDescription>
            Business hours + galeria de portfólio serão portados na próxima
            iteração.
          </CardDescription>
        </Card>

        {whatsapp && (
          <Button
            className="bg-emerald-600 active:opacity-90"
            onPress={handleWhatsapp}
          >
            <MessageCircle size={18} color="#ffffff" />
            <Text className="ml-2 text-base font-semibold text-white">
              Chamar no WhatsApp
            </Text>
          </Button>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
