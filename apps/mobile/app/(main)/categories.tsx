import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Heading, Muted } from "@/components/ui/text";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";

export default function CategoriesScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <Heading>Categorias</Heading>
        <Card>
          <CardTitle>Em breve</CardTitle>
          <CardDescription>
            Grade de categorias com ícones (task 9).
          </CardDescription>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
