import { getUserFavoriteProviders, type ProviderWithDetails } from "@eufaco/shared";
import { Card, Text, useTheme } from "@eufaco/design-system/native";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ProviderCard } from "@/components/ProviderCard";
import { SignInPrompt } from "@/components/SignInPrompt";
import { useSession } from "@/lib/session";
import { supabase } from "@/lib/supabase";

export default function FavoritesScreen() {
  const { colors, spacing, layout } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { session, loading: sessionLoading } = useSession();

  const [providers, setProviders] = useState<ProviderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userId = session?.user.id;

  // Recarrega ao voltar para a aba: o favorito pode ter mudado em outra tela
  useFocusEffect(
    useCallback(() => {
      if (!userId) {
        setLoading(false);
        return;
      }
      let active = true;
      setLoading(true);
      setError(null);

      getUserFavoriteProviders(supabase, userId)
        .then((result) => {
          if (active) setProviders(result as ProviderWithDetails[]);
        })
        .catch(() => {
          if (active) setError("Não foi possível carregar seus favoritos. Tente de novo.");
        })
        .finally(() => {
          if (active) setLoading(false);
        });

      return () => {
        active = false;
      };
    }, [userId]),
  );

  if (sessionLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!session) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, paddingBottom: 90 }}>
        <SignInPrompt
          title="Salve quem você gostou"
          description="Entre na sua conta para guardar profissionais e encontrá-los depois sem precisar buscar de novo."
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top + spacing[2] }}>
      <Text variant="h3" style={{ textAlign: "center", paddingHorizontal: layout.screenPadding }}>
        Favoritos
      </Text>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: layout.screenPadding,
          paddingTop: spacing[4],
          paddingBottom: 110,
          gap: spacing[3],
        }}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={{ paddingVertical: spacing[10], alignItems: "center" }}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : error ? (
          <Card style={{ alignItems: "center", paddingVertical: spacing[6] }}>
            <Text variant="bodyStrong" style={{ textAlign: "center" }}>
              {error}
            </Text>
          </Card>
        ) : providers.length === 0 ? (
          <Card style={{ alignItems: "center", paddingVertical: spacing[8], gap: spacing[2] }}>
            <Text variant="title">Nenhum favorito ainda</Text>
            <Text color="textSecondary" style={{ textAlign: "center" }}>
              Toque no coração em qualquer perfil para salvá-lo aqui.
            </Text>
          </Card>
        ) : (
          providers.map((p) => (
            <ProviderCard
              key={p.id}
              provider={p}
              favorited
              onPress={() => router.push(`/provider/${p.id}`)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}
