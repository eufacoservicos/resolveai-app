import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Heading, Muted } from "@/components/ui/text";
import { ProviderGrid } from "@/components/providers/provider-grid";

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="px-4 py-4">
        <Heading>Início</Heading>
        <Muted className="mt-1">
          Prestadores em destaque na sua região
        </Muted>
      </View>
      <View className="flex-1 px-4">
        <ProviderGrid limit={30} />
      </View>
    </SafeAreaView>
  );
}
