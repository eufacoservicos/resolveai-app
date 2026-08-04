import { useState } from "react";
import { View, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { Link, router } from "expo-router";
import { toast } from "sonner-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Linking from "expo-linking";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heading, Muted, Text } from "@/components/ui/text";
import { supabase } from "@/lib/supabase";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!email.trim()) return toast.error("Informe seu email.");

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: Linking.createURL("/reset-password"),
    });
    setLoading(false);

    if (error) {
      toast.error("Erro ao enviar email. Tente novamente.");
      return;
    }

    toast.success("Enviamos um link de recuperação para seu email.");
    router.back();
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, padding: 24 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="mb-8 items-center">
            <Heading>Esqueci minha senha</Heading>
            <Muted className="mt-1 text-center">
              Enviaremos um link para você redefinir sua senha
            </Muted>
          </View>

          <View className="gap-4 rounded-2xl border border-border bg-background p-6">
            <View className="gap-1.5">
              <Label>Email</Label>
              <Input
                placeholder="seu@email.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            <Button onPress={handleSubmit} loading={loading}>
              Enviar link
            </Button>
          </View>

          <View className="mt-6 flex-row justify-center gap-1">
            <Link href="/(auth)/login">
              <Text className="font-medium text-primary">Voltar para login</Text>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
