import { useState } from "react";
import { View, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { Link } from "expo-router";
import { toast } from "sonner-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heading, Muted, Text } from "@/components/ui/text";
import { supabase } from "@/lib/supabase";
import { signInWithOAuth } from "@/lib/oauth";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleSubmit() {
    if (!email.trim()) {
      toast.error("Informe seu email.");
      return;
    }
    if (!password) {
      toast.error("Informe sua senha.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);

    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes("email not confirmed")) {
        toast.error("Email não confirmado. Verifique sua caixa de entrada.");
      } else if (msg.includes("invalid login credentials")) {
        toast.error("Email ou senha incorretos.");
      } else {
        toast.error("Erro ao entrar. Verifique suas credenciais.");
      }
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    try {
      await signInWithOAuth("google");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao entrar com Google";
      if (msg !== "OAuth flow cancelled") toast.error(msg);
    } finally {
      setGoogleLoading(false);
    }
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
            <Heading>Bem-vindo de volta</Heading>
            <Muted className="mt-1">Entre para continuar no eufaço!</Muted>
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

            <View className="gap-1.5">
              <Label>Senha</Label>
              <Input
                placeholder="Sua senha"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="password"
              />
              <Link
                href="/(auth)/forgot-password"
                className="self-end text-xs font-medium text-primary"
              >
                <Text className="text-xs font-medium text-primary">
                  Esqueci minha senha
                </Text>
              </Link>
            </View>

            <Button onPress={handleSubmit} loading={loading}>
              Entrar
            </Button>

            <View className="my-2 flex-row items-center gap-3">
              <View className="h-px flex-1 bg-border" />
              <Muted className="text-xs">ou</Muted>
              <View className="h-px flex-1 bg-border" />
            </View>

            <Button variant="outline" onPress={handleGoogle} loading={googleLoading}>
              Continuar com Google
            </Button>
          </View>

          <View className="mt-6 flex-row justify-center gap-1">
            <Muted>Não tem conta?</Muted>
            <Link href="/(auth)/register">
              <Text className="font-medium text-primary">Cadastre-se</Text>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
