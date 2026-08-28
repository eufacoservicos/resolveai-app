import { Button, Card, Text, useTheme } from "@eufaco/design-system/native";
import { useRouter } from "expo-router";
import { CircleCheck, Lock, Mail, UserRound } from "lucide-react-native";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from "react-native";
import { AppBar } from "@/components/AppBar";
import { Field } from "@/components/Field";
import { supabase } from "@/lib/supabase";

export default function RegisterScreen() {
  const { colors, spacing } = useTheme();
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async () => {
    if (fullName.trim().length < 3) return setError("Informe seu nome completo.");
    if (!email.trim()) return setError("Informe seu e-mail.");
    if (password.length < 6) return setError("A senha precisa ter ao menos 6 caracteres.");

    setLoading(true);
    setError(null);

    const { error: authError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { full_name: fullName.trim() } },
    });

    setLoading(false);

    if (authError) {
      setError(
        authError.message.includes("already registered")
          ? "Este e-mail já tem conta. Tente entrar."
          : "Não foi possível criar sua conta. Tente de novo em instantes.",
      );
      return;
    }
    setSent(true);
  };

  if (sent) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <AppBar />
        <View style={{ flex: 1, justifyContent: "center", paddingHorizontal: spacing[6], gap: spacing[5] }}>
          <Card style={{ alignItems: "center", gap: spacing[3], paddingVertical: spacing[8] }}>
            <View
              style={{
                width: 66,
                height: 66,
                borderRadius: 20,
                backgroundColor: colors.successSoft,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CircleCheck size={30} color={colors.success} />
            </View>
            <Text variant="h2" style={{ textAlign: "center" }}>
              Confirme seu e-mail
            </Text>
            <Text color="textSecondary" style={{ textAlign: "center" }}>
              Enviamos um link para {email.trim()}. Abra a mensagem para ativar sua conta.
            </Text>
          </Card>
          <Button label="Ir para o login" onPress={() => router.replace("/login")} />
        </View>
      </View>
    );
  }

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
          <Text variant="h1">Criar sua conta</Text>
          <Text color="textSecondary">Leva menos de um minuto e é grátis.</Text>
        </View>

        <View style={{ gap: spacing[4] }}>
          <Field
            label="Nome completo"
            icon={UserRound}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Como você quer ser chamado"
            autoComplete="name"
            error={error}
          />
          <Field
            label="E-mail"
            icon={Mail}
            value={email}
            onChangeText={setEmail}
            placeholder="seu@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          <Field
            label="Senha"
            icon={Lock}
            value={password}
            onChangeText={setPassword}
            placeholder="Ao menos 6 caracteres"
            autoComplete="new-password"
            password
          />
        </View>

        <Button label="Criar conta" loading={loading} onPress={() => void submit()} />

        <View style={{ flexDirection: "row", justifyContent: "center", gap: spacing[1] + 1 }}>
          <Text color="textSecondary">Já tem uma conta?</Text>
          <Pressable accessibilityRole="button" onPress={() => router.replace("/login")} hitSlop={6}>
            <Text variant="bodyStrong" color="primaryStrong">
              Entrar
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
