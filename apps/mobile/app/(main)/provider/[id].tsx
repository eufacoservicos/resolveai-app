import { ScrollView, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Heading, Muted } from "@/components/ui/text";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";

export default function ProviderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <Heading>Prestador</Heading>
        <Muted>ID: {id}</Muted>
        <Card>
          <CardTitle>Perfil, portfolio, avaliações</CardTitle>
          <CardDescription>
            Detalhe do prestador (foto, categorias, horário, WhatsApp CTA,
            reviews) será portado na task 9.
          </CardDescription>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
