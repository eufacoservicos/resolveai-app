import { Card, Text, useTheme } from "@eufaco/design-system/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Search, X } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ProviderCard } from "@/components/ProviderCard";
import { useFavorites } from "@/hooks/useFavorites";
import { useProviders } from "@/hooks/useProviders";

export default function SearchScreen() {
  const { colors, radii, spacing, layout } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { favoriteIds, toggle } = useFavorites();
  const params = useLocalSearchParams<{ categoria?: string }>();

  const [term, setTerm] = useState("");
  const [debounced, setDebounced] = useState("");

  // Espera a digitação parar antes de consultar o banco
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(term.trim()), 350);
    return () => clearTimeout(timer);
  }, [term]);

  const { providers, total, loading, error, refresh } = useProviders({
    search: debounced || undefined,
    categorySlug: params.categoria,
    orderBy: "rating",
    page: 1,
    pageSize: 20,
  });

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top + spacing[2] }}>
      <View style={{ paddingHorizontal: layout.screenPadding, gap: spacing[4] }}>
        <Text variant="h3" style={{ textAlign: "center" }}>
          Buscar
        </Text>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: spacing[2] + 2,
            height: 52,
            paddingHorizontal: spacing[4],
            borderRadius: radii.full,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Search size={19} color={colors.textMuted} />
          <TextInput
            value={term}
            onChangeText={setTerm}
            placeholder="Eletricista, pintor, diarista..."
            placeholderTextColor={colors.textMuted}
            autoCorrect={false}
            returnKeyType="search"
            accessibilityLabel="Buscar profissionais"
            style={{ flex: 1, color: colors.textPrimary, fontSize: 14.5 }}
          />
          {term.length > 0 ? (
            <Pressable accessibilityRole="button" accessibilityLabel="Limpar busca" onPress={() => setTerm("")} hitSlop={8}>
              <X size={17} color={colors.textMuted} />
            </Pressable>
          ) : null}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: layout.screenPadding,
          paddingTop: spacing[4],
          paddingBottom: 110,
          gap: spacing[3],
        }}
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={{ paddingVertical: spacing[10], alignItems: "center" }}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : error ? (
          <Card style={{ alignItems: "center", paddingVertical: spacing[6], gap: spacing[2] }}>
            <Text variant="bodyStrong" style={{ textAlign: "center" }}>
              {error}
            </Text>
            <Pressable accessibilityRole="button" onPress={refresh} hitSlop={8}>
              <Text variant="label" color="primaryStrong">
                Tentar de novo
              </Text>
            </Pressable>
          </Card>
        ) : providers.length === 0 ? (
          <Card style={{ alignItems: "center", paddingVertical: spacing[8], gap: spacing[2] }}>
            <Text variant="title">Nenhum profissional encontrado</Text>
            <Text color="textSecondary" style={{ textAlign: "center" }}>
              {debounced
                ? `Não achamos ninguém para “${debounced}”. Tente outra palavra ou navegue pelas categorias.`
                : "Comece digitando o serviço que você precisa."}
            </Text>
          </Card>
        ) : (
          <>
            <Text variant="label" color="textSecondary">
              {total} {total === 1 ? "profissional" : "profissionais"}
            </Text>
            {providers.map((p) => (
              <ProviderCard
                key={p.id}
                provider={p}
                favorited={favoriteIds.has(p.id)}
                onToggleFavorite={() => void toggle(p.id)}
                onPress={() => router.push(`/provider/${p.id}`)}
              />
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}
