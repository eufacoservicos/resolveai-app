import {
  Button,
  Card,
  Text,
  fontSize,
  letterSpacing,
  lineHeight,
  useTheme,
} from "@eufaco/design-system/native";
import { useRouter } from "expo-router";
import { ArrowRight, CircleCheck, Lock, Mail } from "lucide-react-native";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from "react-native";
import { AppBar } from "@/components/AppBar";
import { Field } from "@/components/Field";
import { supabase } from "@/lib/supabase";

export default function ForgotPasswordScreen() {
  const { colors, radii, spacing } = useTheme();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async () => {
    if (!email.trim()) return setError("Informe seu e-mail.");

    setLoading(true);
    setError(null);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim());

    setLoading(false);

    if (resetError) {
      setError("Não foi possível enviar o link. Verifique sua conexão e tente de novo.");
      return;
    }
    // Sucesso mesmo com e-mail inexistente: dizer o contrário revelaria
    // quais endereços têm conta.
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
              Link enviado
            </Text>
            <Text color="textSecondary" style={{ textAlign: "center" }}>
              Se existir uma conta com {email.trim()}, o link para criar uma nova senha chega em instantes.
            </Text>
          </Card>
          <Button label="Voltar ao login" onPress={() => router.replace("/login")} />
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
          paddingTop: 16,
          paddingBottom: 28,
          gap: 24,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={{
            width: 70,
            height: 70,
            borderRadius: 22,
            backgroundColor: colors.primarySoft,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Lock size={30} color={colors.primaryStrong} />
        </View>

        <View style={{ gap: 5 }}>
          <Text variant="h1" style={{ lineHeight: fontSize["3xl"] * lineHeight.tight }}>
            Esqueceu a senha?
          </Text>
          <Text
            color="textSecondary"
            style={{ fontSize: fontSize.name, lineHeight: fontSize.name * lineHeight.normal }}
          >
            Informe seu e-mail e enviaremos um link para você criar uma nova senha.
          </Text>
        </View>

        <Field
          label="E-mail cadastrado"
          icon={Mail}
          value={email}
          onChangeText={setEmail}
          placeholder="seu@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          error={error}
        />

        <Button
          label="Enviar link"
          loading={loading}
          icon={<ArrowRight size={18} color={colors.onPrimary} />}
          iconPosition="right"
          onPress={() => void submit()}
        />

        <View
          style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 5 }}
        >
          <Text color="textSecondary" style={{ fontSize: fontSize.chip }}>
            Lembrou a senha?
          </Text>
          <Pressable accessibilityRole="button" onPress={() => router.replace("/login")} hitSlop={6}>
            <Text
              variant="titleSm"
              color="primaryStrong"
              style={{ fontSize: fontSize.chip, letterSpacing: letterSpacing.normal }}
            >
              Entrar
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
