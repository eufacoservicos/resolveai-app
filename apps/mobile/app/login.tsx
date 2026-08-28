import { Button, Text, useTheme } from "@eufaco/design-system/native";
import { useRouter } from "expo-router";
import { Lock, Mail } from "lucide-react-native";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from "react-native";
import { AppBar } from "@/components/AppBar";
import { Field } from "@/components/Field";
import { supabase } from "@/lib/supabase";

/** Traduz os erros do Supabase para algo que diga o que fazer. */
function messageFor(error: string): string {
  if (error.includes("Invalid login credentials")) return "E-mail ou senha incorretos.";
  if (error.includes("Email not confirmed")) {
    return "Confirme seu e-mail antes de entrar. Procure a mensagem na sua caixa de entrada.";
  }
  return "Não foi possível entrar. Verifique sua conexão e tente de novo.";
}

export default function LoginScreen() {
  const { colors, spacing, layout } = useTheme();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email.trim()) return setError("Informe seu e-mail.");
    if (!password) return setError("Informe sua senha.");

    setLoading(true);
    setError(null);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (authError) {
      setError(messageFor(authError.message));
      return;
    }
    router.replace("/");
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <AppBar />
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: spacing[6],
          paddingTop: spacing[4],
          paddingBottom: spacing[8],
          gap: spacing[6],
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ gap: spacing[2] }}>
          <View style={{ flexDirection: "row" }}>
            <Text variant="h1">eufaço</Text>
            <Text variant="h1" color="primary">
              !
            </Text>
          </View>
          <Text variant="h1">Bem-vindo de volta</Text>
          <Text color="textSecondary">
            Entre para salvar favoritos e avaliar quem te atendeu.
          </Text>
        </View>

        <View style={{ gap: spacing[4] }}>
          <Field
            label="E-mail"
            icon={Mail}
            value={email}
            onChangeText={setEmail}
            placeholder="seu@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            error={error}
          />
          <Field
            label="Senha"
            icon={Lock}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            autoComplete="current-password"
            password
          />
        </View>

        <Button label="Entrar" loading={loading} onPress={() => void submit()} />

        <View style={{ flexDirection: "row", justifyContent: "center", gap: spacing[1] + 1 }}>
          <Text color="textSecondary">Não tem uma conta?</Text>
          <Pressable accessibilityRole="button" onPress={() => router.replace("/register")} hitSlop={6}>
            <Text variant="bodyStrong" color="primaryStrong">
              Cadastre-se
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
