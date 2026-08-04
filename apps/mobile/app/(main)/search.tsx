import { useState } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Heading } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import { ProviderGrid } from "@/components/providers/provider-grid";

export default function SearchScreen() {
  const [query, setQuery] = useState("");

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="px-4 py-4 gap-3">
        <Heading>Buscar</Heading>
        <Input
          placeholder="Ex: eletricista, encanador..."
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
        />
      </View>
      <View className="flex-1 px-4">
        <ProviderGrid search={query || undefined} limit={30} />
      </View>
    </SafeAreaView>
  );
}
