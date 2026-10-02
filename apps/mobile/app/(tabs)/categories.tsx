import { CATEGORY_GROUPS, SERVICE_CATEGORIES } from "@eufaco/shared";
import {
  Text,
  fontSize,
  letterSpacing,
  lineHeight,
  nativeFonts,
  useShadow,
  useTheme,
} from "@eufaco/design-system/native";
import { useRouter } from "expo-router";
import { ChevronRight, Search } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, TextInput, View } from "react-native";
import { AppBar } from "@/components/AppBar";
import { CategoryTile } from "@/components/CategoryTile";
import { useTabBarClearance } from "@/components/TabBar";

/** Nome legível a partir do slug, usando a lista oficial de categorias. */
const NAME_BY_SLUG = new Map(SERVICE_CATEGORIES.map((c) => [c.slug, c.name]));

/** Quantos ladrilhos o protótipo mostra por grupo antes do "Ver todos". */
const TILES_PER_ROW = 3;

/** Sem acento e em minúsculas, para a busca casar "estetica" com "Estética". */
function fold(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

/** Quebra a lista em linhas de três, como a grade do Pen. */
function inRows<T>(items: T[]): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += TILES_PER_ROW) {
    rows.push(items.slice(i, i + TILES_PER_ROW));
  }
  return rows;
}

export default function CategoriesScreen() {
  const { colors, radii, spacing, layout } = useTheme();
  const router = useRouter();
  const searchShadow = useShadow("card");
  const tabBarClearance = useTabBarClearance();

  const [term, setTerm] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const query = fold(term.trim());

  const groups = useMemo(
    () =>
      CATEGORY_GROUPS.map((group) => {
        const items = group.subcategories
          .map((slug) => ({ slug, name: NAME_BY_SLUG.get(slug) ?? slug }))
          .filter((item) => !query || fold(item.name).includes(query));
        return { ...group, items };
      }).filter((group) => group.items.length > 0),
    [query],
  );

  const toggle = (slug: string) =>
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <AppBar title="Categorias" showBack={false} />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: layout.screenPadding,
          paddingTop: 18,
          paddingBottom: tabBarClearance,
          gap: 22,
        }}
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            {
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              height: 52,
              paddingHorizontal: spacing[4],
              borderRadius: radii.full,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
            },
            searchShadow,
          ]}
        >
          <Search size={19} color={colors.textMuted} />
          <TextInput
            value={term}
            onChangeText={setTerm}
            placeholder="Buscar categoria..."
            placeholderTextColor={colors.textMuted}
            autoCorrect={false}
            accessibilityLabel="Buscar categoria"
            style={{
              flex: 1,
              color: colors.textPrimary,
              fontFamily: term ? nativeFonts.bodySemiBold : nativeFonts.bodyRegular,
              fontSize: fontSize.field,
            }}
          />
        </View>

        {groups.map((group) => {
          // Buscando, o grupo já vem filtrado e mostra tudo que casou
          const showAll = query.length > 0 || expanded.has(group.slug);
          const visible = showAll ? group.items : group.items.slice(0, TILES_PER_ROW);
          const hasMore = group.items.length > TILES_PER_ROW;

          return (
            <View key={group.slug} style={{ gap: 10 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
                }}
              >
                <Text
                  variant="title"
                  numberOfLines={1}
                  style={{ flexShrink: 1, letterSpacing: letterSpacing.snug }}
                >
                  {group.name}
                </Text>

                {hasMore && query.length === 0 ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`${expanded.has(group.slug) ? "Ver menos" : "Ver todos"} em ${group.name}`}
                    onPress={() => toggle(group.slug)}
                    hitSlop={8}
                    style={({ pressed }) => ({
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 2,
                      opacity: pressed ? 0.7 : 1,
                    })}
                  >
                    <Text variant="label" color="primaryStrong">
                      {expanded.has(group.slug) ? "Ver menos" : "Ver todos"}
                    </Text>
                    <ChevronRight size={14} color={colors.primaryStrong} />
                  </Pressable>
                ) : null}
              </View>

              {inRows(visible).map((row, index) => (
                <View key={index} style={{ flexDirection: "row", gap: 10 }}>
                  {row.map((item) => (
                    <CategoryTile
                      key={item.slug}
                      slug={item.slug}
                      name={item.name}
                      onPress={() => router.push(`/search?categoria=${item.slug}`)}
                    />
                  ))}
                  {/* Mantém a última linha alinhada com as de cima */}
                  {row.length < TILES_PER_ROW
                    ? Array.from({ length: TILES_PER_ROW - row.length }, (_, i) => (
                        <View key={`fill-${i}`} style={{ flex: 1 }} />
                      ))
                    : null}
                </View>
              ))}
            </View>
          );
        })}

        {groups.length === 0 ? (
          <Text
            color="textSecondary"
            style={{ textAlign: "center", lineHeight: fontSize.base * lineHeight.normal }}
          >
            Nenhuma categoria com esse nome.
          </Text>
        ) : null}
      </ScrollView>
    </View>
  );
}
