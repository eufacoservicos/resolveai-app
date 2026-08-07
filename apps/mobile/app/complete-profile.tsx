import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { Search as SearchIcon, Wrench } from "lucide-react-native";
import { toast } from "sonner-native";
import {
  acceptTerms,
  createCustomCategory,
  createProviderProfile,
  setProviderCategories,
} from "@resolveai/shared/supabase/mutations";
import { getCategories } from "@resolveai/shared/supabase/queries";
import { formatWhatsApp } from "@resolveai/shared/phone";
import { isValidCpf } from "@resolveai/shared/validators/cpf";
import { isValidCnpj } from "@resolveai/shared/validators/cnpj";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-provider";
import { formatAddressLine, useCepLookup } from "@/lib/use-cep-lookup";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CategoryMultiSelect,
  type Category,
} from "@/components/ui/category-multi-select";
import {
  DocumentInput,
  getDocumentType,
  type ProviderType,
} from "@/components/ui/document-input";
import { AmbientBg } from "@/components/ui/ambient-bg";
import { Display, Muted, Text } from "@/components/ui/text";
import { cn } from "@resolveai/shared/cn";

type Role = "CLIENT" | "PROVIDER";

/** Formato salvo em user_metadata.provider_data pelo cadastro por email */
type ProviderMetadata = {
  description?: string;
  cpf?: string;
  provider_type?: ProviderType;
  whatsapp?: string;
  cep?: string;
  city?: string;
  state?: string;
  neighborhood?: string;
  latitude?: number | null;
  longitude?: number | null;
  categoryIds?: string[];
};

/**
 * Onboarding pos-login (fluxo OAuth), portado de (auth)/complete-profile do PWA.
 *
 * Fica na raiz e nao em (auth) porque o layout (auth) do mobile redireciona
 * quem ja tem sessao para /home — e esta tela so faz sentido logado.
 */
