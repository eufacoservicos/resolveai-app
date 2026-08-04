import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Heading, Muted } from "@/components/ui/text";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <View className="mb-2">
          <Heading>Início</Heading>
          <Muted className="mt-1">
            Encontre prestadores perto de você
          </Muted>
        </View>
        <Card>
          <CardTitle>Em construção</CardTitle>
          <CardDescription>
            Feed de prestadores em destaque será portado na task 9.
          </CardDescription>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
