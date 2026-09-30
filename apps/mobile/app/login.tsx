import {
  Button,
  Text,
  fontSize,
  letterSpacing,
  lineHeight,
  nativeFonts,
  useTheme,
} from "@eufaco/design-system/native";
import { getCurrentUser, type User } from "@eufaco/shared";
import { useRouter } from "expo-router";
import { Apple, ArrowRight, Lock, Mail } from "lucide-react-native";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from "react-native";
import { AppBar } from "@/components/AppBar";
import { Field } from "@/components/Field";
import { signInWithAppleNative, signInWithGoogleNative } from "@/lib/oauth";
import { supabase } from "@/lib/supabase";

/**
 * Para onde ir depois de entrar.
 *
 * Quem chegou pelo Google ou pela Apple nunca passou pelo cadastro, então
 * não tem aceite dos termos nem escolha de papel — vai para o passo de
 * completar o perfil. Quem já completou vai direto para a Home.
 */
async function destinationAfterSignIn(): Promise<"/" | "/complete-profile"> {
  try {
    const user = (await getCurrentUser(supabase)) as User | null;
    return user?.accepted_terms_at ? "/" : "/complete-profile";
  } catch {
    // Falhar aqui não pode prender a pessoa na tela de login
    return "/";
  }
}

/** Traduz os erros do Supabase para algo que diga o que fazer. */
function messageFor(error: string): string {
  if (error.includes("Invalid login credentials")) return "E-mail ou senha incorretos.";
  if (error.includes("Email not confirmed")) {
    return "Confirme seu e-mail antes de entrar. Procure a mensagem na sua caixa de entrada.";
  }
  return "Não foi possível entrar. Verifique sua conexão e tente de novo.";
}

export default function LoginScreen() {
  const { colors, radii, spacing } = useTheme();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<"google" | "apple" | null>(null);

  // Entrar com Apple só existe no iOS, onde a loja exige o botão
  const showApple = Platform.OS === "ios";

  const submit = async () => {
    if (!email.trim()) return setError("Informe seu e-mail.");
    if (!password) return setError("Informe sua senha.");

    setLoading(true);
    setError(null);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (authError) {
      setLoading(false);
      setError(messageFor(authError.message));
      return;
    }

    const destination = await destinationAfterSignIn();
    setLoading(false);
    router.replace(destination);
  };

  const withProvider = async (provider: "google" | "apple") => {
    setSocialLoading(provider);
    setError(null);
    const message =
      provider === "google" ? await signInWithGoogleNative() : await signInWithAppleNative();

    if (message) {
      setSocialLoading(null);
      setError(message);
      return;
    }

    const destination = await destinationAfterSignIn();
    setSocialLoading(null);
    router.replace(destination);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* O protótipo entra direto no formulário; a barra só aparece
          quando o login foi aberto de dentro do app e há para onde voltar. */}
      {router.canGoBack() ? <AppBar /> : null}

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: spacing[6],
          paddingTop: 28,
          paddingBottom: 28,
          gap: 26,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ gap: 14 }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text
              variant="h1"
              style={{ fontSize: fontSize["4xl"], letterSpacing: -1.2, lineHeight: fontSize["4xl"] * 1.2 }}
            >
              eufaço
            </Text>
            <Text
              variant="h1"
              color="primary"
              style={{ fontSize: fontSize["4xl"], letterSpacing: -1.2, lineHeight: fontSize["4xl"] * 1.2 }}
            >
              !
            </Text>
          </View>

          <View style={{ gap: 5 }}>
            <Text variant="h1" style={{ lineHeight: fontSize["3xl"] * lineHeight.tight }}>
              Bem-vindo de volta
            </Text>
            <Text
              color="textSecondary"
              style={{ fontSize: fontSize.name, lineHeight: fontSize.name * lineHeight.normal }}
            >
              Entre para encontrar profissionais de confiança perto de você.
            </Text>
          </View>
        </View>

        <View style={{ gap: 14 }}>
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

          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/forgot-password")}
            hitSlop={6}
            style={{ alignSelf: "flex-end" }}
          >
            <Text variant="label" color="primaryStrong">
              Esqueci minha senha
            </Text>
          </Pressable>
        </View>

        <Button
          label="Entrar"
          loading={loading}
          icon={<ArrowRight size={18} color={colors.onPrimary} />}
          iconPosition="right"
          onPress={() => void submit()}
        />

        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
          <Text variant="caption" color="textMuted">
            ou continue com
          </Text>
          <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
        </View>

        <View style={{ flexDirection: "row", gap: 10 }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Entrar com Google"
            accessibilityState={{ busy: socialLoading === "google" }}
            disabled={socialLoading !== null}
            onPress={() => void withProvider("google")}
            style={({ pressed }) => ({
              flex: 1,
              height: 50,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              borderRadius: radii.md,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              opacity: socialLoading !== null ? 0.55 : pressed ? 0.88 : 1,
            })}
          >
            <Text
              style={{
                color: colors.textPrimary,
                fontFamily: nativeFonts.displayExtraBold,
                fontSize: fontSize.lg,
              }}
            >
              G
            </Text>
            <Text variant="bodyStrong">Google</Text>
          </Pressable>

          {showApple ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Entrar com Apple"
              accessibilityState={{ busy: socialLoading === "apple" }}
              disabled={socialLoading !== null}
              onPress={() => void withProvider("apple")}
              style={({ pressed }) => ({
                flex: 1,
                height: 50,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                borderRadius: radii.md,
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                opacity: socialLoading !== null ? 0.55 : pressed ? 0.88 : 1,
              })}
            >
              <Apple size={18} color={colors.textPrimary} />
              <Text variant="bodyStrong">Apple</Text>
            </Pressable>
          ) : null}
        </View>

        <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 5 }}>
          <Text color="textSecondary" style={{ fontSize: fontSize.chip }}>
            Não tem uma conta?
          </Text>
          <Pressable accessibilityRole="button" onPress={() => router.replace("/register")} hitSlop={6}>
            <Text
              variant="titleSm"
              color="primaryStrong"
              style={{ fontSize: fontSize.chip, letterSpacing: letterSpacing.normal }}
            >
              Cadastre-se
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
