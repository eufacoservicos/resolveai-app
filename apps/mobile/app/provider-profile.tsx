import {
  setProviderCategories,
  updateProviderProfile,
  type Category,
} from "@eufaco/shared";
import { Button, Card, Text, Toggle, nativeFonts, useTheme } from "@eufaco/design-system/native";
import { useRouter } from "expo-router";
import { AtSign, Briefcase, MapPin, Phone, Plus, UserRound } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View } from "react-native";
import { AppBar } from "@/components/AppBar";
import { CategoryPicker } from "@/components/CategoryPicker";
import { Field } from "@/components/Field";
import { SignInPrompt } from "@/components/SignInPrompt";
import { useProviderAccount } from "@/hooks/useProviderAccount";
import { useSession } from "@/lib/session";
import { supabase } from "@/lib/supabase";

function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export default function ProviderProfileScreen() {
  const { colors, radii, spacing, layout } = useTheme();
  const router = useRouter();
  const { session, loading: sessionLoading } = useSession();
  const { provider, loading: accountLoading, refresh } = useProviderAccount();

  const [isActive, setIsActive] = useState(true);
  const [providerType, setProviderType] = useState<"individual" | "company">("individual");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [instagram, setInstagram] = useState("");
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!provider) return;
    setIsActive(provider.is_active);
    setProviderType(provider.provider_type);
    setDescription(provider.description ?? "");
    setCity(provider.city ?? "");
    setNeighborhood(provider.neighborhood ?? "");
    setWhatsapp(maskPhone(provider.whatsapp ?? ""));
    setInstagram(provider.instagram ?? "");
    setCategories(provider.categories ?? []);
    setCategoryIds((provider.categories ?? []).map((c) => c.id));
  }, [provider]);

  const submit = async () => {
    if (!provider) return;

    if (description.trim().length < 20) {
      return setError("Escreva ao menos 20 letras sobre o seu trabalho.");
    }
    if (!city.trim()) return setError("Informe a cidade onde você atende.");
    if (whatsapp.replace(/\D/g, "").length < 10) return setError("Informe um WhatsApp válido, com DDD.");
    if (categoryIds.length === 0) return setError("Escolha pelo menos uma categoria.");

    setSaving(true);
    setError(null);

    const { error: updateError } = await updateProviderProfile(supabase, provider.id, {
      description: description.trim(),
      city: city.trim(),
      neighborhood: neighborhood.trim(),
      whatsapp: whatsapp.replace(/\D/g, ""),
      instagram: instagram.trim() || null,
      provider_type: providerType,
      is_active: isActive,
    });

    if (!updateError) {
      await setProviderCategories(supabase, provider.id, categoryIds);
    }

    setSaving(false);

    if (updateError) {
      setError("Não foi possível salvar. Verifique sua conexão e tente de novo.");
      return;
    }
    refresh();
    router.back();
  };

  if (sessionLoading || accountLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <AppBar title="Perfil profissional" />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </View>
    );
  }

  if (!session) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <AppBar title="Perfil profissional" />
        <SignInPrompt
          title="Seu perfil profissional"
          description="Entre com sua conta para editar como você aparece na busca."
        />
      </View>
    );
  }

  if (!provider) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <AppBar title="Perfil profissional" />
        <View style={{ flex: 1, justifyContent: "center", paddingHorizontal: layout.screenPadding, gap: spacing[4] }}>
          <Card style={{ alignItems: "center", gap: spacing[2], paddingVertical: spacing[8] }}>
            <Text variant="title">Você ainda não é prestador</Text>
            <Text color="textSecondary" style={{ textAlign: "center" }}>
              Crie seu perfil profissional para aparecer na busca e receber orçamentos.
            </Text>
          </Card>
          <Button label="Criar meu perfil" onPress={() => router.replace("/become-provider")} />
        </View>
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
        <Card
          variant="plain"
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: spacing[3],
            backgroundColor: isActive ? colors.successSoft : colors.surface2,
            padding: spacing[4],
          }}
        >
          <View style={{ flex: 1, gap: 2 }}>
            <Text variant="title">Perfil visível na busca</Text>
            <Text variant="caption" color="textSecondary">
              Desative para pausar seu perfil
            </Text>
          </View>
          <Toggle accessibilityLabel="Perfil visível na busca" value={isActive} onValueChange={setIsActive} />
        </Card>

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
              placeholder="Conte sua experiência e como você atende."
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
              accessibilityLabel="Alterar categorias"
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
                Alterar
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={{ flexDirection: "row", gap: spacing[2] + 2 }}>
          <View style={{ flex: 1 }}>
            <Field label="Cidade" icon={MapPin} value={city} onChangeText={setCity} placeholder="Belo Horizonte" />
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
          label="Instagram (opcional)"
          icon={AtSign}
          value={instagram}
          onChangeText={setInstagram}
          placeholder="@seuperfil"
          autoCapitalize="none"
          error={error}
        />

        <Button label="Salvar alterações" loading={saving} onPress={() => void submit()} />
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
