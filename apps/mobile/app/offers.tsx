import {
  createOffer,
  formatDiscount,
  getProviderOffers,
  setOfferActive,
  type DiscountType,
  type ProviderOffer,
} from "@eufaco/shared";
import { Badge, Button, Card, Text, Toggle, useTheme } from "@eufaco/design-system/native";
import { useRouter } from "expo-router";
import { Banknote, Calendar, Percent, Sparkles, Tag } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";
import { AppBar } from "@/components/AppBar";
import { Field } from "@/components/Field";
import { SignInPrompt } from "@/components/SignInPrompt";
import { useProviderAccount } from "@/hooks/useProviderAccount";
import { useSession } from "@/lib/session";
import { supabase } from "@/lib/supabase";

/** Aceita 30/09/2026 e devolve no formato do banco. */
function parseDate(input: string): string | null {
  const match = input.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;
  const [, day, month, year] = match;
  const iso = `${year}-${month}-${day}`;
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return null;
  if (parsed < new Date(new Date().toDateString())) return null;
  return iso;
}

function formatValidUntil(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("pt-BR");
}

export default function OffersScreen() {
  const { colors, radii, spacing, layout } = useTheme();
  const router = useRouter();
  const { session, loading: sessionLoading } = useSession();
  const { provider, usage, loading: accountLoading } = useProviderAccount();

  const [offers, setOffers] = useState<ProviderOffer[]>([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [discountType, setDiscountType] = useState<DiscountType>("percent");
  const [value, setValue] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const providerId = provider?.id;

  useEffect(() => {
    if (!providerId) {
      setLoading(false);
      return;
    }
    let active = true;
    getProviderOffers(supabase, providerId)
      .then((result) => {
        if (active) setOffers(result);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [providerId]);

  const submit = async () => {
    if (!providerId) return;

    if (title.trim().length < 3) return setError("Dê um título de pelo menos 3 letras à oferta.");

    const numeric = Number(value.replace(",", "."));
    if (!numeric || numeric <= 0) return setError("Informe o valor do desconto.");
    if (discountType === "percent" && (numeric < 1 || numeric > 90)) {
      return setError("O desconto percentual vai de 1% a 90%.");
    }

    const isoDate = parseDate(validUntil);
    if (!isoDate) return setError("Informe a validade no formato DD/MM/AAAA, com data futura.");

    setSaving(true);
    setError(null);

    const { data, error: createError } = await createOffer(supabase, providerId, {
      title,
      discountType,
      // fixed guarda centavos para não trabalhar com float em dinheiro
      discountValue: discountType === "percent" ? Math.round(numeric) : Math.round(numeric * 100),
      validUntil: isoDate,
    });

    setSaving(false);

    if (createError || !data) {
      setError("Não foi possível publicar a oferta. Verifique sua conexão e tente de novo.");
      return;
    }

    setOffers((prev) => [data, ...prev.map((o) => ({ ...o, is_active: false }))]);
    setTitle("");
    setValue("");
    setValidUntil("");
  };

  const toggleOffer = (offer: ProviderOffer, next: boolean) => {
    setOffers((prev) => prev.map((o) => (o.id === offer.id ? { ...o, is_active: next } : o)));
    void setOfferActive(supabase, offer.id, next).then(({ error: toggleError }) => {
      if (toggleError) {
        setOffers((prev) => prev.map((o) => (o.id === offer.id ? { ...o, is_active: !next } : o)));
      }
    });
  };

  if (sessionLoading || accountLoading || loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <AppBar title="Ofertas e descontos" />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </View>
    );
  }

  if (!session) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <AppBar title="Ofertas e descontos" />
        <SignInPrompt
          title="Ofertas do seu perfil"
          description="Entre com sua conta de profissional para criar descontos."
        />
      </View>
    );
  }

  const isPro = usage?.plan === "pro";
  const activeOffer = offers.find((o) => o.is_active);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <AppBar title="Ofertas e descontos" />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: layout.screenPadding,
          paddingTop: spacing[3],
          paddingBottom: spacing[8],
          gap: spacing[5],
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Card
          variant="plain"
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: spacing[2] + 2,
            backgroundColor: isPro ? colors.primarySoft : colors.accentSoft,
            padding: spacing[3] + 1,
          }}
        >
          <Sparkles size={17} color={isPro ? colors.primaryStrong : colors.accent} />
          <Text variant="caption" color="textSecondary" style={{ flex: 1 }}>
            Recurso exclusivo do plano Profissional
          </Text>
          <Badge label={isPro ? "Ativo" : "Bloqueado"} tone={isPro ? "success" : "accent"} />
        </Card>

        {!isPro ? (
          <Card style={{ gap: spacing[3], alignItems: "center", paddingVertical: spacing[6] }}>
            <Text variant="title" style={{ textAlign: "center" }}>
              Ofertas são do plano Profissional
            </Text>
            <Text color="textSecondary" style={{ textAlign: "center" }}>
              Um desconto no seu perfil aparece no card da busca e chama atenção de quem está comparando.
            </Text>
            <Button label="Ver o plano" fullWidth={false} onPress={() => router.push("/plans")} />
          </Card>
        ) : null}

        {activeOffer ? (
          <View style={{ gap: spacing[3] }}>
            <Text variant="h3">Oferta ativa</Text>
            <Card style={{ gap: spacing[3], borderColor: colors.accent, borderWidth: 1.5 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: spacing[3] }}>
                <View
                  style={{
                    minWidth: 52,
                    height: 44,
                    paddingHorizontal: spacing[2],
                    borderRadius: 13,
                    backgroundColor: colors.accent,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text variant="title" style={{ color: "#FFFFFF" }}>
                    {formatDiscount(activeOffer)}
                  </Text>
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text variant="title">{activeOffer.title}</Text>
                  <Text variant="caption" color="textMuted">
                    Válida até {formatValidUntil(activeOffer.valid_until)}
                  </Text>
                </View>
                <Toggle
                  accessibilityLabel={`Oferta ${activeOffer.title}`}
                  value={activeOffer.is_active}
                  onValueChange={(next) => toggleOffer(activeOffer, next)}
                />
              </View>
            </Card>
          </View>
        ) : null}

        {isPro ? (
          <View style={{ gap: spacing[4] }}>
            <Text variant="h3">{activeOffer ? "Substituir por uma nova" : "Criar oferta"}</Text>

            <View style={{ gap: spacing[1] + 3 }}>
              <Text variant="label" color="textSecondary">
                Tipo de desconto
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  gap: spacing[1],
                  padding: 4,
                  borderRadius: radii.full,
                  backgroundColor: colors.surface2,
                }}
              >
                {(
                  [
                    { value: "percent" as const, label: "Percentual", icon: Percent },
                    { value: "fixed" as const, label: "Valor fixo", icon: Banknote },
                  ]
                ).map((option) => {
                  const selected = discountType === option.value;
                  return (
                    <Pressable
                      key={option.value}
                      accessibilityRole="radio"
                      accessibilityState={{ selected }}
                      onPress={() => setDiscountType(option.value)}
                      style={{
                        flex: 1,
                        height: 40,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: spacing[1] + 2,
                        borderRadius: radii.full,
                        backgroundColor: selected ? colors.surface : "transparent",
                      }}
                    >
                      <option.icon size={15} color={selected ? colors.primaryStrong : colors.textMuted} />
                      <Text variant="label" color={selected ? "textPrimary" : "textMuted"}>
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={{ flexDirection: "row", gap: spacing[2] + 2 }}>
              <View style={{ flex: 1 }}>
                <Field
                  label={discountType === "percent" ? "Desconto (%)" : "Desconto (R$)"}
                  icon={discountType === "percent" ? Percent : Banknote}
                  value={value}
                  onChangeText={setValue}
                  placeholder={discountType === "percent" ? "15" : "30,00"}
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Field
                  label="Válida até"
                  icon={Calendar}
                  value={validUntil}
                  onChangeText={setValidUntil}
                  placeholder="30/09/2026"
                  keyboardType="numbers-and-punctuation"
                />
              </View>
            </View>

            <Field
              label="Título da oferta"
              icon={Tag}
              value={title}
              onChangeText={setTitle}
              placeholder="Primeira visita"
              error={error}
            />

            <Button label="Publicar oferta" loading={saving} onPress={() => void submit()} />
          </View>
        ) : null}

        {offers.filter((o) => !o.is_active).length > 0 ? (
          <View style={{ gap: spacing[3] }}>
            <Text variant="h3">Encerradas</Text>
            {offers
              .filter((o) => !o.is_active)
              .map((offer) => (
                <Card key={offer.id} style={{ flexDirection: "row", alignItems: "center", gap: spacing[3] }}>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text variant="bodyStrong">{offer.title}</Text>
                    <Text variant="caption" color="textMuted">
                      {formatDiscount(offer)} · até {formatValidUntil(offer.valid_until)}
                    </Text>
                  </View>
                  {isPro ? (
                    <Toggle
                      accessibilityLabel={`Reativar ${offer.title}`}
                      value={false}
                      onValueChange={() => toggleOffer(offer, true)}
                    />
                  ) : null}
                </Card>
              ))}
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}
