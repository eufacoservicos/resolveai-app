import { getUserFavoriteProviders, type ProviderWithDetails } from "@eufaco/shared";
import { Card, Text, fontSize, lineHeight, useTheme } from "@eufaco/design-system/native";
import { useFocusEffect, useRouter } from "expo-router";
import { Heart } from "lucide-react-native";
import { useCallback, useState } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";
import { AppBar } from "@/components/AppBar";
import { ProviderCard } from "@/components/ProviderCard";
import { SignInPrompt } from "@/components/SignInPrompt";
import { useTabBarClearance } from "@/components/TabBar";
import { useFavorites } from "@/hooks/useFavorites";
import { useSession } from "@/lib/session";
import { supabase } from "@/lib/supabase";

export default function FavoritesScreen() {
  const { colors, radii, spacing, layout } = useTheme();
  const router = useRouter();
  const { session, loading: sessionLoading } = useSession();
  const { toggle } = useFavorites();
  const tabBarClearance = useTabBarClearance();

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

  /** Tira da lista na hora: esperar o servidor deixaria o card fantasma. */
  const removeFavorite = (providerId: string) => {
    setProviders((current) => current.filter((p) => p.id !== providerId));
    void toggle(providerId);
  };

  if (sessionLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!session) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, paddingBottom: tabBarClearance }}>
        <SignInPrompt
          title="Salve quem você gostou"
          description="Entre na sua conta para guardar profissionais e encontrá-los depois sem precisar buscar de novo."
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <AppBar title="Favoritos" showBack={false} />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: layout.screenPadding,
          paddingTop: 18,
          paddingBottom: tabBarClearance,
          gap: 14,
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
          <>
            <Text
              color="textSecondary"
              style={{ fontSize: fontSize.chip, lineHeight: fontSize.chip * lineHeight.snug }}
            >
              {providers.length}{" "}
              {providers.length === 1 ? "profissional salvo" : "profissionais salvos"} para depois
            </Text>

            <View style={{ gap: 10 }}>
              {providers.map((p) => (
                <ProviderCard
                  key={p.id}
                  provider={p}
                  favorited
                  onToggleFavorite={() => removeFavorite(p.id)}
                  onPress={() => router.push(`/provider/${p.id}`)}
                />
              ))}
            </View>

            {/* Lembrete de como a lista cresce, como no protótipo */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                padding: 14,
                borderRadius: radii.lg,
                backgroundColor: colors.primarySoft,
              }}
            >
              <Heart size={18} color={colors.primaryStrong} />
              <Text
                color="textSecondary"
                style={{
                  flex: 1,
                  fontSize: fontSize.note,
                  lineHeight: fontSize.note * 1.4,
                }}
              >
                Toque no coração em qualquer perfil para salvá-lo aqui.
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}
