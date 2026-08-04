import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Heading, Muted } from "@/components/ui/text";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";

export default function ProviderEditScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <Heading>Editar meu perfil</Heading>
        <Muted>Apenas prestadores</Muted>
        <Card>
          <CardTitle>Formulário do prestador</CardTitle>
          <CardDescription>
            Editar categorias, descrição, WhatsApp, horário (task 9).
          </CardDescription>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