export default function CompleteProfileScreen() {
  const { user: authUser, loading: authLoading } = useAuth();

  const [role, setRole] = useState<Role>("CLIENT");
  const [providerType, setProviderType] = useState<ProviderType>("individual");
  const [document, setDocument] = useState("");
  const [description, setDescription] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [autoSubmitting, setAutoSubmitting] = useState(false);
  const [customCategories, setCustomCategories] = useState<Category[]>([]);

  const { cep, setCep, cepLoading, addressInfo, setAddressInfo } = useCepLookup();
  const hydratedRef = useRef(false);

  const userName =
    (authUser?.user_metadata?.full_name as string | undefined) ??
    (authUser?.user_metadata?.name as string | undefined) ??
    "";

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories(supabase),
    enabled: role === "PROVIDER",
  });

  const categories = [
    ...((categoriesQuery.data ?? []) as Category[]),
    ...customCategories,
  ].sort((a, b) => a.name.localeCompare(b.name));

  useEffect(() => {
    if (!authLoading && !authUser) router.replace("/login");
  }, [authLoading, authUser]);

  // Pre-preenchimento vindo do cadastro por email: o registro salva os dados do
  // prestador em user_metadata.provider_data. Se ja vier tudo, completa sozinho.
  useEffect(() => {
    if (!authUser || hydratedRef.current) return;
    hydratedRef.current = true;

    const providerData = authUser.user_metadata?.provider_data as
      | ProviderMetadata
      | null
      | undefined;
    if (!providerData) return;

    setRole("PROVIDER");
    setDescription(providerData.description ?? "");
    if (providerData.cpf) setDocument(providerData.cpf);

    if (
      providerData.provider_type === "individual" ||
      providerData.provider_type === "company"
    ) {
      setProviderType(providerData.provider_type);
    } else if ((providerData.cpf ?? "").replace(/\D/g, "").length === 14) {
      setProviderType("company");
    }

    setWhatsapp(formatWhatsApp(providerData.whatsapp ?? ""));
    setSelectedCategories(providerData.categoryIds ?? []);

    if (providerData.city) {
      setAddressInfo({
        city: providerData.city,
        state: providerData.state ?? "",
        neighborhood: providerData.neighborhood ?? "",
        latitude: providerData.latitude ?? null,
        longitude: providerData.longitude ?? null,
      });
    }

    if (
      providerData.whatsapp &&
      providerData.city &&
      (providerData.categoryIds?.length ?? 0) > 0
    ) {
      setAutoSubmitting(true);
      void autoCompleteProfile(authUser.id, providerData);
    }
  }, [authUser]);

  async function autoCompleteProfile(uid: string, data: ProviderMetadata) {
    try {
      // A trigger do banco (migration-v7) pode ja ter populado o perfil
      const { data: existingProfile } = await supabase
        .from("provider_profiles")
        .select("id, whatsapp")
        .eq("user_id", uid)
        .single();

      if (existingProfile?.whatsapp) {
        await acceptTerms(supabase, uid);
        await supabase.auth.updateUser({ data: { provider_data: null } });
        toast.success("Perfil configurado com sucesso!");
        router.replace("/home");
        return;
      }

      const { error, profileId } = await createProviderProfile(supabase, uid, {
        description: data.description ?? "",
        cpf: data.cpf ?? "",
        provider_type: data.provider_type,
        city: data.city!,
        neighborhood: data.neighborhood ?? "",
        cep: data.cep ?? "",
        state: data.state ?? "",
        latitude: data.latitude ?? null,
        longitude: data.longitude ?? null,
        whatsapp: data.whatsapp!,
      });

      if (error || !profileId) {
        setAutoSubmitting(false);
        return;
      }

      if ((data.categoryIds?.length ?? 0) > 0) {
        await setProviderCategories(supabase, profileId, data.categoryIds!);
      }

      await supabase.auth.updateUser({ data: { provider_data: null } });

      toast.success("Perfil configurado com sucesso!");
      router.replace("/home");
    } catch {
      // Cai de volta para o formulario manual
      setAutoSubmitting(false);
    }
  }

  async function handleAddCustomCategory(name: string) {
    const { data, error } = await createCustomCategory(supabase, name);
    if (error || !data) {
      toast.error("Erro ao adicionar categoria.");
      return null;
    }
    const created = data as Category;
    setCustomCategories((prev) => [...prev, created]);
    return created;
  }

  async function handleSubmit() {
    if (!authUser) return;

    if (role === "PROVIDER") {
      const rawDoc = document.replace(/\D/g, "");
      const docType = getDocumentType(providerType);
      const isValid = docType === "cpf" ? isValidCpf(rawDoc) : isValidCnpj(rawDoc);
      if (!rawDoc || !isValid) {
        toast.error(`Informe um ${docType.toUpperCase()} válido.`);
        return;
      }
      const rawWa = whatsapp.replace(/\D/g, "");
      if (!rawWa || rawWa.length < 10) {
        toast.error("Informe um WhatsApp válido com DDD.");
        return;
      }
      if (selectedCategories.length === 0) {
        toast.error("Selecione pelo menos uma categoria.");
        return;
      }
      if (!addressInfo) {
        toast.error("Informe um CEP válido para localizarmos sua região.");
        return;
      }
    }

    setLoading(true);

    const { error: termsError } = await acceptTerms(supabase, authUser.id);
    if (termsError) {
      toast.error("Erro ao aceitar os termos. Tente novamente.");
      setLoading(false);
      return;
    }

    if (role === "CLIENT") {
      router.replace("/home");
      return;
    }

    const { error, profileId } = await createProviderProfile(
      supabase,
      authUser.id,
      {
        description,
        cpf: document.replace(/\D/g, ""),
        provider_type: providerType,
        city: addressInfo!.city,
        neighborhood: addressInfo!.neighborhood,
        cep: cep.replace(/\D/g, ""),
        state: addressInfo!.state,
        latitude: addressInfo!.latitude,
        longitude: addressInfo!.longitude,
        whatsapp: whatsapp.replace(/\D/g, ""),
      }
    );

    if (error || !profileId) {
      toast.error("Erro ao criar perfil de prestador.");
      setLoading(false);
      return;
    }

    if (selectedCategories.length > 0) {
      await setProviderCategories(supabase, profileId, selectedCategories);
    }

    // Limpa o provider_data do metadata, como no PWA
    await supabase.auth.updateUser({ data: { provider_data: null } });

    toast.success("Perfil configurado com sucesso!");
    router.replace("/home");
    setLoading(false);
  }

  if (authLoading || autoSubmitting) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#22d3ee" />
        {autoSubmitting && (
          <Muted className="mt-4">Configurando seu perfil...</Muted>
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="absolute inset-x-0 top-0 h-[360px]">
        <AmbientBg />
      </View>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-6">
          <Display className="text-[30px] leading-[32px]">
            Complete seu{"\n"}
            <Text className="text-[30px] font-black text-primary">perfil.</Text>
          </Display>
          <Muted className="mt-3 text-base">
            {userName ? `Olá, ${userName}! ` : ""}Como deseja usar o eufaço!?
          </Muted>
        </View>

        <View className="gap-5 rounded-3xl border border-white/10 bg-card/60 p-6">
          <View className="gap-2">
            <Label className="text-sm font-medium">Eu quero...</Label>
            <View className="flex-row gap-3">
              <RoleOption
                active={role === "CLIENT"}
                icon={SearchIcon}
                title="Quero contratar"
                subtitle="Busco serviços"
                onPress={() => setRole("CLIENT")}
              />
              <RoleOption
                active={role === "PROVIDER"}
                icon={Wrench}
                title="Quero oferecer"
                subtitle="Ofereço serviços"
                onPress={() => setRole("PROVIDER")}
              />
            </View>
          </View>

          {role === "PROVIDER" && (
            <View className="gap-4 rounded-2xl border border-primary/25 bg-primary/10 p-5">
              <Text className="text-xs font-bold uppercase tracking-wider text-primary">
                Dados do prestador
              </Text>

              <DocumentInput
                providerType={providerType}
                onProviderTypeChange={setProviderType}
                value={document}
                onChange={setDocument}
              />

              <View className="gap-1.5">
                <Label className="text-sm font-medium">
                  WhatsApp (DDD + número) *
                </Label>
                <Input
                  placeholder="(11) 99999-9999"
                  value={whatsapp}
                  onChangeText={(v) =>
                    setWhatsapp(formatWhatsApp(v.replace(/\D/g, "").slice(0, 11)))
                  }
                  keyboardType="phone-pad"
                  className="bg-card"
                />
              </View>

              <View className="gap-1.5">
                <Label className="text-sm font-medium">CEP *</Label>
                <View className="justify-center">
                  <Input
                    placeholder="00000-000"
                    value={cep}
                    onChangeText={(v) => void setCep(v)}
                    keyboardType="number-pad"
                    maxLength={9}
                    className="bg-card"
                  />
                  {cepLoading && (
                    <View className="absolute right-3">
                      <ActivityIndicator size="small" color="#8891a4" />
                    </View>
                  )}
                </View>
                {addressInfo && (
                  <Muted className="text-xs">
                    {formatAddressLine(addressInfo)}
                  </Muted>
                )}
              </View>

              <View className="gap-1.5">
                <Label className="text-sm font-medium">
                  Descrição dos serviços
                </Label>
                <Textarea
                  placeholder="Descreva seus serviços e experiência..."
                  value={description}
                  onChangeText={setDescription}
                  rows={3}
                  className="bg-card"
                />
              </View>

              <View className="gap-1.5">
                <Label className="text-sm font-medium">
                  Categorias de serviço
                </Label>
                {categoriesQuery.isLoading ? (
                  <View className="flex-row items-center gap-2 py-3">
                    <ActivityIndicator size="small" color="#8891a4" />
                    <Muted>Carregando categorias...</Muted>
                  </View>
                ) : categories.length === 0 ? (
                  <Muted className="py-2">
                    Nenhuma categoria disponível. Tente novamente mais tarde.
                  </Muted>
                ) : (
                  <CategoryMultiSelect
                    categories={categories}
                    selected={selectedCategories}
                    onChange={setSelectedCategories}
                    onAddCustom={handleAddCustomCategory}
                  />
                )}
              </View>
            </View>
          )}

          <View className="flex-row items-start gap-2.5">
            <View className="mt-0.5">
              <Checkbox
                checked={acceptedTerms}
                onCheckedChange={setAcceptedTerms}
                accessibilityLabel="Aceitar termos"
              />
            </View>
            <Muted className="flex-1 text-xs leading-relaxed">
              Li e aceito os{" "}
              <Text
                className="text-xs text-primary"
                onPress={() => router.push("/terms")}
              >
                Termos de Uso
              </Text>{" "}
              e a{" "}
              <Text
                className="text-xs text-primary"
                onPress={() => router.push("/privacy")}
              >
                Política de Privacidade
              </Text>
              .
            </Muted>
          </View>

          <Button
            variant="gradient"
            size="lg"
            onPress={handleSubmit}
            loading={loading}
            disabled={!acceptedTerms}
            className="w-full"
          >
            Continuar
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function RoleOption({
  active,
  icon: Icon,
  title,
  subtitle,
  onPress,
}: {
  active: boolean;
  icon: typeof Wrench;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={cn(
        "flex-1 items-center gap-2 rounded-2xl border p-4",
        active
          ? "border-primary/60 bg-primary/10"
          : "border-white/10 bg-white/[0.03]"
      )}
    >
      <View
        className={cn(
          "h-11 w-11 items-center justify-center rounded-xl",
          active ? "bg-primary/20" : "bg-white/5"
        )}
      >
        <Icon size={22} color={active ? "#22d3ee" : "#8891a4"} />
      </View>
      <View className="items-center">
        <Text
          className={cn(
            "text-center text-sm font-bold",
            active ? "text-primary" : "text-foreground"
          )}
        >
          {title}
        </Text>
        <Muted className="mt-0.5 text-center text-xs">{subtitle}</Muted>
      </View>
    </Pressable>
  );
}
