import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from "react-native";
import { router } from "expo-router";
import { ArrowRight } from "lucide-react-native";
import { toast } from "sonner-native";
import { supabase } from "@/lib/supabase";
import { signInWithOAuth } from "@/lib/oauth";
import { AuthLogo } from "@/components/layout/auth-logo";
import { AmbientBg } from "@/components/ui/ambient-bg";
import { Button } from "@/components/ui/button";
import { GoogleIcon } from "@/components/ui/google-icon";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { Display, Muted, Text } from "@/components/ui/text";

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

  async function handleGoogleLogin() {
    setGoogleLoading(true);
    try {
      await signInWithOAuth("google");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao entrar com Google.";
      if (msg !== "OAuth flow cancelled") toast.error(msg);
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <View className="flex-1 bg-background">
      <AmbientBg />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            paddingHorizontal: 20,
            paddingVertical: 32,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="w-full max-w-md self-center">
            <AuthLogo />

            <View className="mb-8">
              <Display className="text-[36px] leading-[38px]">
                Bem-vindo{"\n"}
                <Text className="text-[36px] font-black text-primary">de volta.</Text>
              </Display>
              <Muted className="mt-3 text-base">
                Entre para encontrar o profissional certo em segundos.
              </Muted>
            </View>

            <View className="rounded-3xl border border-white/10 bg-card/60 p-6">
              <View className="gap-4">
                <View className="gap-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Email
                  </Label>
                  <Input
                    placeholder="seu@email.com"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                  />
                </View>

                <View className="gap-2">
                  <View className="flex-row items-center justify-between">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Senha
                    </Label>
                    <Pressable
                      onPress={() => router.push("/forgot-password")}
                      hitSlop={8}
                    >
                      <Text className="text-xs font-semibold text-primary">
                        Esqueci
                      </Text>
                    </Pressable>
                  </View>
                  <PasswordInput
                    placeholder="Sua senha"
                    value={password}
                    onChangeText={setPassword}
                    autoComplete="password"
                  />
                </View>

                <Button
                  variant="gradient"
                  size="lg"
                  onPress={handleSubmit}
                  loading={loading}
                  className="mt-2 w-full"
                >
                  <Text className="text-base font-bold text-primary-foreground">
                    Entrar
                  </Text>
                  <ArrowRight size={18} color="#05070a" />
                </Button>
              </View>

              <View className="my-6 flex-row items-center gap-3">
                <View className="h-px flex-1 bg-white/10" />
                <Muted className="text-[10px] uppercase tracking-widest">
                  ou continue com
                </Muted>
                <View className="h-px flex-1 bg-white/10" />
              </View>

              <Button
                variant="glass"
                size="lg"
                onPress={handleGoogleLogin}
                loading={googleLoading}
                className="w-full gap-3"
              >
                <GoogleIcon />
                <Text className="text-base font-semibold text-foreground">
                  Continuar com Google
                </Text>
              </Button>
            </View>

            <View className="mt-8 flex-row items-center justify-center gap-1.5">
              <Muted>Novo por aqui?</Muted>
              <Pressable onPress={() => router.push("/register")} hitSlop={8}>
                <Text className="text-sm font-bold text-primary">
                  Criar conta
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
