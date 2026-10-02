import {
  createOffer,
  formatDiscount,
  getProviderOffers,
  setOfferActive,
  type DiscountType,
  type ProviderOffer,
  type RecommendedProvider,
} from "@eufaco/shared";
import {
  Badge,
  Button,
  Card,
  Text,
  fontSize,
  letterSpacing,
  lineHeight,
  nativeFonts,
  Toggle,
  useShadow,
  useTheme,
} from "@eufaco/design-system/native";
import { useRouter } from "expo-router";
import { ArrowRight, Banknote, Calendar, Percent, Sparkles, Tag } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";
import { AppBar } from "@/components/AppBar";
import { FeaturedCard } from "@/components/FeaturedCard";
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
  const segmentShadow = useShadow("hairline");
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

  // Espelho do card da busca com o que já foi digitado, para a pessoa
  // ver o desconto no lugar em que ele realmente aparece.
  const numericValue = Number(value.replace(",", "."));
  const preview: RecommendedProvider | null =
    provider && title.trim() && numericValue > 0
      ? {
          provider,
          offer: {
            id: "preview",
            provider_id: provider.id,
            title: title.trim(),
            discount_type: discountType,
            discount_value: discountType === "percent" ? numericValue : numericValue * 100,
            valid_until: parseDate(validUntil) ?? new Date().toISOString(),
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          coverUrl: provider.portfolio[0]?.image_url ?? null,
        }
      : null;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <AppBar title="Ofertas e descontos" />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: layout.screenPadding,
          paddingTop: 10,
          paddingBottom: 24,
          gap: 20,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Card
          variant="plain"
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            backgroundColor: isPro ? colors.primarySoft : colors.accentSoft,
            padding: 13,
            borderRadius: radii.md,
          }}
        >
          <Sparkles size={17} color={isPro ? colors.primaryStrong : colors.accent} />
          <Text
            variant="captionStrong"
            color="textSecondary"
            style={{ flex: 1, fontSize: fontSize.note, lineHeight: fontSize.note * lineHeight.snug }}
          >
            Recurso exclusivo do plano Profissional
          </Text>
          <Badge
            label={isPro ? "Ativo" : "Bloqueado"}
            tone={isPro ? "success" : "accent"}
            style={{ paddingVertical: 4, paddingHorizontal: 9 }}
          />
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
          <View style={{ gap: 10 }}>
            <Text variant="h3" style={{ fontSize: fontSize.subtitle }}>
              Oferta ativa
            </Text>
            <Card style={{ gap: 12, padding: 15, borderColor: colors.accent, borderWidth: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 11 }}>
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
                  <Text
                    style={{
                      color: "#FFFFFF",
                      fontFamily: nativeFonts.displayExtraBold,
                      fontSize: fontSize.base,
                    }}
                  >
                    {formatDiscount(activeOffer)}
                  </Text>
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text
                    variant="title"
                    style={{ fontSize: fontSize.base, letterSpacing: letterSpacing.subtle }}
                  >
                    {activeOffer.title}
                  </Text>
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
          <View style={{ gap: 14 }}>
            <Text variant="h3" style={{ fontSize: fontSize.subtitle }}>
              {activeOffer ? "Substituir por uma nova" : "Criar nova oferta"}
            </Text>

            <View style={{ gap: 7 }}>
              <Text variant="label" color="textSecondary">
                Tipo de desconto
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  gap: 4,
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
                      style={[
                        selected ? segmentShadow : null,
                        {
                          flex: 1,
                          height: 40,
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                          borderRadius: radii.full,
                          backgroundColor: selected ? colors.surface : "transparent",
                        },
                      ]}
                    >
                      <option.icon size={15} color={selected ? colors.primaryStrong : colors.textMuted} />
                      <Text
                        color={selected ? "textPrimary" : "textMuted"}
                        style={{
                          fontFamily: selected ? nativeFonts.bodyBold : nativeFonts.bodyMedium,
                          fontSize: fontSize.name,
                        }}
                      >
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={{ flexDirection: "row", gap: 10 }}>
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

            {preview ? (
              <View style={{ gap: 9 }}>
                <Text variant="label" color="textSecondary">
                  Como os clientes veem
                </Text>
                <View
                  style={{
                    alignItems: "center",
                    paddingVertical: 14,
                    borderRadius: radii.lg,
                    backgroundColor: colors.surface2,
                  }}
                >
                  <FeaturedCard item={preview} />
                </View>
              </View>
            ) : null}

            <Button
              label="Publicar oferta"
              loading={saving}
              icon={<ArrowRight size={18} color={colors.onPrimary} />}
              iconPosition="right"
              onPress={() => void submit()}
            />
          </View>
        ) : null}

        {offers.filter((o) => !o.is_active).length > 0 ? (
          <View style={{ gap: 10 }}>
            <Text variant="h3" style={{ fontSize: fontSize.subtitle }}>
              Encerradas
            </Text>
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
