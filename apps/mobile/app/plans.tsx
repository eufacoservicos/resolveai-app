import {
  Badge,
  Button,
  Card,
  Text,
  fontSize,
  letterSpacing,
  lineHeight,
  nativeFonts,
  useShadow,
  useTheme,
} from "@eufaco/design-system/native";
import { useRouter } from "expo-router";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react-native";
import { ActivityIndicator, Alert, ScrollView, View } from "react-native";
import { AppBar } from "@/components/AppBar";
import { FeatureRow, type FeatureTone } from "@/components/FeatureRow";
import { SignInPrompt } from "@/components/SignInPrompt";
import { useProviderAccount } from "@/hooks/useProviderAccount";
import { useSession } from "@/lib/session";

const PRICE = "R$ 29,90";

interface Feature {
  label: string;
  tone: FeatureTone;
}

const FREE_FEATURES: Feature[] = [
  { label: "Perfil profissional completo", tone: "included" },
  { label: "Portfólio com até 10 fotos", tone: "included" },
  { label: "Máximo de 10 orçamentos por mês", tone: "limited" },
  { label: "Sem destaque na home", tone: "missing" },
];

const PRO_FEATURES: Feature[] = [
  { label: "Orçamentos ilimitados", tone: "highlight" },
  { label: "Destaque em Profissionais recomendados", tone: "highlight" },
  { label: "Ofertas e descontos no seu perfil", tone: "highlight" },
  { label: "Prioridade nos resultados de busca", tone: "highlight" },
  { label: "Selo de destaque no card", tone: "highlight" },
];

export default function PlansScreen() {
  const { colors, layout } = useTheme();
  const proShadow = useShadow("raised");
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
    <View style={{ gap: 9 }}>
      {features.map((feature) => (
        <FeatureRow key={feature.label} label={feature.label} tone={feature.tone} />
      ))}
    </View>
  );

  /** Nome do plano no cabeçalho do cartão. */
  const planName = (name: string) => (
    <Text
      variant="h2"
      style={{
        fontSize: fontSize.subtitle,
        letterSpacing: letterSpacing.snug,
        lineHeight: fontSize.subtitle * lineHeight.tight,
      }}
    >
      {name}
    </Text>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <AppBar title="Meu plano" />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: layout.screenPadding,
          paddingTop: 10,
          paddingBottom: 24,
          gap: 16,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ gap: 5 }}>
          <Text
            variant="h1"
            style={{ fontSize: 24, letterSpacing: letterSpacing.headline, lineHeight: 24 * 1.2 }}
          >
            Receba mais clientes
          </Text>
          <Text
            color="textSecondary"
            style={{ fontSize: fontSize.chip, lineHeight: fontSize.chip * lineHeight.normal }}
          >
            {!provider
              ? "Crie seu perfil profissional para começar a receber orçamentos."
              : usage && usage.quota !== null
                ? `Você usou ${usage.used} dos ${usage.quota} orçamentos do plano Grátis este mês.`
                : "Seus orçamentos são ilimitados neste plano."}
          </Text>
        </View>

        {/* Grátis */}
        <Card style={{ gap: 13, padding: 16 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View style={{ flex: 1, gap: 2 }}>
              {planName("Grátis")}
              <Text variant="caption" color="textMuted">
                R$ 0 · para sempre
              </Text>
            </View>
            {!isPro ? (
              <Badge
                label="Plano atual"
                tone="neutral"
                style={{ paddingVertical: 5, paddingHorizontal: 10 }}
              />
            ) : null}
          </View>
          <View style={{ height: 1, backgroundColor: colors.border }} />
          {renderFeatures(FREE_FEATURES)}
        </Card>

        {/* Profissional */}
        <Card
          style={[
            { gap: 13, padding: 16, borderColor: colors.primary, borderWidth: 1 },
            proShadow,
          ]}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View style={{ flex: 1, gap: 3 }}>
              {planName("Profissional")}
              <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 3 }}>
                <Text variant="h1">{PRICE}</Text>
                <Text
                  color="textMuted"
                  style={{
                    paddingBottom: 4,
                    fontFamily: nativeFonts.bodyMedium,
                    fontSize: fontSize.note,
                  }}
                >
                  /mês
                </Text>
              </View>
            </View>
            {isPro ? (
              <Badge
                label="Plano atual"
                tone="success"
                style={{ paddingVertical: 5, paddingHorizontal: 10 }}
              />
            ) : (
              <Badge
                label="Recomendado"
                tone="primarySolid"
                icon={<Sparkles size={11} color={colors.onPrimary} />}
                style={{ paddingVertical: 5, paddingHorizontal: 10, gap: 4 }}
              />
            )}
          </View>

          <View style={{ height: 1, backgroundColor: colors.border }} />
          {renderFeatures(PRO_FEATURES)}

          {isPro ? (
            <Button
              label="Gerenciar assinatura"
              variant="secondary"
              onPress={() => router.push("/subscription")}
            />
          ) : (
            <Button
              label="Assinar agora"
              icon={<ArrowRight size={18} color={colors.onPrimary} />}
              iconPosition="right"
              onPress={startSubscription}
            />
          )}
        </Card>

        <View
          style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 6 }}
        >
          <ShieldCheck size={13} color={colors.textMuted} />
          <Text variant="caption" color="textMuted">
            Cancele quando quiser, sem multa
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
