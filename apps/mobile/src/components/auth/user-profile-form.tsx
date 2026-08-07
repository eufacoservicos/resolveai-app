import { useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { ArrowLeft, Save } from "lucide-react-native";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner-native";
import { updateUser } from "@resolveai/shared/supabase/mutations";
import { supabase } from "@/lib/supabase";
import { AvatarPicker } from "@/components/providers/avatar-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Text, Muted } from "@/components/ui/text";

// Porta do UserProfileForm do PWA. O AvatarCropModal do web e substituido pelo
// AvatarPicker nativo (expo-image-picker ja recorta e faz o upload na hora).
type Props = {
  user: { id: string; full_name: string; email: string; avatar_url: string | null };
};

export function UserProfileForm({ user }: Props) {
  const queryClient = useQueryClient();
  const [fullName, setFullName] = useState(user.full_name);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!fullName.trim()) {
      toast.error("O nome é obrigatório.");
      return;
    }

    setLoading(true);

    const { error } = await updateUser(supabase, user.id, {
      full_name: fullName.trim(),
    });

    if (error) {
      toast.error("Erro ao salvar dados.");
    } else {
      toast.success("Dados atualizados!");
      void queryClient.invalidateQueries({ queryKey: ["current-user"] });
      router.replace("/profile");
    }

    setLoading(false);
  }

  return (
    <View className="rounded-xl border border-border bg-card p-5">
      <View className="gap-5">
        <AvatarPicker
          currentUrl={user.avatar_url}
          fallbackName={user.full_name}
          onUploaded={() =>
            queryClient.invalidateQueries({ queryKey: ["current-user"] })
          }
        />

        <View className="gap-1.5">
          <Label className="text-sm font-medium">Nome completo</Label>
          <Input
            placeholder="Seu nome completo"
            value={fullName}
            onChangeText={setFullName}
          />
        </View>

        <View className="gap-1.5">
          <Label className="text-sm font-medium">Email</Label>
          <Input value={user.email} editable={false} className="bg-muted" />
          <Muted className="text-xs">O email não pode ser alterado.</Muted>
        </View>

        <View className="flex-row gap-3 pt-1">
          <Button onPress={handleSubmit} loading={loading} className="h-11 flex-1">
            <Save size={16} color="#ffffff" />
            <Text className="text-base font-semibold text-primary-foreground">
              Salvar alterações
            </Text>
          </Button>
          <Button variant="outline" className="h-11" onPress={() => router.back()}>
            <ArrowLeft size={16} color="#f5f7fb" />
            <Text className="text-base font-semibold">Voltar</Text>
          </Button>
        </View>
      </View>
    </View>
  );
}
