import { Pressable, ScrollView, View } from "react-native";
import { router } from "expo-router";
import { ArrowRight, LayoutGrid } from "lucide-react-native";
import { CATEGORY_GROUPS } from "@resolveai/shared/constants";
import { getCategoryIcon } from "@/lib/category-icons";
import { Text } from "@/components/ui/text";
import { cn } from "@resolveai/shared/cn";

// Porta do CategoryFilter do PWA. No web o estado vive na querystring
// (?categoria=); aqui e estado controlado pela tela, que refaz a query.
type Props = {
  activeSlug?: string;
  limit?: number;
  totalCount?: number;
  onChange: (slug: string | undefined) => void;
};

const ACTIVE_TILE = "border-primary/60 bg-primary/15";
const INACTIVE_TILE = "border-white/10 bg-card/60";

export function CategoryFilter({ activeSlug, limit, totalCount, onChange }: Props) {
  const displayedGroups = limit ? CATEGORY_GROUPS.slice(0, limit) : CATEGORY_GROUPS;

  const categoriesCount =
    totalCount ??
    CATEGORY_GROUPS.reduce((count, group) => count + 1 + group.subcategories.length, 0);

  const isAllActive = !activeSlug;

  function isGroupActive(groupSlug: string) {
    if (!activeSlug) return false;
    if (activeSlug === groupSlug) return true;
    const group = CATEGORY_GROUPS.find((g) => g.slug === groupSlug);
    if (!group) return false;
    return (group.subcategories as readonly string[]).includes(activeSlug);
  }

  return (
    <View>
      <View className="mb-3 flex-row items-baseline justify-between">
        <Text className="text-base font-black tracking-tight">Categorias</Text>
        <Text className="text-xs text-muted-foreground">
          {categoriesCount} disponíveis
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 10, paddingHorizontal: 16, paddingBottom: 4 }}
        className="-mx-4"
      >
        <Pressable
          onPress={() => onChange(undefined)}
          className={cn(
            "w-20 items-center gap-2 rounded-2xl border py-3.5",
            isAllActive ? ACTIVE_TILE : INACTIVE_TILE
          )}
        >
          <View
            className={cn(
              "h-10 w-10 items-center justify-center rounded-xl",
              isAllActive ? "bg-primary/25" : "bg-white/5"
            )}
          >
            <LayoutGrid size={18} color={isAllActive ? "#22d3ee" : "#8891a4"} />
          </View>
          <Text
            className={cn(
              "text-[11px] font-bold",
              isAllActive ? "text-primary" : "text-muted-foreground"
            )}
          >
            Todas
          </Text>
        </Pressable>

        {displayedGroups.map((group) => {
          const isActive = isGroupActive(group.slug);
          const Icon = getCategoryIcon(group.slug);

          return (
            <Pressable
              key={group.slug}
              onPress={() => onChange(isActive ? undefined : group.slug)}
              className={cn(
                "w-20 items-center gap-2 rounded-2xl border py-3.5",
                isActive ? ACTIVE_TILE : INACTIVE_TILE
              )}
            >
              <View
                className={cn(
                  "h-10 w-10 items-center justify-center rounded-xl",
                  isActive ? "bg-primary/25" : "bg-white/5"
                )}
              >
                <Icon size={18} color={isActive ? "#22d3ee" : "#8891a4"} />
              </View>
              <Text
                numberOfLines={2}
                className={cn(
                  "px-1 text-center text-[11px] font-bold leading-tight",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                {group.name}
              </Text>
            </Pressable>
          );
        })}

        <Pressable
          onPress={() => router.push("/categories")}
          className="w-20 items-center gap-2 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] py-3.5"
        >
          <View className="h-10 w-10 items-center justify-center rounded-xl bg-white/5">
            <ArrowRight size={18} color="#8891a4" />
          </View>
          <Text className="text-center text-[11px] font-bold text-muted-foreground">
            Ver todas
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
