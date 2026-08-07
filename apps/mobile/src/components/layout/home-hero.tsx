import { useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import { router } from "expo-router";
import { Search } from "lucide-react-native";
import { Display, Muted, Text } from "@/components/ui/text";

// Header hero da home: título display + campo de busca destacado.
export function HomeHero({ locationLabel }: { locationLabel?: string }) {
  const [searchTerm, setSearchTerm] = useState("");

  function handleSearch() {
    const term = searchTerm.trim();
    if (term) {
      router.push(`/search?q=${encodeURIComponent(term)}`);
    } else {
      router.push("/search");
    }
  }

  return (
    <View className="gap-5">
      <View>
        <Display className="text-[34px] leading-[36px]">
          Encontre o{"\n"}
          profissional{" "}
          <Text className="text-[34px] font-black text-primary">ideal.</Text>
        </Display>
        {locationLabel ? (
          <Muted className="mt-3 text-base">
            Profissionais verificados em{" "}
            <Text className="text-base font-semibold text-foreground">
              {locationLabel}
            </Text>
          </Muted>
        ) : (
          <Muted className="mt-3 text-base">
            Profissionais verificados na sua região.
          </Muted>
        )}
      </View>

      <Pressable
        onPress={handleSearch}
        className="flex-row items-center gap-3 rounded-2xl border border-white/10 bg-card/60 px-4 py-3.5 active:bg-card"
      >
        <View className="h-9 w-9 items-center justify-center rounded-xl bg-primary/15">
          <Search size={18} color="#22d3ee" />
        </View>
        <TextInput
          placeholder="Ex: eletricista, pintor, diarista..."
          placeholderTextColor="#5c6478"
          selectionColor="#22d3ee"
          value={searchTerm}
          onChangeText={setSearchTerm}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          className="min-w-0 flex-1 text-base text-foreground"
        />
      </Pressable>
    </View>
  );
}
