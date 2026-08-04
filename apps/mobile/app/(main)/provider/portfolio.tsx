import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Heading, Muted } from "@/components/ui/text";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";

export default function ProviderPortfolioScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <Heading>Portfólio</Heading>
        <Muted>Gerencie as fotos dos seus trabalhos</Muted>
        <Card>
          <CardTitle>Upload de fotos</CardTitle>
          <CardDescription>
            Portfolio manager com expo-image-picker (task 13).
          </CardDescription>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
