import { CATEGORY_GROUPS, SERVICE_CATEGORIES } from "@eufaco/shared";
import { Text, useTheme } from "@eufaco/design-system/native";
import { useRouter } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import { Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/** Nome legível a partir do slug, usando a lista oficial de categorias. */
const NAME_BY_SLUG = new Map(SERVICE_CATEGORIES.map((c) => [c.slug, c.name]));

export default function CategoriesScreen() {
  const { colors, radii, spacing, layout } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top + spacing[2] }}>
      <Text variant="h3" style={{ textAlign: "center", paddingHorizontal: layout.screenPadding }}>
        Categorias
      </Text>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: layout.screenPadding,
          paddingTop: spacing[4],
          paddingBottom: 110,
          gap: spacing[6],
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text color="textSecondary">
          Mais de {SERVICE_CATEGORIES.length} tipos de profissionais, agrupados por área.
        </Text>

        {CATEGORY_GROUPS.map((group) => (
          <View key={group.slug} style={{ gap: spacing[3] }}>
            <Text variant="h3">{group.name}</Text>

            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing[2] }}>
              {group.subcategories.map((slug) => {
                const name = NAME_BY_SLUG.get(slug) ?? slug;
                return (
                  <Pressable
                    key={slug}
                    accessibilityRole="button"
                    accessibilityLabel={`Ver profissionais de ${name}`}
                    onPress={() => router.push(`/search?categoria=${slug}`)}
                    style={({ pressed }) => ({
                      flexDirection: "row",
                      alignItems: "center",
                      gap: spacing[1] + 2,
                      paddingVertical: 10,
                      paddingHorizontal: 14,
                      borderRadius: radii.full,
                      backgroundColor: colors.surface,
                      borderWidth: 1,
                      borderColor: colors.border,
                      opacity: pressed ? 0.85 : 1,
                    })}
                  >
                    <Text variant="label" color="textPrimary">
                      {name}
                    </Text>
                    <ChevronRight size={13} color={colors.textMuted} />
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
