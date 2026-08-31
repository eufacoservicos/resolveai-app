import { Button, Card, Text, useTheme } from "@eufaco/design-system/native";
import { useRouter } from "expo-router";
import { CircleAlert, CircleCheck } from "lucide-react-native";
import { ActivityIndicator, ScrollView, View } from "react-native";
import { AppBar } from "@/components/AppBar";
import { useProviderAccount } from "@/hooks/useProviderAccount";

const GAINS = [
  "Orçamentos ilimitados todo mês",
  "Destaque em Profissionais recomendados",
  "Ofertas e descontos no seu perfil",
];

/** Primeiro dia do mês que vem, quando a cota derivada zera. */
function nextRenewal(): string {
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return next.toLocaleDateString("pt-BR", { day: "numeric", month: "long" });
}

export default function QuotaReachedScreen() {
  const { colors, radii, spacing, layout } = useTheme();
  const router = useRouter();
  const { usage, loading } = useProviderAccount();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <AppBar />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </View>
    );
  }

  const used = usage?.used ?? 10;
  const quota = usage?.quota ?? 10;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <AppBar />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: spacing[6],
          paddingTop: spacing[3],
          paddingBottom: spacing[8],
          gap: spacing[5],
          alignItems: "center",
        }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            width: 76,
            height: 76,
            borderRadius: 24,
            backgroundColor: colors.accentSoft,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircleAlert size={33} color={colors.accent} />
        </View>

        <View style={{ gap: spacing[2], alignItems: "center" }}>
          <Text variant="h1" style={{ textAlign: "center" }}>
            Você atingiu os {quota} orçamentos
          </Text>
          <Text color="textSecondary" style={{ textAlign: "center" }}>
            Seu perfil continua visível na busca, mas o botão de orçamento fica pausado até{" "}
            {nextRenewal()}.
          </Text>
        </View>

        <Card style={{ alignSelf: "stretch", gap: spacing[3] }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text variant="label" color="textSecondary">
              Orçamentos deste mês
            </Text>
            <Text variant="title" color="accent">
              {used} / {quota}
            </Text>
          </View>
          <View style={{ height: 6, borderRadius: 3, backgroundColor: colors.surface3, overflow: "hidden" }}>
            <View style={{ height: 6, borderRadius: 3, backgroundColor: colors.accent, width: "100%" }} />
          </View>
        </Card>

        <View style={{ alignSelf: "stretch", gap: spacing[2] + 1 }}>
          {GAINS.map((gain) => (
            <View key={gain} style={{ flexDirection: "row", alignItems: "center", gap: spacing[2] + 1 }}>
              <CircleCheck size={15} color={colors.primaryStrong} />
              <Text variant="caption" color="textSecondary" style={{ flex: 1 }}>
                {gain}
              </Text>
            </View>
          ))}
        </View>

        <View style={{ alignSelf: "stretch", gap: spacing[2] }}>
          <Button label="Ver o plano Profissional" onPress={() => router.replace("/plans")} />
          <Button label="Aguardar renovação" variant="secondary" onPress={() => router.back()} />
        </View>
      </ScrollView>
    </View>
  );
}
