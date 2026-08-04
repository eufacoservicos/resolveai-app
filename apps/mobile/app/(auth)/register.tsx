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

export default function RegisterScreen() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!fullName.trim()) return toast.error("Informe seu nome.");
    if (!email.trim()) return toast.error("Informe seu email.");
    if (password.length < 6)
      return toast.error("Senha precisa ter pelo menos 6 caracteres.");

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          role: "CLIENT",
        },
      },
    });
    setLoading(false);

    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes("already registered")) {
        toast.error("Este email já está cadastrado.");
      } else {
        toast.error("Erro ao criar conta. Tente novamente.");
      }
      return;
    }

    toast.success(
      "Conta criada! Verifique seu email para confirmar o cadastro."
    );
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
            <Heading>Criar conta</Heading>
            <Muted className="mt-1">
              Comece a encontrar prestadores na sua cidade
            </Muted>
          </View>

          <View className="gap-4 rounded-2xl border border-border bg-background p-6">
            <View className="gap-1.5">
              <Label>Nome completo</Label>
              <Input
                placeholder="Seu nome"
                value={fullName}
                onChangeText={setFullName}
                autoComplete="name"
                autoCapitalize="words"
              />
            </View>

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
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="new-password"
              />
            </View>

            <Button onPress={handleSubmit} loading={loading}>
              Criar conta
            </Button>
          </View>

          <View className="mt-6 flex-row justify-center gap-1">
            <Muted>Já tem conta?</Muted>
            <Link href="/(auth)/login">
              <Text className="font-medium text-primary">Entrar</Text>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
