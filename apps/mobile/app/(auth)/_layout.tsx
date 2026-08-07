import { Redirect, Stack } from "expo-router";
import {
  View,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/lib/auth-provider";

export default function AuthLayout() {
  const { loading, session } = useAuth();

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#22d3ee" />
      </View>
    );
  }

  if (session) {
    return <Redirect href="/(main)/home" />;
  }

  // Espelha o layout (auth) do PWA: logo centralizado acima do conteudo, com o
  // card limitado a max-w-md. O KeyboardAvoidingView e a adaptacao nativa.
  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "#08090c" },
          }}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
