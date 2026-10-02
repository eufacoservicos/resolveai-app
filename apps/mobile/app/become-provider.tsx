import {
  createProviderProfile,
  formatCpf,
  isValidCpf,
  setProviderCategories,
  type Category,
} from "@eufaco/shared";
import {
  Badge,
  Button,
  Card,
  Text,
  fontSize,
  lineHeight,
  nativeFonts,
  useTheme,
} from "@eufaco/design-system/native";
import { useRouter } from "expo-router";
import {
  ArrowRight,
  BadgeCheck,
  Briefcase,
  Clock3,
  CreditCard,
  MapPin,
  MessageCircle,
  Phone,
  Plus,
  Sparkles,
  UserRound,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View } from "react-native";
import { AppBar } from "@/components/AppBar";
import { InfoCard } from "@/components/InfoCard";
import { CategoryPicker } from "@/components/CategoryPicker";
import { Field } from "@/components/Field";
import { SignInPrompt } from "@/components/SignInPrompt";
import { useSession } from "@/lib/session";
import { supabase } from "@/lib/supabase";

const BENEFITS = [
  { title: "Perfil profissional gratuito", desc: "Fotos, descrição, categorias e horários", icon: BadgeCheck },
  { title: "Clientes perto de você", desc: "Aparece para quem busca no seu bairro", icon: MapPin },
  { title: "Contato direto no WhatsApp", desc: "Sem intermediários e sem comissão", icon: MessageCircle },
];

