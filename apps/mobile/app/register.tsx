import {
  Button,
  Card,
  Text,
  fontSize,
  letterSpacing,
  lineHeight,
  nativeFonts,
  useTheme,
} from "@eufaco/design-system/native";
import { useRouter } from "expo-router";
import { ArrowRight, Check, CircleCheck, Lock, Mail, UserRound } from "lucide-react-native";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from "react-native";
import { AppBar } from "@/components/AppBar";
import { Field } from "@/components/Field";
import { acceptTerms } from "@eufaco/shared";
import { supabase } from "@/lib/supabase";

/** Quatro critérios simples; nenhum deles bloqueia, só orientam. */
function passwordStrength(password: string): { score: number; label: string } {
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password) || /[A-Z]/.test(password)) score++;

  const labels = ["", "Fraca", "Razoável", "Boa", "Forte"];
  return { score, label: labels[score] ?? "" };
}

export default function RegisterScreen() {
  const { colors, radii, spacing } = useTheme();
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const submit = async () => {
    if (fullName.trim().length < 3) return setError("Informe seu nome completo.");
    if (!email.trim()) return setError("Informe seu e-mail.");
    if (password.length < 6) return setError("A senha precisa ter ao menos 6 caracteres.");
    if (!termsAccepted) return setError("É preciso aceitar os Termos de Uso para criar a conta.");

    setLoading(true);
    setError(null);

    const { error: authError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: fullName.trim(), accepted_terms_at: new Date().toISOString() },
      },
    });

    // Quando a confirmação de e-mail está desligada, já vem sessão: dá para
    // gravar o aceite na hora. Com confirmação, fica registrado no metadata.
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData.session) {
      await acceptTerms(supabase, sessionData.session.user.id);
    }

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
          paddingTop: 10,
          paddingBottom: 28,
          gap: 24,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ gap: 5 }}>
          <Text variant="h1" style={{ lineHeight: fontSize["3xl"] * lineHeight.tight }}>
            Criar sua conta
          </Text>
          <Text
            color="textSecondary"
            style={{ fontSize: fontSize.name, lineHeight: fontSize.name * lineHeight.normal }}
          >
            Leva menos de um minuto e é grátis.
          </Text>
        </View>

        <View style={{ gap: 14 }}>
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

          {password.length > 0 ? (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              {[0, 1, 2, 3].map((index) => {
                const { score } = passwordStrength(password);
                const filled = index < score;
                const tone = score >= 4 ? colors.success : score >= 2 ? colors.accent : colors.danger;
                return (
                  <View
                    key={index}
                    style={{
                      flex: 1,
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: filled ? tone : colors.surface3,
                    }}
                  />
                );
              })}
              <Text
                variant="microStrong"
                style={{ fontSize: fontSize.xs }}
                color={
                  passwordStrength(password).score >= 4
                    ? "success"
                    : passwordStrength(password).score >= 2
                      ? "accent"
                      : "danger"
                }
              >
                {passwordStrength(password).label}
              </Text>
            </View>
          ) : null}
        </View>

        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: termsAccepted }}
          accessibilityLabel="Aceito os Termos de Uso e a Política de Privacidade"
          onPress={() => {
            setTermsAccepted((v) => !v);
            setError(null);
          }}
          style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}
        >
          <View
            style={{
              width: 20,
              height: 20,
              borderRadius: 6,
              marginTop: 2,
              backgroundColor: termsAccepted ? colors.primary : "transparent",
              borderWidth: termsAccepted ? 0 : 1.5,
              borderColor: colors.borderStrong,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {termsAccepted ? <Check size={13} color={colors.onPrimary} /> : null}
          </View>
          <Text
            color="textSecondary"
            style={{ flex: 1, fontSize: fontSize.note, lineHeight: fontSize.note * 1.45 }}
          >
            Li e aceito os Termos de Uso e a Política de Privacidade da plataforma.
          </Text>
        </Pressable>

        <Button
          label="Criar conta"
          loading={loading}
          icon={<ArrowRight size={18} color={colors.onPrimary} />}
          iconPosition="right"
          onPress={() => void submit()}
        />

        <View
          style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 5 }}
        >
          <Text color="textSecondary" style={{ fontSize: fontSize.chip }}>
            Já tem uma conta?
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
