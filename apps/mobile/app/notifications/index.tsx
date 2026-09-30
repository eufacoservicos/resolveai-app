import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type AppNotification,
  type NotificationType,
} from "@eufaco/shared";
import { Card, Text, useTheme } from "@eufaco/design-system/native";
import { useFocusEffect, useRouter } from "expo-router";
import {
  CheckCheck,
  MessageCircle,
  Settings,
  Sparkles,
  Star,
  Tag,
  TriangleAlert,
} from "lucide-react-native";
import type { ComponentType } from "react";
import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, View } from "react-native";
import { AppBar } from "@/components/AppBar";
import { SignInPrompt } from "@/components/SignInPrompt";
import { useSession } from "@/lib/session";
import { supabase } from "@/lib/supabase";
import type { ColorToken } from "@eufaco/design-system";

const ICONS: Record<NotificationType, { icon: ComponentType<{ size?: number; color?: string }>; fg: ColorToken; bg: ColorToken }> = {
  quote_request: { icon: MessageCircle, fg: "success", bg: "successSoft" },
  new_review: { icon: Star, fg: "accent", bg: "accentSoft" },
  review_reply: { icon: MessageCircle, fg: "primaryStrong", bg: "primarySoft" },
  review_reminder: { icon: Star, fg: "primaryStrong", bg: "primarySoft" },
  quota_warning: { icon: TriangleAlert, fg: "accent", bg: "accentSoft" },
  offer_expiring: { icon: Tag, fg: "primaryStrong", bg: "primarySoft" },
  system: { icon: Sparkles, fg: "textSecondary", bg: "surface2" },
};

/** "há 2 horas", "ontem", "12 de setembro" — sem biblioteca de datas. */
function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const minutes = Math.floor((Date.now() - then) / 60000);

  if (minutes < 1) return "agora";
  if (minutes < 60) return `há ${minutes} min`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours} h`;
  if (hours < 48) return "ontem";

  return new Date(iso).toLocaleDateString("pt-BR", { day: "numeric", month: "long" });
}

export default function NotificationsScreen() {
  const { colors, radii, spacing, layout } = useTheme();
  const router = useRouter();
  const { session, loading: sessionLoading } = useSession();

  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const userId = session?.user.id;

  const load = useCallback(() => {
    if (!userId) {
      setLoading(false);
      return () => undefined;
    }
    let active = true;
    getNotifications(supabase, userId)
      .then((result) => {
        if (active) setItems(result);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [userId]);

  useFocusEffect(load);

  const openNotification = (item: AppNotification) => {
    if (!item.read_at) {
      void markNotificationRead(supabase, item.id);
      setItems((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, read_at: new Date().toISOString() } : n)),
      );
    }
    const route = typeof item.data?.route === "string" ? item.data.route : null;
    if (route) router.push(route);
  };

  const markAll = () => {
    if (!userId) return;
    void markAllNotificationsRead(supabase, userId);
    const now = new Date().toISOString();
    setItems((prev) => prev.map((n) => (n.read_at ? n : { ...n, read_at: now })));
  };

  if (sessionLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <AppBar title="Avisos" />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </View>
    );
  }

  if (!session) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <AppBar title="Avisos" />
        <SignInPrompt
          title="Seus avisos ficam aqui"
          description="Entre para receber pedidos de orçamento, avaliações novas e lembretes."
        />
      </View>
    );
  }

  const hasUnread = items.some((n) => !n.read_at);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <AppBar
        title="Avisos"
        action={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Ajustes de notificações"
            onPress={() => router.push("/notifications/settings")}
            style={{
              width: 38,
              height: 38,
              borderRadius: radii.full,
              backgroundColor: colors.surface2,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Settings size={18} color={colors.textPrimary} />
          </Pressable>
        }
      />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: layout.screenPadding,
          paddingTop: 10,
          paddingBottom: spacing[8],
          gap: 20,
        }}
        refreshControl={<RefreshControl refreshing={false} onRefresh={load} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {hasUnread ? (
          <Pressable
            accessibilityRole="button"
            onPress={markAll}
            style={{ flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-end" }}
            hitSlop={8}
          >
            <CheckCheck size={15} color={colors.primaryStrong} />
            <Text variant="label" color="primaryStrong">
              Marcar todas como lidas
            </Text>
          </Pressable>
        ) : null}

        {loading ? (
          <View style={{ paddingVertical: spacing[10], alignItems: "center" }}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : items.length === 0 ? (
          <Card style={{ alignItems: "center", paddingVertical: spacing[8], gap: spacing[2] }}>
            <Text variant="title">Nenhum aviso ainda</Text>
            <Text color="textSecondary" style={{ textAlign: "center" }}>
              Quando alguém pedir seu orçamento ou avaliar seu serviço, você vê por aqui.
            </Text>
          </Card>
        ) : (
          items.map((item) => {
            const tone = ICONS[item.type];
            const unread = !item.read_at;

            return (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                accessibilityLabel={item.title}
                onPress={() => openNotification(item)}
                style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
              >
                <Card
                  variant={unread ? "plain" : "outlined"}
                  style={{
                    flexDirection: "row",
                    alignItems: "flex-start",
                    gap: 12,
                    backgroundColor: unread ? colors.primarySoft : colors.surface,
                  }}
                >
                  <View
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 12,
                      backgroundColor: colors[tone.bg],
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <tone.icon size={18} color={colors[tone.fg]} />
                  </View>

                  <View style={{ flex: 1, gap: 3 }}>
                    <Text variant="bodyStrong">{item.title}</Text>
                    <Text variant="caption" color="textSecondary">
                      {item.body}
                    </Text>
                    <Text variant="caption" color="textMuted">
                      {relativeTime(item.created_at)}
                    </Text>
                  </View>

                  {unread ? (
                    <View
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: radii.full,
                        backgroundColor: colors.primary,
                        marginTop: 4,
                      }}
                    />
                  ) : null}
                </Card>
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}
