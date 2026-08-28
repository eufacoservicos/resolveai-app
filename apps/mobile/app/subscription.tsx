import { Badge, Button, Card, Text, useTheme } from "@eufaco/design-system/native";
import { useRouter } from "expo-router";
import { Calendar, CircleCheck, CircleX } from "lucide-react-native";
import { ActivityIndicator, Alert, Linking, Platform, ScrollView, View } from "react-native";
import { AppBar } from "@/components/AppBar";
import { SignInPrompt } from "@/components/SignInPrompt";
import { useProviderAccount } from "@/hooks/useProviderAccount";
import { useSession } from "@/lib/session";

const BENEFITS = [
  "Orçamentos ilimitados",
  "Destaque em Profissionais recomendados",
  "Ofertas e descontos no perfil",
  "Prioridade nos resultados de busca",
];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "numeric", month: "long" });
}

export default function SubscriptionScreen() {
  const { colors, radii, spacing, layout } = useTheme();
  const router = useRouter();
  const { session, loading: sessionLoading } = useSession();
  const { subscription, usage, loading } = useProviderAccount();

  const cancel = () => {
    Alert.alert(
      "Cancelar assinatura?",
      "Você mantém os benefícios até o fim do período já pago. Depois disso o perfil volta ao plano Grátis, com até 10 orçamentos por mês.",
      [
        { text: "Manter assinatura", style: "cancel" },
        {
          text: "Cancelar",
          style: "destructive",
          onPress: () => {
            // Assinatura cobrada pelo Google Play só pode ser cancelada na loja:
            // a Play não aceita que o app faça isso por conta própria.
            if (Platform.OS === "android") {
              void Linking.openURL("https://play.google.com/store/account/subscriptions");
              return;
            }
            Alert.alert("Cancelamento", "Gerencie a assinatura pela loja do seu aparelho.");
          },
        },
      ],
    );
  };

  if (sessionLoading || loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <AppBar title="Minha assinatura" />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </View>
    );
  }

  if (!session) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <AppBar title="Minha assinatura" />
        <SignInPrompt
          title="Sua assinatura"
          description="Entre para ver o plano em vigor, a próxima cobrança e os benefícios ativos."
        />
      </View>
    );
  }

  const isPro = usage?.plan === "pro";

  if (!isPro || !subscription) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <AppBar title="Minha assinatura" />
        <View style={{ flex: 1, justifyContent: "center", paddingHorizontal: layout.screenPadding, gap: spacing[4] }}>
          <Card style={{ alignItems: "center", gap: spacing[2], paddingVertical: spacing[8] }}>
            <Text variant="h2" style={{ textAlign: "center" }}>
              Você está no plano Grátis
            </Text>
            <Text color="textSecondary" style={{ textAlign: "center" }}>
              Até 10 orçamentos por mês, sem destaque na home e sem ofertas.
            </Text>
          </Card>
          <Button label="Ver o plano Profissional" onPress={() => router.replace("/plans")} />
        </View>
      </View>
    );
  }

  const canceled = subscription.status === "canceled";

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <AppBar title="Minha assinatura" />

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
          style={{
            gap: spacing[4],
            padding: spacing[4] + 2,
            borderColor: canceled ? colors.accent : colors.success,
            borderWidth: 1.5,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing[3] }}>
            <View style={{ flex: 1, gap: 3 }}>
              <Text variant="h2">Plano Profissional</Text>
              <Text variant="caption" color="textSecondary">
                R$ 29,90 por mês
              </Text>
            </View>
            <Badge label={canceled ? "Cancelada" : "Ativa"} tone={canceled ? "accent" : "success"} />
          </View>

          <View style={{ height: 1, backgroundColor: colors.border }} />

          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing[2] + 1 }}>
            <Calendar size={16} color={colors.textMuted} />
            <Text variant="caption" color="textSecondary" style={{ flex: 1 }}>
              {canceled
                ? `Benefícios até ${formatDate(subscription.current_period_end)}`
                : `Próxima cobrança em ${formatDate(subscription.current_period_end)}`}
            </Text>
          </View>
        </Card>

        <Card
          variant="plain"
          style={{ backgroundColor: colors.primarySoft, gap: spacing[2] + 1, padding: spacing[4] }}
        >
          <Text variant="bodyStrong" color="primaryStrong">
            Ativo no seu perfil
          </Text>
          {BENEFITS.map((benefit) => (
            <View key={benefit} style={{ flexDirection: "row", alignItems: "center", gap: spacing[2] + 1 }}>
              <CircleCheck size={15} color={colors.primaryStrong} />
              <Text variant="caption" color="textSecondary" style={{ flex: 1 }}>
                {benefit}
              </Text>
            </View>
          ))}
        </Card>

        {!canceled ? (
          <View style={{ gap: spacing[2] + 1 }}>
            <Button
              label="Cancelar assinatura"
              variant="secondary"
              icon={<CircleX size={17} color={colors.danger} />}
              onPress={cancel}
            />
            <Text variant="caption" color="textMuted" style={{ textAlign: "center" }}>
              Assinaturas cobradas pelo Google Play são canceladas na própria loja.
            </Text>
          </View>
        ) : (
          <View
            style={{
              backgroundColor: colors.accentSoft,
              borderRadius: radii.md,
              padding: spacing[4],
              gap: spacing[1],
            }}
          >
            <Text variant="bodyStrong" color="accent">
              Assinatura cancelada
            </Text>
            <Text variant="caption" color="textSecondary">
              Você continua com todos os benefícios até {formatDate(subscription.current_period_end)}. Depois
              disso, o perfil volta ao plano Grátis.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
