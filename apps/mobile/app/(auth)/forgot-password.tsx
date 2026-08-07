import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { router } from "expo-router";
import * as Linking from "expo-linking";
import { ArrowLeft, Mail } from "lucide-react-native";
import { toast } from "sonner-native";
import { supabase } from "@/lib/supabase";
import { AuthLogo } from "@/components/layout/auth-logo";
import { AmbientBg } from "@/components/ui/ambient-bg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Display, Muted, Text } from "@/components/ui/text";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit() {
    if (!email.trim()) {
      toast.error("Informe seu email.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: Linking.createURL("/reset-password"),
    });
    if (error) toast.error("Erro ao enviar email de recuperação.");
    else setSent(true);
    setLoading(false);
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

            {sent ? (
              <View className="items-center rounded-3xl border border-white/10 bg-card/60 p-8">
                <View className="mb-5 h-16 w-16 items-center justify-center rounded-2xl border border-primary/30 bg-primary/15">
                  <Mail size={30} color="#22d3ee" />
                </View>
                <Display className="text-center text-[28px] leading-[30px]">
                  Email <Text className="text-[28px] font-black text-primary">enviado!</Text>
                </Display>
                <Muted className="mt-4 text-center text-base">
                  Enviamos um link de recuperação para{"\n"}
                  <Text className="text-base font-semibold text-foreground">
                    {email}
                  </Text>
                  . Verifique sua caixa de entrada e spam.
                </Muted>
                <Button
                  variant="gradient"
                  size="lg"
                  className="mt-8 w-full"
                  onPress={() => router.replace("/login")}
                >
                  Voltar para o login
                </Button>
              </View>
            ) : (
              <>
                <View className="mb-7">
                  <Display className="text-[32px] leading-[34px]">
                    Recuperar{"\n"}
                    <Text className="text-[32px] font-black text-primary">
                      senha.
                    </Text>
                  </Display>
                  <Muted className="mt-3 text-base">
                    Informe seu email para receber o link de recuperação.
                  </Muted>
                </View>

                <View className="gap-5 rounded-3xl border border-white/10 bg-card/60 p-6">
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

                  <Button
                    variant="gradient"
                    size="lg"
                    onPress={handleSubmit}
                    loading={loading}
                    className="w-full"
                  >
                    Enviar link
                  </Button>
                </View>

                <Pressable
                  onPress={() => router.replace("/login")}
                  hitSlop={8}
                  className="mt-8 flex-row items-center justify-center gap-1.5"
                >
                  <ArrowLeft size={14} color="#22d3ee" />
                  <Text className="text-sm font-bold text-primary">
                    Voltar para o login
                  </Text>
                </Pressable>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
