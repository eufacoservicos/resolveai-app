import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, ArrowLeft, Trash2 } from "lucide-react-native";
import { usePostHog } from "posthog-react-native";
import { toast } from "sonner-native";
import { getCurrentUser } from "@resolveai/shared/supabase/queries";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-provider";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text, Muted } from "@/components/ui/text";
import { useTabBarPadding } from "@/lib/layout";

const REMOVED_DATA = [
  "Dados pessoais (nome, email, foto)",
  "Perfil de prestador e portfólio",
  "Avaliações escritas e recebidas",
  "Favoritos e histórico",
  "Documentos de verificação",
];

export default function DeleteAccountScreen() {
  const { user: authUser, loading: authLoading } = useAuth();
  const posthog = usePostHog();
  const [confirmation, setConfirmation] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const tabBarPad = useTabBarPadding();

  const userQuery = useQuery({
    queryKey: ["current-user", authUser?.id],
    queryFn: () => getCurrentUser(supabase),
    enabled: !!authUser,
  });
  const user = userQuery.data as
    | { id: string; email: string; role: string }
    | undefined;

  useEffect(() => {
    if (!authLoading && !authUser) router.replace("/login");
  }, [authLoading, authUser]);

  const isConfirmed = confirmation === "EXCLUIR";

  async function handleDelete() {
    setIsDeleting(true);

    // A exclusao exige service_role, que nao pode viver no app. A logica da
    // server action do PWA foi movida para supabase/functions/delete-account.
    const { data, error } = await supabase.functions.invoke("delete-account", {
      method: "POST",
    });
    // O generico de invoke() exige JsonType, que nao aceita campos opcionais.
    const result = data as { success?: boolean; error?: string } | null;

    if (error || result?.error) {
      toast.error(result?.error ?? "Erro ao excluir conta. Tente novamente.");
      setIsDeleting(false);
      setShowConfirm(false);
      return;
    }

    posthog?.capture("account_deleted", { role: user?.role ?? null });
    await supabase.auth.signOut();
    toast.success("Conta excluída com sucesso.");
    router.replace("/login");
  }

  if (authLoading || userQuery.isLoading || !user) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#22d3ee" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView
        contentContainerStyle={{ padding: 20, gap: 20, paddingBottom: tabBarPad }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center gap-3">
          <Pressable
            onPress={() => router.push("/profile")}
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            className="h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-card/60 active:bg-card"
          >
            <ArrowLeft size={16} color="#f5f7fb" />
          </Pressable>
          <Text className="text-2xl font-black">Excluir conta</Text>
        </View>

        <Muted className="text-base leading-relaxed">
          Aqui você pode solicitar a exclusão permanente da sua conta e de todos
          os dados associados no{" "}
          <Text className="text-base font-bold text-foreground">eufaço!</Text>.
          Após a exclusão, seus dados serão removidos em até 30 dias.
        </Muted>

        <View className="flex-row items-start gap-3 rounded-2xl border border-destructive/40 bg-destructive/10 p-5">
          <View className="h-10 w-10 items-center justify-center rounded-xl bg-destructive/20">
            <AlertTriangle size={18} color="#f43f5e" />
          </View>
          <View className="flex-1 gap-2">
            <Text className="text-sm font-bold text-destructive">
              Esta ação é irreversível
            </Text>
            <Muted>
              Ao excluir sua conta, todos os seus dados serão permanentemente
              removidos, incluindo:
            </Muted>
            <View className="gap-1">
              {REMOVED_DATA.map((item) => (
                <Muted key={item}>• {item}</Muted>
              ))}
            </View>
          </View>
        </View>

        <View className="gap-2">
          <Text className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Digite{" "}
            <Text className="text-xs font-bold text-destructive">EXCLUIR</Text>{" "}
            para confirmar
          </Text>
          <Input
            value={confirmation}
            onChangeText={setConfirmation}
            placeholder="EXCLUIR"
            editable={!isDeleting}
            autoCapitalize="characters"
            autoCorrect={false}
          />
        </View>

        <Button
          variant="destructive"
          size="lg"
          className="w-full"
          disabled={!isConfirmed || isDeleting}
          onPress={() => setShowConfirm(true)}
        >
          <Trash2 size={16} color="#ffffff" />
          <Text className="text-base font-bold text-white">
            Excluir minha conta
          </Text>
        </Button>
      </ScrollView>

      <AlertDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        title="Tem certeza absoluta?"
        description={
          <Muted>
            Sua conta <Text className="text-sm font-bold">{user.email}</Text>{" "}
            sera excluida permanentemente. Esta acao nao pode ser desfeita.
          </Muted>
        }
        actionLabel={isDeleting ? "Excluindo..." : "Sim, excluir conta"}
        onAction={handleDelete}
        loading={isDeleting}
        destructive
      />
    </SafeAreaView>
  );
}
