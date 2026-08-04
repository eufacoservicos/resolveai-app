import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Heading, Muted } from "@/components/ui/text";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function BecomeProviderScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <Heading>Quero oferecer serviços</Heading>
        <Muted>
          Comece a receber contatos de clientes na sua região via WhatsApp.
        </Muted>
        <Card>
          <CardTitle>Formulário de cadastro</CardTitle>
          <CardDescription>
            CPF/CNPJ + categorias + horário de funcionamento (task 9).
          </CardDescription>
          <Button className="mt-4" disabled>
            Preencher perfil
          </Button>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
