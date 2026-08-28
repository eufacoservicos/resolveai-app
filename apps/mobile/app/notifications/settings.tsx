import {
  getNotificationPreferences,
  updateNotificationPreferences,
  type NotificationPreferences,
  type NotificationToggle,
} from "@eufaco/shared";
import { Card, Text, Toggle, useTheme } from "@eufaco/design-system/native";
import { Moon, Settings } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, Linking, Pressable, ScrollView, View } from "react-native";
import { AppBar } from "@/components/AppBar";
import { SignInPrompt } from "@/components/SignInPrompt";
import { useSession } from "@/lib/session";
import { supabase } from "@/lib/supabase";

interface Group {
  title: string;
  items: { key: NotificationToggle; label: string; hint?: string }[];
}

const GROUPS: Group[] = [
  {
    title: "Sobre o seu trabalho",
    items: [
      { key: "quote_requests", label: "Pedidos de orçamento", hint: "Quando alguém abre seu WhatsApp" },
      { key: "new_reviews", label: "Novas avaliações", hint: "Inclui quem respondeu você" },
      { key: "quota_warnings", label: "Limite de orçamentos", hint: "Aviso quando restarem 3" },
      { key: "offers_expiring", label: "Ofertas expirando", hint: "3 dias antes do fim" },
    ],
  },
  {
    title: "Como cliente",
    items: [
      { key: "review_reminders", label: "Lembrete para avaliar", hint: "Alguns dias depois do contato" },
      { key: "review_replies", label: "Resposta do profissional", hint: "Quando ele responde sua avaliação" },
    ],
  },
  {
    title: "Novidades",
    items: [
      { key: "product_news", label: "Dicas e novidades do app" },
      { key: "promotions", label: "Promoções e campanhas" },
    ],
  },
];

export default function NotificationSettingsScreen() {
  const { colors, radii, spacing, layout } = useTheme();
  const { session, loading: sessionLoading } = useSession();

  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  const userId = session?.user.id;

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    let active = true;
    getNotificationPreferences(supabase, userId)
      .then((result) => {
        if (active) setPrefs(result);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [userId]);

  /** Aplica na hora e persiste; se o servidor recusar, volta ao valor anterior. */
  const patch = (changes: Partial<NotificationPreferences>) => {
    if (!userId || !prefs) return;
    const previous = prefs;
    setPrefs({ ...prefs, ...changes });

    void updateNotificationPreferences(supabase, userId, changes).then(({ error }) => {
      if (error) setPrefs(previous);
    });
  };

  if (sessionLoading || loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <AppBar title="Notificações" />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </View>
    );
  }

  if (!session || !prefs) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <AppBar title="Notificações" />
        <SignInPrompt
          title="Ajuste seus avisos"
          description="Entre para escolher o que você quer receber e quando."
        />
      </View>
    );
  }

  const master = prefs.push_enabled;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <AppBar title="Notificações" />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: layout.screenPadding,
          paddingTop: spacing[3],
          paddingBottom: spacing[8],
          gap: spacing[5],
        }}
        showsVerticalScrollIndicator={false}
      >
        <Card
          variant="plain"
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: spacing[3],
            backgroundColor: colors.primarySoft,
            padding: spacing[4],
          }}
        >
          <View style={{ flex: 1, gap: 2 }}>
            <Text variant="title">Notificações do app</Text>
            <Text variant="caption" color="textSecondary">
              Desligue aqui para não receber nada
            </Text>
          </View>
          <Toggle
            accessibilityLabel="Notificações do app"
            value={master}
            onValueChange={(value) => patch({ push_enabled: value })}
          />
        </Card>

        {/* Os controles finos ficam inertes com a chave mestra desligada */}
        <View style={{ gap: spacing[5], opacity: master ? 1 : 0.45 }} pointerEvents={master ? "auto" : "none"}>
          {GROUPS.map((group) => (
            <View key={group.title} style={{ gap: spacing[3] }}>
              <Text variant="h3">{group.title}</Text>

              <Card padded={false} style={{ overflow: "hidden" }}>
                {group.items.map((item, index) => (
                  <View key={item.key}>
                    {index > 0 ? <View style={{ height: 1, backgroundColor: colors.border }} /> : null}
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: spacing[3],
                        paddingVertical: 13,
                        paddingHorizontal: 15,
                      }}
                    >
                      <View style={{ flex: 1, gap: 2 }}>
                        <Text variant="bodyStrong">{item.label}</Text>
                        {item.hint ? (
                          <Text variant="caption" color="textMuted">
                            {item.hint}
                          </Text>
                        ) : null}
                      </View>
                      <Toggle
                        accessibilityLabel={item.label}
                        value={prefs[item.key]}
                        onValueChange={(value) => patch({ [item.key]: value })}
                      />
                    </View>
                  </View>
                ))}
              </Card>
            </View>
          ))}

          <View style={{ gap: spacing[3] }}>
            <Text variant="h3">Não perturbe</Text>
            <Card style={{ flexDirection: "row", alignItems: "center", gap: spacing[3] }}>
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 11,
                  backgroundColor: colors.surface2,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Moon size={17} color={colors.textSecondary} />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text variant="bodyStrong">Silenciar à noite</Text>
                <Text variant="caption" color="textMuted">
                  Das {prefs.quiet_hours_start.slice(0, 5)} às {prefs.quiet_hours_end.slice(0, 5)}
                </Text>
              </View>
              <Toggle
                accessibilityLabel="Silenciar à noite"
                value={prefs.quiet_hours_enabled}
                onValueChange={(value) => patch({ quiet_hours_enabled: value })}
              />
            </Card>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Abrir ajustes do sistema"
          onPress={() => void Linking.openSettings()}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: spacing[2] + 2,
            backgroundColor: colors.surface2,
            borderRadius: radii.md,
            padding: spacing[3] + 1,
          }}
        >
          <Settings size={16} color={colors.textSecondary} />
          <Text variant="caption" color="textSecondary" style={{ flex: 1 }}>
            Você também pode bloquear tudo pelos ajustes do aparelho.
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
