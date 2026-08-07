import { useState } from "react";
import { Pressable, ScrollView, TextInput, View } from "react-native";
import { Check, ChevronDown, Plus, Search, X } from "lucide-react-native";
import {
  containsProfanity,
  PROFANITY_ERROR_MESSAGE,
} from "@resolveai/shared/profanity";
import { Sheet } from "@/components/ui/sheet";
import { Text, Muted } from "@/components/ui/text";
import { cn } from "@resolveai/shared/cn";

// Porta do CategoryMultiSelect do PWA. O dropdown absoluto do web vira um
// bottom sheet — na tela pequena um popover ancorado brigaria com o teclado.
export type Category = { id: string; name: string; slug: string };

type Props = {
  categories: Category[];
  selected: string[];
  onChange: (selected: string[]) => void;
  onAddCustom?: (name: string) => Promise<Category | null>;
  placeholder?: string;
};

export function CategoryMultiSelect({
  categories,
  selected,
  onChange,
  onAddCustom,
  placeholder = "Buscar categorias...",
}: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [addingCustom, setAddingCustom] = useState(false);
  const [profanityError, setProfanityError] = useState<string | null>(null);

  const filtered = search
    ? categories.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase())
      )
    : categories;

  const selectedCats = categories.filter((c) => selected.includes(c.id));

  function toggle(id: string) {
    onChange(
      selected.includes(id)
        ? selected.filter((s) => s !== id)
        : [...selected, id]
    );
  }

  async function handleAddCustom() {
    if (!onAddCustom || search.trim().length < 2) return;

    if (containsProfanity(search.trim())) {
      setProfanityError(PROFANITY_ERROR_MESSAGE);
      return;
    }
    setProfanityError(null);

    setAddingCustom(true);
    const newCat = await onAddCustom(search.trim());
    if (newCat) {
      toggle(newCat.id);
      setSearch("");
    }
    setAddingCustom(false);
  }

  return (
    <View>
      <Pressable
        onPress={() => setOpen(true)}
        className={cn(
          "flex-row items-center justify-between rounded-lg border bg-card px-3 py-2.5",
          open ? "border-primary" : "border-border"
        )}
      >
        <Muted>
          {selected.length === 0
            ? "Selecionar categorias"
            : `${selected.length} selecionada${selected.length > 1 ? "s" : ""}`}
        </Muted>
        <ChevronDown size={16} color="#8891a4" />
      </Pressable>

      {selectedCats.length > 0 && (
        <View className="mt-2 flex-row flex-wrap gap-1.5">
          {selectedCats.map((cat) => (
            <View
              key={cat.id}
              className="flex-row items-center gap-1 rounded-md border border-primary/30 bg-primary/5 px-2 py-1"
            >
              <Text className="text-xs font-medium text-primary">
                {cat.name}
              </Text>
              <Pressable
                onPress={() => onChange(selected.filter((s) => s !== cat.id))}
                hitSlop={6}
                accessibilityRole="button"
                accessibilityLabel={`Remover ${cat.name}`}
              >
                <X size={12} color="#22d3ee" />
              </Pressable>
            </View>
          ))}
        </View>
      )}

      <Sheet open={open} onOpenChange={setOpen} title="Categorias">
        <View className="gap-2">
          <View className="h-10 flex-row items-center rounded-md border border-border bg-muted/50 px-3">
            <Search size={16} color="#8891a4" />
            <TextInput
              value={search}
              onChangeText={(text) => {
                setSearch(text);
                setProfanityError(null);
              }}
              placeholder={placeholder}
              placeholderTextColor="#8891a4"
              className="ml-2 min-w-0 flex-1 text-sm text-foreground"
            />
          </View>

          {profanityError && (
            <View className="rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2">
              <Text className="text-xs font-semibold text-destructive">
                {profanityError}
              </Text>
            </View>
          )}

          <ScrollView className="max-h-72" keyboardShouldPersistTaps="handled">
            {filtered.length === 0 ? (
              onAddCustom && search.trim().length >= 2 ? (
                <Pressable
                  onPress={handleAddCustom}
                  disabled={addingCustom}
                  className="flex-row items-center gap-2 rounded-md px-3 py-2.5 active:bg-primary/5"
                >
                  <Plus size={16} color="#22d3ee" />
                  <Text className="text-sm text-primary">
                    {addingCustom
                      ? "Adicionando..."
                      : `Adicionar "${search.trim()}"`}
                  </Text>
                </Pressable>
              ) : (
                <Muted className="px-3 py-4 text-center">
                  Nenhuma categoria encontrada
                </Muted>
              )
            ) : (
              filtered.map((cat) => {
                const isSelected = selected.includes(cat.id);
                return (
                  <Pressable
                    key={cat.id}
                    onPress={() => toggle(cat.id)}
                    className={cn(
                      "flex-row items-center gap-2 rounded-md px-3 py-2",
                      isSelected ? "bg-primary/5" : "active:bg-muted"
                    )}
                  >
                    <View
                      className={cn(
                        "h-4 w-4 items-center justify-center rounded border",
                        isSelected ? "border-primary bg-primary" : "border-border"
                      )}
                    >
                      {isSelected && <Check size={12} color="#ffffff" />}
                    </View>
                    <Text
                      className={cn(
                        "text-sm",
                        isSelected && "font-medium text-primary"
                      )}
                    >
                      {cat.name}
                    </Text>
                  </Pressable>
                );
              })
            )}
          </ScrollView>
        </View>
      </Sheet>
    </View>
  );
}
