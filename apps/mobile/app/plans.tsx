import { Badge, Button, Card, Text, useTheme } from "@eufaco/design-system/native";
import { useRouter } from "expo-router";
import { CircleAlert, CircleCheck, ShieldCheck, Sparkles, X } from "lucide-react-native";
import type { ComponentType } from "react";
import { ActivityIndicator, Alert, ScrollView, View } from "react-native";
import { AppBar } from "@/components/AppBar";
import { SignInPrompt } from "@/components/SignInPrompt";
import { useProviderAccount } from "@/hooks/useProviderAccount";
import { useSession } from "@/lib/session";
import type { ColorToken } from "@eufaco/design-system";

const PRICE = "R$ 29,90";

interface Feature {
  label: string;
  icon: ComponentType<{ size?: number; color?: string }>;
  tone: ColorToken;
}

const FREE_FEATURES: Feature[] = [
  { label: "Perfil profissional completo", icon: CircleCheck, tone: "success" },
  { label: "Portfólio com até 10 fotos", icon: CircleCheck, tone: "success" },
  { label: "Máximo de 10 orçamentos por mês", icon: CircleAlert, tone: "accent" },
  { label: "Sem destaque na home", icon: X, tone: "textMuted" },
];

const PRO_FEATURES: Feature[] = [
  { label: "Orçamentos ilimitados", icon: CircleCheck, tone: "primaryStrong" },
  { label: "Destaque em Profissionais recomendados", icon: CircleCheck, tone: "primaryStrong" },
  { label: "Ofertas e descontos no seu perfil", icon: CircleCheck, tone: "primaryStrong" },
  { label: "Prioridade nos resultados de busca", icon: CircleCheck, tone: "primaryStrong" },
];

export default function PlansScreen() {
  const { colors, spacing, layout } = useTheme();
  const router = useRouter();
  const { session, loading: sessionLoading } = useSession();
  const { provider, usage, loading } = useProviderAccount();

  const startSubscription = () => {
    // A cobrança de assinatura dentro do app precisa passar pelo Google Play
    // Billing. Enquanto o produto não estiver configurado no Play Console,
    // é melhor dizer isso do que abrir um checkout que a loja recusaria.
    Alert.alert(
      "Assinatura em preparação",
      "Estamos finalizando o pagamento pelo Google Play. Avisamos assim que estiver disponível.",
    );
  };

  if (sessionLoading || loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <AppBar title="Meu plano" />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </View>
    );
  }

  if (!session) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <AppBar title="Meu plano" />
        <SignInPrompt
          title="Planos para profissionais"
          description="Entre com sua conta para ver o plano em vigor e assinar o Profissional."
        />
      </View>
    );
  }

  const isPro = usage?.plan === "pro";

  const renderFeatures = (features: Feature[]) => (
    <View style={{ gap: spacing[2] + 1 }}>
      {features.map((feature) => (
        <View key={feature.label} style={{ flexDirection: "row", alignItems: "center", gap: spacing[2] + 1 }}>
          <feature.icon size={15} color={colors[feature.tone]} />
          <Text variant="caption" color="textSecondary" style={{ flex: 1 }}>
            {feature.label}
          </Text>
        </View>
      ))}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <AppBar title="Meu plano" />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: layout.screenPadding,
          paddingTop: spacing[3],
          paddingBottom: spacing[8],
          gap: spacing[4],
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ gap: spacing[2] }}>
          <Text variant="h1">Receba mais clientes</Text>
          {!provider ? (
            <Text color="textSecondary">
              Crie seu perfil profissional para começar a receber orçamentos.
            </Text>
          ) : usage && usage.quota !== null ? (
            <Text color="textSecondary">
              Você usou {usage.used} dos {usage.quota} orçamentos do plano Grátis este mês.
            </Text>
          ) : (
            <Text color="textSecondary">Seus orçamentos são ilimitados neste plano.</Text>
          )}
        </View>

        {/* Grátis */}
        <Card style={{ gap: spacing[3], padding: spacing[4] }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing[2] }}>
            <View style={{ flex: 1, gap: 2 }}>
              <Text variant="h3">Grátis</Text>
              <Text variant="caption" color="textMuted">
                R$ 0 · para sempre
              </Text>
            </View>
            {!isPro ? <Badge label="Plano atual" tone="neutral" /> : null}
          </View>
          <View style={{ height: 1, backgroundColor: colors.border }} />
          {renderFeatures(FREE_FEATURES)}
        </Card>

        {/* Profissional */}
        <Card
          style={{
            gap: spacing[3],
            padding: spacing[4],
            borderColor: colors.primary,
            borderWidth: 2,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing[2] }}>
            <View style={{ flex: 1, gap: 3 }}>
              <Text variant="h3">Profissional</Text>
              <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 3 }}>
                <Text variant="h1">{PRICE}</Text>
                <Text variant="caption" color="textMuted" style={{ paddingBottom: 4 }}>
                  /mês
                </Text>
              </View>
            </View>
            {isPro ? <Badge label="Plano atual" tone="success" /> : <Badge label="Recomendado" tone="primary" />}
          </View>

          <View style={{ height: 1, backgroundColor: colors.border }} />
          {renderFeatures(PRO_FEATURES)}

          {isPro ? (
            <Button label="Gerenciar assinatura" variant="secondary" onPress={() => router.push("/subscription")} />
          ) : (
            <Button
              label="Assinar agora"
              icon={<Sparkles size={18} color={colors.onPrimary} />}
              onPress={startSubscription}
            />
          )}
        </Card>

        <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", gap: spacing[1] + 2 }}>
          <ShieldCheck size={13} color={colors.textMuted} />
          <Text variant="caption" color="textMuted">
            Cancele quando quiser, sem multa
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
