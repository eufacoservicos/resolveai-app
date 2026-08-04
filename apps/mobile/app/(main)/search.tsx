import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Heading, Muted } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";

export default function SearchScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <Heading>Buscar</Heading>
        <Input placeholder="Ex: eletricista, encanador..." />
        <Card>
          <CardTitle>Filtros e resultados</CardTitle>
          <CardDescription>
            Grid de prestadores + filtros (categoria, cidade, avaliação)
            serão portados na task 9.
          </CardDescription>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
