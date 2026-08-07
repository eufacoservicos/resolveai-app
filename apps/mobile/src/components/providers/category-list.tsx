import { useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import { router } from "expo-router";
import { Search } from "lucide-react-native";
import { CATEGORY_GROUPS } from "@resolveai/shared/constants";
import { getCategoryIcon } from "@/lib/category-icons";
import { Text, Muted } from "@/components/ui/text";

// Porta do CategoryList do PWA: busca + categorias agrupadas em grid de 3.
type Category = { id: string; name: string; slug: string };

export function CategoryList({ categories }: { categories: Category[] }) {
  const [search, setSearch] = useState("");

  const filtered = search
    ? categories.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase())
      )
    : categories;

  const groupedCategories = CATEGORY_GROUPS.map((group) => ({
    ...group,
    items: filtered.filter((c) =>
      (group.subcategories as readonly string[]).includes(c.slug)
    ),
  })).filter((g) => g.items.length > 0);

  const allGroupedSlugs: string[] = CATEGORY_GROUPS.flatMap((g) => [
    ...g.subcategories,
  ]);
  const ungrouped = filtered.filter((c) => !allGroupedSlugs.includes(c.slug));

  const totalFiltered = filtered.length;
  const plural = totalFiltered !== 1;

  return (
    <View className="gap-4">
      <View className="h-12 flex-row items-center rounded-2xl border border-white/10 bg-card/60 px-4">
        <Search size={16} color="#22d3ee" />
        <TextInput
          placeholder="Buscar categoria..."
          placeholderTextColor="#5c6478"
          selectionColor="#22d3ee"
          value={search}
          onChangeText={setSearch}
          className="ml-2 min-w-0 flex-1 text-sm text-foreground"
        />
      </View>

      <Muted>
        {totalFiltered} categoria{plural ? "s" : ""}{" "}
        {search
          ? `encontrada${plural ? "s" : ""}`
          : `disponíve${plural ? "is" : "l"}`}
      </Muted>

      {totalFiltered === 0 ? (
        <View className="items-center py-16">
          <View className="mb-4 h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-card/60">
            <Search size={28} color="#8891a4" />
          </View>
          <Text className="text-center text-lg font-bold">
            Nenhuma categoria encontrada
          </Text>
          <Muted className="mt-1.5 text-center">
            Tente buscar com outro termo
          </Muted>
        </View>
      ) : (
        <View className="gap-7">
          {groupedCategories.map((group) => {
            const GroupIcon = getCategoryIcon(group.slug);
            return (
              <View key={group.slug}>
                <View className="mb-3 flex-row items-center gap-2.5">
                  <View className="h-9 w-9 items-center justify-center rounded-xl border border-primary/25 bg-primary/10">
                    <GroupIcon size={16} color="#22d3ee" />
                  </View>
                  <Text className="text-base font-bold">{group.name}</Text>
                </View>
                <CategoryGrid items={group.items} />
              </View>
            );
          })}

          {ungrouped.length > 0 && (
            <View>
              <Text className="mb-3 text-base font-bold">Outros</Text>
              <CategoryGrid items={ungrouped} />
            </View>
          )}
        </View>
      )}
    </View>
  );
}

function CategoryGrid({ items }: { items: Category[] }) {
  return (
    <View className="flex-row flex-wrap" style={{ gap: 10 }}>
      {items.map((cat) => {
        const Icon = getCategoryIcon(cat.slug);
        return (
          <Pressable
            key={cat.id}
            onPress={() => router.push(`/search?categoria=${cat.slug}`)}
            style={{ width: "31.5%" }}
            className="aspect-square items-center justify-center gap-2 rounded-2xl border border-white/10 bg-card/60 p-3 active:bg-primary/10 active:border-primary/40"
          >
            <View className="h-11 w-11 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
              <Icon size={20} color="#22d3ee" />
            </View>
            <Text className="text-center text-[11px] font-semibold leading-tight text-foreground">
              {cat.name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
