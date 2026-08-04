import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Heading, Muted } from "@/components/ui/text";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";

export default function FavoritesScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <Heading>Favoritos</Heading>
        <Card>
          <CardTitle>Sem favoritos ainda</CardTitle>
          <CardDescription>
            Toque no coração no perfil de um prestador para salvá-lo aqui.
          </CardDescription>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
