import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "sonner-native";
import { Heading, Muted, Text } from "@/components/ui/text";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth-provider";

export default function ProfileScreen() {
  const { user, signOut } = useAuth();

  async function handleSignOut() {
    await signOut();
    toast.success("Você saiu da conta.");
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <View className="flex-row items-center gap-4">
          <Avatar
            fallback={user?.user_metadata?.full_name ?? user?.email ?? "?"}
            size={64}
          />
          <View className="flex-1">
            <Text className="text-lg font-semibold">
              {user?.user_metadata?.full_name ?? "Sem nome"}
            </Text>
            <Muted className="text-sm">{user?.email}</Muted>
          </View>
        </View>

        <Card>
          <CardTitle>Perfil</CardTitle>
          <CardDescription>
            Editar dados, gerenciar prestador e exclusão de conta serão
            portados na task 9.
          </CardDescription>
        </Card>

        <Button variant="outline" onPress={handleSignOut}>
          Sair
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}
