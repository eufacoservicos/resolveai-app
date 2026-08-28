import { getCurrentUser, type User } from "@eufaco/shared";
import { Card, Text, useTheme } from "@eufaco/design-system/native";
import { useFocusEffect, useRouter } from "expo-router";
import {
  Bell,
  Briefcase,
  ChevronRight,
  FileText,
  LogOut,
  MessageCircle,
  Star,
  Trash2,
  UserRound,
} from "lucide-react-native";
import type { ComponentType } from "react";
import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SignInPrompt } from "@/components/SignInPrompt";
import { initialsOf } from "@/lib/format";
import { useSession } from "@/lib/session";
import { supabase } from "@/lib/supabase";

interface Row {
  label: string;
  icon: ComponentType<{ size?: number; color?: string }>;
  danger?: boolean;
  onPress?: () => void;
}

export default function ProfileScreen() {
  const { colors, radii, spacing, layout } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { session, loading: sessionLoading, signOut } = useSession();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const userId = session?.user.id;

  useFocusEffect(
    useCallback(() => {
      if (!userId) {
        setLoading(false);
        return;
      }
      let active = true;
      setLoading(true);
      getCurrentUser(supabase)
        .then((result) => {
          if (active) setUser(result as User | null);
        })
        .finally(() => {
          if (active) setLoading(false);
        });
      return () => {
        active = false;
      };
    }, [userId]),
  );

  const confirmSignOut = () => {
    Alert.alert("Sair da conta?", "Você vai precisar entrar de novo para ver seus favoritos.", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", style: "destructive", onPress: () => void signOut() },
    ]);
  };

  if (sessionLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!session) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, paddingBottom: 90 }}>
        <SignInPrompt
          title="Sua conta no eufaço!"
          description="Entre para salvar favoritos, avaliar quem te atendeu e oferecer seus próprios serviços."
        />
      </View>
    );
  }

  const businessRows: Row[] = [
    { label: "Perfil profissional", icon: Briefcase },
    { label: "Avaliações recebidas", icon: Star },
    { label: "Meus contatos", icon: MessageCircle },
  ];

  const accountRows: Row[] = [
    { label: "Dados pessoais", icon: UserRound, onPress: () => router.push("/profile/edit") },
    { label: "Notificações", icon: Bell, onPress: () => router.push("/notifications/settings") },
    { label: "Termos e privacidade", icon: FileText },
    { label: "Sair da conta", icon: LogOut, danger: true, onPress: confirmSignOut },
    {
      label: "Excluir minha conta",
      icon: Trash2,
      danger: true,
      onPress: () => router.push("/profile/delete"),
    },
  ];

  const renderGroup = (title: string, rows: Row[]) => (
    <View style={{ gap: spacing[3] }}>
      <Text variant="h3">{title}</Text>
      <View style={{ gap: spacing[2] }}>
        {rows.map((row) => (
          <Pressable
            key={row.label}
            accessibilityRole="button"
            accessibilityLabel={row.label}
            onPress={row.onPress}
            style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
          >
            <Card
              style={{ flexDirection: "row", alignItems: "center", gap: spacing[3], paddingVertical: spacing[3] }}
            >
              <View
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  backgroundColor: row.danger ? colors.dangerSoft : colors.surface2,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <row.icon size={17} color={row.danger ? colors.danger : colors.textSecondary} />
              </View>
              <Text variant="bodyStrong" color={row.danger ? "danger" : "textPrimary"} style={{ flex: 1 }}>
                {row.label}
              </Text>
              <ChevronRight size={17} color={colors.textMuted} />
            </Card>
          </Pressable>
        ))}
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top + spacing[2] }}>
      <Text variant="h3" style={{ textAlign: "center", paddingHorizontal: layout.screenPadding }}>
        Perfil
      </Text>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: layout.screenPadding,
          paddingTop: spacing[4],
          paddingBottom: 110,
          gap: spacing[6],
        }}
        showsVerticalScrollIndicator={false}
      >
        <Card style={{ alignItems: "center", gap: spacing[3], paddingVertical: spacing[5] }}>
          <View
            style={{
              width: 74,
              height: 74,
              borderRadius: 22,
              backgroundColor: colors.primarySoft,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {loading ? (
              <ActivityIndicator color={colors.primaryStrong} />
            ) : (
              <Text variant="h1" color="primaryStrong">
                {initialsOf(user?.full_name ?? session.user.email ?? "?")}
              </Text>
            )}
          </View>
          <View style={{ alignItems: "center", gap: 2 }}>
            <Text variant="h2">{user?.full_name ?? "Sua conta"}</Text>
            <Text variant="caption" color="textMuted">
              {user?.email ?? session.user.email}
            </Text>
          </View>
        </Card>

        {user?.role === "PROVIDER" ? renderGroup("Meu negócio", businessRows) : null}
        {renderGroup("Conta", accountRows)}
      </ScrollView>
    </View>
  );
}
