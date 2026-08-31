import { CATEGORY_GROUPS, getCategories, type Category } from "@eufaco/shared";
import { Button, Text, useTheme } from "@eufaco/design-system/native";
import { Check, X } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, Modal, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase";

const MAX_CATEGORIES = 5;

interface Props {
  visible: boolean;
  /** Ids já escolhidos. */
  selected: string[];
  onClose: () => void;
  onApply: (ids: string[], names: Category[]) => void;
}

export function CategoryPicker({ visible, selected, onClose, onApply }: Props) {
  const { colors, radii, spacing, layout } = useTheme();
  const insets = useSafeAreaInsets();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<string[]>(selected);

  useEffect(() => {
    let active = true;
    getCategories(supabase)
      .then((result) => {
        if (active) setCategories(result as Category[]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const bySlug = new Map(categories.map((c) => [c.slug, c]));
  const atLimit = draft.length >= MAX_CATEGORIES;

  const toggle = (id: string) => {
    setDraft((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < MAX_CATEGORIES ? [...prev, id] : prev,
    );
  };

  return (
    <Modal visible={visible} animationType="slide" onShow={() => setDraft(selected)} onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: spacing[3],
            height: 56,
            paddingHorizontal: layout.screenPadding,
          }}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Fechar"
            onPress={onClose}
            style={{
              width: 38,
              height: 38,
              borderRadius: radii.full,
              backgroundColor: colors.surface2,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={19} color={colors.textPrimary} />
          </Pressable>
          <Text variant="h3" style={{ flex: 1, textAlign: "center" }}>
            Categorias
          </Text>
          <View style={{ width: 38 }} />
        </View>

        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: layout.screenPadding,
            paddingTop: spacing[2],
            paddingBottom: spacing[6],
            gap: spacing[5],
          }}
          showsVerticalScrollIndicator={false}
        >
          <Text color="textSecondary">
            Escolha até {MAX_CATEGORIES} serviços que você oferece. Eles definem em quais buscas você aparece.
          </Text>

          {loading ? (
            <View style={{ paddingVertical: spacing[10], alignItems: "center" }}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : (
            CATEGORY_GROUPS.map((group) => {
              const items = group.subcategories
                .map((slug) => bySlug.get(slug))
                .filter((c): c is Category => Boolean(c));

              if (items.length === 0) return null;

              return (
                <View key={group.slug} style={{ gap: spacing[3] }}>
                  <Text variant="h3">{group.name}</Text>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing[2] }}>
                    {items.map((category) => {
                      const isSelected = draft.includes(category.id);
                      const disabled = !isSelected && atLimit;

                      return (
                        <Pressable
                          key={category.id}
                          accessibilityRole="checkbox"
                          accessibilityState={{ checked: isSelected, disabled }}
                          accessibilityLabel={category.name}
                          disabled={disabled}
                          onPress={() => toggle(category.id)}
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: spacing[1] + 2,
                            paddingVertical: 10,
                            paddingHorizontal: 14,
                            borderRadius: radii.full,
                            backgroundColor: isSelected ? colors.primary : colors.surface,
                            borderWidth: 1,
                            borderColor: isSelected ? colors.primary : colors.border,
                            opacity: disabled ? 0.4 : 1,
                          }}
                        >
                          {isSelected ? <Check size={13} color={colors.onPrimary} /> : null}
                          <Text variant="label" color={isSelected ? "onPrimary" : "textSecondary"}>
                            {category.name}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>

        <View
          style={{
            gap: spacing[2],
            paddingHorizontal: layout.screenPadding,
            paddingTop: spacing[3],
            paddingBottom: Math.max(insets.bottom, spacing[4]),
            backgroundColor: colors.surface,
            borderTopWidth: 1,
            borderTopColor: colors.border,
          }}
        >
          <Text variant="caption" color="textMuted" style={{ textAlign: "center" }}>
            {draft.length} de {MAX_CATEGORIES} escolhidas
          </Text>
          <Button
            label="Confirmar"
            disabled={draft.length === 0}
            onPress={() =>
              onApply(
                draft,
                categories.filter((c) => draft.includes(c.id)),
              )
            }
          />
        </View>
      </View>
    </Modal>
  );
}
