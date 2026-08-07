import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native";
import { router } from "expo-router";
import { CheckCircle } from "lucide-react-native";
import { toast } from "sonner-native";
import { supabase } from "@/lib/supabase";
import { AuthLogo } from "@/components/layout/auth-logo";
import { AmbientBg } from "@/components/ui/ambient-bg";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { Display, Muted, Text } from "@/components/ui/text";

export default function ResetPasswordScreen() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (password.length < 6) {
      toast.error("A senha deve ter no mínimo 6 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      toast.error("Erro ao redefinir senha. O link pode ter expirado.");
    } else {
      toast.success("Senha redefinida com sucesso!");
      router.replace("/home");
    }
    setLoading(false);
  }

  return (
    <View className="flex-1 bg-background">
      <AmbientBg variant="violet" />
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

            <View className="mb-7 items-start">
              <View className="mb-5 h-14 w-14 items-center justify-center rounded-2xl border border-primary/30 bg-primary/15">
                <CheckCircle size={26} color="#22d3ee" />
              </View>
              <Display className="text-[32px] leading-[34px]">
                Nova <Text className="text-[32px] font-black text-primary">senha.</Text>
              </Display>
              <Muted className="mt-3 text-base">
                Defina sua nova senha para acessar o eufaço!
              </Muted>
            </View>

            <View className="gap-5 rounded-3xl border border-white/10 bg-card/60 p-6">
              <View className="gap-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Nova senha
                </Label>
                <PasswordInput
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChangeText={setPassword}
                />
              </View>

              <View className="gap-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Confirmar nova senha
                </Label>
                <PasswordInput
                  placeholder="Repita a senha"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
              </View>

              <Button
                variant="gradient"
                size="lg"
                onPress={handleSubmit}
                loading={loading}
                className="mt-2 w-full"
              >
                Redefinir senha
              </Button>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