/** (31) 99876-5432 enquanto digita. */
function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export default function BecomeProviderScreen() {
  const { colors, radii, spacing, layout } = useTheme();
  const router = useRouter();
  const { session, loading: sessionLoading } = useSession();

  const [started, setStarted] = useState(false);
  const [providerType, setProviderType] = useState<"individual" | "company">("individual");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [cpf, setCpf] = useState("");

  // Telefone e CPF podem ter vindo do passo 1 (Completar Perfil)
  useEffect(() => {
    const meta = session?.user.user_metadata as { phone?: string; cpf?: string } | undefined;
    if (meta?.phone) setWhatsapp((current) => current || meta.phone!);
    if (meta?.cpf) setCpf((current) => current || meta.cpf!);
  }, [session]);
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!session) return;

    if (description.trim().length < 20) {
      return setError("Escreva ao menos 20 letras sobre o seu trabalho — é o que convence o cliente.");
    }
    if (!city.trim()) return setError("Informe a cidade onde você atende.");
    if (whatsapp.replace(/\D/g, "").length < 10) {
      return setError("Informe um WhatsApp válido, com DDD.");
    }
    if (cpf.trim() && !isValidCpf(cpf)) return setError("O CPF informado não é válido.");
    if (categoryIds.length === 0) return setError("Escolha pelo menos uma categoria de serviço.");

    setSaving(true);
    setError(null);

    const { error: createError, profileId } = await createProviderProfile(supabase, session.user.id, {
      description: description.trim(),
      city: city.trim(),
      neighborhood: neighborhood.trim(),
      whatsapp: whatsapp.replace(/\D/g, ""),
      cpf: cpf.replace(/\D/g, ""),
      provider_type: providerType,
    });

    if (createError || !profileId) {
      setSaving(false);
      setError("Não foi possível criar seu perfil. Verifique sua conexão e tente de novo.");
      return;
    }

    await setProviderCategories(supabase, profileId, categoryIds);
    setSaving(false);
    router.replace("/profile");
  };

  if (sessionLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <AppBar />
      </View>
    );
  }

  if (!session) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <AppBar />
        <SignInPrompt
          title="Crie seu perfil profissional"
          description="Entre com sua conta para começar a receber clientes da sua região."
        />
      </View>
    );
  }

  // Primeira etapa: convencer antes de pedir dados
  if (!started) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <AppBar />
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: spacing[6],
            paddingTop: 12,
            paddingBottom: 28,
            gap: 24,
          }}
          showsVerticalScrollIndicator={false}
        >
          <Badge
            label="100% grátis"
            tone="success"
            icon={<Sparkles size={13} color={colors.success} />}
            style={{ paddingVertical: 6, paddingLeft: 12, paddingRight: 12, gap: 6 }}
          />

          <View style={{ gap: 7 }}>
            <Text
              variant="h1"
              style={{
                fontSize: fontSize.hero,
                letterSpacing: -1,
                lineHeight: fontSize.hero * 1.18,
              }}
            >
              Comece a receber clientes da sua região
            </Text>
            <Text
              color="textSecondary"
              style={{ fontSize: fontSize.base, lineHeight: fontSize.base * lineHeight.normal }}
            >
              Crie seu perfil profissional e apareça para quem está procurando o seu serviço agora.
            </Text>
          </View>

          <View style={{ gap: 10 }}>
            {BENEFITS.map((benefit) => (
              <InfoCard
                key={benefit.title}
                icon={benefit.icon}
                title={benefit.title}
                description={benefit.desc}
              />
            ))}
          </View>

          <Button
            label="Criar meu perfil"
            icon={<ArrowRight size={18} color={colors.onPrimary} />}
            iconPosition="right"
            onPress={() => setStarted(true)}
          />

          <View
            style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 6 }}
          >
            <Clock3 size={13} color={colors.textMuted} />
            <Text color="textMuted" style={{ fontSize: fontSize.note }}>
              Leva menos de 3 minutos
            </Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <AppBar title="Perfil profissional" />
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
        <View style={{ gap: spacing[1] + 3 }}>
          <Text variant="label" color="textSecondary">
            Tipo de cadastro
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
                { value: "individual" as const, label: "Autônomo", icon: UserRound },
                { value: "company" as const, label: "Empresa", icon: Briefcase },
              ]
            ).map((option) => {
              const selected = providerType === option.value;
              return (
                <Pressable
                  key={option.value}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  onPress={() => setProviderType(option.value)}
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

        <View style={{ gap: spacing[1] + 3 }}>
          <Text variant="label" color="textSecondary">
            Descrição do seu trabalho
          </Text>
          <View
            style={{
              minHeight: 110,
              borderRadius: radii.md,
              backgroundColor: colors.surface,
              borderWidth: 1.5,
              borderColor: colors.border,
              padding: spacing[3] + 2,
            }}
          >
            <TextInput
              value={description}
              onChangeText={(text) => setDescription(text.slice(0, 600))}
              placeholder="Conte sua experiência, o que você faz e como atende. Isso é o que o cliente lê primeiro."
              placeholderTextColor={colors.textMuted}
              multiline
              textAlignVertical="top"
              accessibilityLabel="Descrição do seu trabalho"
              style={{
                flex: 1,
                color: colors.textPrimary,
                fontFamily: nativeFonts.bodyRegular,
                fontSize: 13.5,
                lineHeight: 20,
              }}
            />
          </View>
        </View>

        <View style={{ gap: spacing[2] + 1 }}>
          <Text variant="label" color="textSecondary">
            Categorias (até 5)
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing[2] }}>
            {categories.map((category) => (
              <View
                key={category.id}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderRadius: radii.full,
                  backgroundColor: colors.primarySoft,
                }}
              >
                <Text variant="label" color="primaryStrong">
                  {category.name}
                </Text>
              </View>
            ))}

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Adicionar categoria"
              onPress={() => setPickerOpen(true)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: spacing[1] + 1,
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: radii.full,
                backgroundColor: colors.surface,
                borderWidth: 1.5,
                borderColor: colors.borderStrong,
              }}
            >
              <Plus size={13} color={colors.textSecondary} />
              <Text variant="label" color="textSecondary">
                {categories.length > 0 ? "Alterar" : "Adicionar"}
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={{ flexDirection: "row", gap: spacing[2] + 2 }}>
          <View style={{ flex: 1 }}>
            <Field
              label="Cidade"
              icon={MapPin}
              value={city}
              onChangeText={setCity}
              placeholder="Belo Horizonte"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Field
              label="Bairro"
              icon={MapPin}
              value={neighborhood}
              onChangeText={setNeighborhood}
              placeholder="Savassi"
            />
          </View>
        </View>

        <Field
          label="WhatsApp"
          icon={Phone}
          value={whatsapp}
          onChangeText={(text) => setWhatsapp(maskPhone(text))}
          placeholder="(31) 99876-5432"
          keyboardType="phone-pad"
        />

        <Field
          label={providerType === "company" ? "CNPJ (opcional)" : "CPF (opcional)"}
          icon={CreditCard}
          value={cpf}
          onChangeText={(text) => setCpf(providerType === "company" ? text : formatCpf(text))}
          placeholder={providerType === "company" ? "00.000.000/0000-00" : "123.456.789-00"}
          keyboardType="number-pad"
          error={error}
        />

        <Button label="Publicar meu perfil" loading={saving} onPress={() => void submit()} />

        <Text variant="caption" color="textMuted" style={{ textAlign: "center" }}>
          Você pode editar tudo depois, inclusive portfólio e horários.
        </Text>
      </ScrollView>

      <CategoryPicker
        visible={pickerOpen}
        selected={categoryIds}
        onClose={() => setPickerOpen(false)}
        onApply={(ids, chosen) => {
          setCategoryIds(ids);
          setCategories(chosen);
          setPickerOpen(false);
          setError(null);
        }}
      />
    </KeyboardAvoidingView>
  );
}
