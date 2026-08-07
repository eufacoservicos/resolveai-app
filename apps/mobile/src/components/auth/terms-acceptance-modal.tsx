import { useState } from "react";
import { Pressable, View } from "react-native";
import { router } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { acceptTerms } from "@resolveai/shared/supabase/mutations";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Text, Muted } from "@/components/ui/text";

// Porta do TermsAcceptanceModal do PWA: bloqueante, sem como fechar sem aceitar.
// O window.location.reload() do web vira invalidacao do current-user.
export function TermsAcceptanceModal({ userId }: { userId: string }) {
  const queryClient = useQueryClient();
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleAccept() {
    setLoading(true);
    const { error } = await acceptTerms(supabase, userId);
    if (error) {
      setLoading(false);
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["current-user"] });
    setLoading(false);
  }

  return (
    <Dialog open dismissible={false}>
      <DialogHeader>
        <DialogTitle>Termos de Uso atualizados</DialogTitle>
        <DialogDescription>
          Para continuar usando o eufaço!, é necessário aceitar os nossos Termos
          de Uso e Política de Privacidade.
        </DialogDescription>
      </DialogHeader>

      <View className="gap-2 rounded-lg border border-border bg-muted/50 p-4">
        <Muted className="text-xs leading-relaxed">
          O eufaço! é{" "}
          <Text className="text-xs font-semibold">
            exclusivamente um catálogo digital
          </Text>{" "}
          de prestadores de serviços. Não participamos da negociação, execução ou
          supervisão dos serviços.
        </Muted>
        <Muted className="text-xs leading-relaxed">
          O contato e a contratação são feitos{" "}
          <Text className="text-xs font-semibold">
            diretamente entre as partes
          </Text>
          . A plataforma não se responsabiliza por qualquer ocorrência entre
          cliente e prestador.
        </Muted>
      </View>

      <View className="flex-row items-start gap-2.5">
        <View className="mt-0.5">
          <Checkbox
            checked={accepted}
            onCheckedChange={setAccepted}
            accessibilityLabel="Aceitar termos"
          />
        </View>
        <Muted className="flex-1 text-xs leading-relaxed">
          Li e aceito os{" "}
          <Text
            className="text-xs text-primary"
            onPress={() => router.push("/terms")}
          >
            Termos de Uso
          </Text>{" "}
          e a{" "}
          <Text
            className="text-xs text-primary"
            onPress={() => router.push("/privacy")}
          >
            Política de Privacidade
          </Text>
          .
        </Muted>
      </View>

      <Button
        onPress={handleAccept}
        disabled={!accepted}
        loading={loading}
        className="h-11 w-full"
      >
        Continuar
      </Button>
    </Dialog>
  );
}
