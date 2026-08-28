import { Text, useTheme } from "@eufaco/design-system/native";
import { ArrowRight, Bell, ChevronDown, ChevronRight, MapPin, Search, Wrench } from "lucide-react-native";
import { Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ProviderCard } from "@/components/ProviderCard";
import { categories, nearbyProviders } from "@/data/mock";

export default function HomeScreen() {
  const { colors, radii, spacing, layout } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ paddingBottom: 110 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Painel de cabeçalho: destaca a busca do resto do conteúdo */}
      <View
        style={{
          backgroundColor: colors.surface,
          borderBottomLeftRadius: radii.xl,
          borderBottomRightRadius: radii.xl,
          paddingTop: insets.top + spacing[2],
          paddingHorizontal: layout.screenPadding,
          paddingBottom: spacing[5],
          gap: spacing[4],
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Mudar localização"
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: spacing[1] + 1,
              backgroundColor: colors.surface2,
              borderRadius: radii.full,
              paddingVertical: 7,
              paddingLeft: 9,
              paddingRight: 11,
            }}
          >
            <MapPin size={14} color={colors.primaryStrong} />
            <Text variant="label">Savassi, Belo Horizonte</Text>
            <ChevronDown size={13} color={colors.textMuted} />
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Avisos"
            style={{
              width: 38,
              height: 38,
              borderRadius: radii.full,
              backgroundColor: colors.surface2,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Bell size={18} color={colors.textPrimary} />
          </Pressable>
        </View>

        <View style={{ gap: 2 }}>
          <Text variant="label" color="textSecondary">
            Olá, Luiz
          </Text>
          <Text variant="h1">Encontre o profissional ideal</Text>
        </View>

        <Pressable
          accessibilityRole="search"
          accessibilityLabel="Buscar profissionais"
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
          <Text color="textMuted">Eletricista, pintor, diarista...</Text>
        </Pressable>
      </View>

      <View style={{ paddingTop: spacing[6], gap: spacing[6] }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: layout.screenPadding, gap: spacing[2] }}
        >
          {categories.map((cat, i) => {
            const active = i === 0;
            return (
              <Pressable
                key={cat.slug}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                style={{
                  paddingVertical: 9,
                  paddingHorizontal: 14,
                  borderRadius: radii.full,
                  backgroundColor: active ? colors.primary : colors.surface,
                  borderWidth: 1,
                  borderColor: active ? colors.primary : colors.border,
                }}
              >
                <Text variant="label" color={active ? "onPrimary" : "textSecondary"}>
                  {cat.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={{ paddingHorizontal: layout.screenPadding, gap: spacing[3] }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text variant="h3">Perto de você</Text>
            <Pressable
              accessibilityRole="button"
              style={{ flexDirection: "row", alignItems: "center", gap: 2 }}
            >
              <Text variant="label" color="primaryStrong">
                Ver todos
              </Text>
              <ChevronRight size={14} color={colors.primaryStrong} />
            </Pressable>
          </View>

          <View style={{ gap: spacing[3] - 2 }}>
            {nearbyProviders.map((p) => (
              <ProviderCard key={p.id} provider={p} />
            ))}
          </View>
        </View>

        <View style={{ paddingHorizontal: layout.screenPadding }}>
          <Pressable
            accessibilityRole="button"
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: spacing[3],
              padding: spacing[3] + 2,
              borderRadius: radii.lg,
              backgroundColor: colors.primarySoft,
            }}
          >
            <View
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                backgroundColor: colors.surface,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Wrench size={20} color={colors.primaryStrong} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text variant="bodyStrong">Quer oferecer seus serviços?</Text>
              <Text variant="caption" color="textSecondary">
                Cadastre-se grátis e receba clientes
              </Text>
            </View>
            <ArrowRight size={18} color={colors.primaryStrong} />
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
