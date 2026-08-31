import { registerPushToken, updateNotificationPreferences } from "@eufaco/shared";
import { Button, Card, Text, useTheme } from "@eufaco/design-system/native";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { Bell, MessageCircle, Settings, Star, TriangleAlert } from "lucide-react-native";
import { useState } from "react";
import { Platform, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSession } from "@/lib/session";
import { supabase } from "@/lib/supabase";
import type { ColorToken } from "@eufaco/design-system";

const REASONS: {
  label: string;
  icon: typeof Bell;
  fg: ColorToken;
  bg: ColorToken;
}[] = [
  { label: "Quando um cliente pedir seu orçamento", icon: MessageCircle, fg: "success", bg: "successSoft" },
  { label: "Quando alguém avaliar o seu serviço", icon: Star, fg: "accent", bg: "accentSoft" },
  {
    label: "Quando seus orçamentos estiverem acabando",
    icon: TriangleAlert,
    fg: "primaryStrong",
    bg: "primarySoft",
  },
];

/**
 * Tela de preparo, antes do diálogo do sistema.
 *
 * O Android e o iOS só deixam pedir a permissão uma vez de forma útil: se a
 * pessoa recusa, só volta atrás nos ajustes do aparelho. Explicar antes
 * evita queimar essa única chance.
 */
export default function NotificationPermissionScreen() {
  const { colors, radii, spacing, layout } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { session } = useSession();

  const [asking, setAsking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enable = async () => {
    setAsking(true);
    setError(null);

    const { status } = await Notifications.requestPermissionsAsync();

    if (status !== "granted") {
      setAsking(false);
      setError("Você recusou as notificações. Para ativar depois, use os ajustes do aparelho.");
      return;
    }

    try {
      const projectId = Constants.expoConfig?.extra?.eas?.projectId as string | undefined;
      const token = await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined);

      if (session) {
        await registerPushToken(
          supabase,
          session.user.id,
          token.data,
          Platform.OS === "ios" ? "ios" : "android",
        );
        await updateNotificationPreferences(supabase, session.user.id, { push_enabled: true });
      }
      router.back();
    } catch {
      // Permissão concedida mas token falhou: não vale bloquear a pessoa aqui
      setError("Notificações ativadas, mas não conseguimos registrar este aparelho. Tente de novo mais tarde.");
    } finally {
      setAsking(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + spacing[6],
          paddingHorizontal: spacing[6],
          paddingBottom: spacing[8],
          gap: spacing[5],
          alignItems: "center",
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ width: 146, height: 146, alignItems: "center", justifyContent: "center" }}>
          <View
            style={{
              position: "absolute",
              width: 146,
              height: 146,
              borderRadius: radii.full,
              backgroundColor: colors.primarySoft,
              opacity: 0.55,
            }}
          />
          <View
            style={{
              position: "absolute",
              width: 98,
              height: 98,
              borderRadius: radii.full,
              backgroundColor: colors.primarySoft,
            }}
          />
          <View
            style={{
              width: 60,
              height: 60,
              borderRadius: radii.full,
              backgroundColor: colors.primary,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Bell size={27} color={colors.onPrimary} />
          </View>
        </View>

        <View style={{ gap: spacing[2], alignItems: "center" }}>
          <Text variant="h1" style={{ textAlign: "center" }}>
            Quer saber na hora que alguém te procurar?
          </Text>
          <Text color="textSecondary" style={{ textAlign: "center" }}>
            Avisamos só o que importa. Nada de propaganda sem você pedir.
          </Text>
        </View>

        <View style={{ alignSelf: "stretch", gap: spacing[2] + 1 }}>
          {REASONS.map((reason) => (
            <Card key={reason.label} style={{ flexDirection: "row", alignItems: "center", gap: spacing[3] }}>
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 11,
                  backgroundColor: colors[reason.bg],
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <reason.icon size={17} color={colors[reason.fg]} />
              </View>
              <Text variant="body" style={{ flex: 1 }}>
                {reason.label}
              </Text>
            </Card>
          ))}
        </View>

        {error ? (
          <Card variant="plain" style={{ alignSelf: "stretch", backgroundColor: colors.accentSoft }}>
            <Text variant="bodyStrong" color="accent">
              {error}
            </Text>
          </Card>
        ) : null}

        <View style={{ alignSelf: "stretch", gap: spacing[3] }}>
          <Button label="Ativar notificações" loading={asking} onPress={() => void enable()} />

          <Pressable
            accessibilityRole="button"
            onPress={() => router.back()}
            hitSlop={8}
            style={{ alignItems: "center" }}
          >
            <Text variant="title" color="textMuted">
              Agora não
            </Text>
          </Pressable>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", gap: spacing[1] + 2 }}>
          <Settings size={13} color={colors.textMuted} />
          <Text variant="caption" color="textMuted">
            Dá para desligar tudo depois, em Ajustes
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
