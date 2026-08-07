import { useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { router } from "expo-router";
import { ArrowLeft, Save } from "lucide-react-native";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner-native";
import {
  createCustomCategory,
  setProviderCategories,
  updateProviderProfile,
} from "@resolveai/shared/supabase/mutations";
import { formatWhatsApp, isValidWhatsApp, unformatWhatsApp } from "@resolveai/shared/phone";
import { isValidCpf } from "@resolveai/shared/validators/cpf";
import { isValidCnpj } from "@resolveai/shared/validators/cnpj";
import { supabase } from "@/lib/supabase";
import { formatAddressLine, useCepLookup } from "@/lib/use-cep-lookup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { Text, Muted } from "@/components/ui/text";

export type ProviderProfileFormData = {
  id: string;
  description: string | null;
  city: string;
  neighborhood: string | null;
  cep: string | null;
  state: string | null;
  latitude: number | null;
  longitude: number | null;
  whatsapp: string | null;
  cpf: string | null;
  provider_type: "individual" | "company" | null;
  instagram: string | null;
  is_active: boolean;
  categories: Category[];
};

type Props = {
  profile: ProviderProfileFormData;
  categories: Category[];
};

export function ProviderProfileForm({
  profile,
  categories: initialCategories,
}: Props) {
  const queryClient = useQueryClient();

  const [allCategories, setAllCategories] = useState(initialCategories);
  const [description, setDescription] = useState(profile.description ?? "");
  const [whatsapp, setWhatsapp] = useState(
    formatWhatsApp(profile.whatsapp ?? "")
  );
  const [providerType, setProviderType] = useState<ProviderType>(
    profile.provider_type ??
      (profile.cpf && profile.cpf.replace(/\D/g, "").length === 14
        ? "company"
        : "individual")
  );
  const [document, setDocument] = useState(profile.cpf ?? "");
  const [instagram, setInstagram] = useState(profile.instagram ?? "");
  const [isActive, setIsActive] = useState(profile.is_active);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    profile.categories.map((c) => c.id)
  );
  const [loading, setLoading] = useState(false);

  const { cep, setCep, cepLoading, addressInfo } = useCepLookup(
    profile.city
      ? {
          city: profile.city,
          state: profile.state ?? "",
          neighborhood: profile.neighborhood ?? "",
          latitude: profile.latitude,
          longitude: profile.longitude,
        }
      : null,
    profile.cep ?? ""
  );

  async function handleAddCustomCategory(name: string) {
    const { data, error } = await createCustomCategory(supabase, name);
    if (error || !data) {
      toast.error("Erro ao adicionar categoria.");
      return null;
    }
    const created = data as Category;
    setAllCategories((prev) =>
      [...prev, created].sort((a, b) => a.name.localeCompare(b.name))
    );
    return created;
  }

  async function handleSubmit() {
    const rawDoc = document.replace(/\D/g, "");
    const rawWhatsapp = unformatWhatsApp(whatsapp);

    const docType = getDocumentType(providerType);
    const isValid = docType === "cpf" ? isValidCpf(rawDoc) : isValidCnpj(rawDoc);
    if (!rawDoc || !isValid) {
      toast.error(
        `Informe um ${docType.toUpperCase()} válido. Este campo é obrigatório.`
      );
      return;
    }

    if (rawWhatsapp && !isValidWhatsApp(rawWhatsapp)) {
      toast.error("WhatsApp inválido. Informe DDD + número (10 ou 11 dígitos).");
      return;
    }

    if (selectedCategories.length === 0) {
      toast.error("Selecione pelo menos uma categoria de serviço.");
      return;
    }

    setLoading(true);

    const { error: profileError } = await updateProviderProfile(
      supabase,
      profile.id,
      {
        description,
        city: addressInfo?.city ?? "",
        neighborhood: addressInfo?.neighborhood ?? "",
        cep: cep.replace(/\D/g, "") || undefined,
        state: addressInfo?.state ?? undefined,
        latitude: addressInfo?.latitude,
        longitude: addressInfo?.longitude,
        whatsapp: rawWhatsapp,
        cpf: rawDoc,
        provider_type: providerType,
        instagram: instagram || null,
        is_active: isActive,
      }
    );

    const { error: catError } = await setProviderCategories(
      supabase,
      profile.id,
      selectedCategories
    );

    if (profileError || catError) {
      toast.error("Erro ao salvar perfil.");
    } else {
      toast.success("Perfil atualizado!");
      void queryClient.invalidateQueries({ queryKey: ["provider-by-user"] });
      void queryClient.invalidateQueries({ queryKey: ["provider", profile.id] });
      router.replace("/profile");
    }

    setLoading(false);
  }

  return (
    <View className="rounded-xl border border-border bg-card p-5">
      <View className="gap-5">
        <View className="gap-1.5">
          <Label className="text-sm font-medium">Descrição do serviço</Label>
          <Textarea
            placeholder="Descreva seus serviços, experiência e especialidades..."
            value={description}
            onChangeText={setDescription}
            rows={4}
          />
        </View>

        <View className="gap-1.5">
          <Label className="text-sm font-medium">CEP</Label>
          <View className="justify-center">
            <Input
              placeholder="00000-000"
              value={cep}
              onChangeText={(v) => void setCep(v)}
              keyboardType="number-pad"
              maxLength={9}
            />
            {cepLoading && (
              <View className="absolute right-3">
                <ActivityIndicator size="small" color="#8891a4" />
              </View>
            )}
          </View>
          {addressInfo && (
            <Muted className="text-xs">{formatAddressLine(addressInfo)}</Muted>
          )}
        </View>

        <DocumentInput
          providerType={providerType}
          onProviderTypeChange={setProviderType}
          value={document}
          onChange={setDocument}
        />

        <View className="gap-1.5">
          <Label className="text-sm font-medium">WhatsApp (DDD + número)</Label>
          <Input
            placeholder="(11) 99999-9999"
            value={whatsapp}
            onChangeText={(v) =>
              setWhatsapp(formatWhatsApp(v.replace(/\D/g, "").slice(0, 11)))
            }
            keyboardType="phone-pad"
          />
        </View>

        <View className="gap-1.5">
          <Label className="text-sm font-medium">Instagram (opcional)</Label>
          <View className="justify-center">
            <Muted className="absolute left-3 z-10">@</Muted>
            <Input
              placeholder="seuperfil"
              value={instagram}
              onChangeText={(v) => setInstagram(v.replace(/^@/, ""))}
              autoCapitalize="none"
              className="pl-8"
            />
          </View>
        </View>

        <View className="gap-2">
          <Label className="text-sm font-medium">Categorias de serviço</Label>
          <CategoryMultiSelect
            categories={allCategories}
            selected={selectedCategories}
            onChange={setSelectedCategories}
            onAddCustom={handleAddCustomCategory}
          />
        </View>

        <View className="flex-row items-center justify-between rounded-lg border border-border p-4">
          <View>
            <Text className="text-sm font-medium">Perfil ativo</Text>
            <Muted className="text-xs">Visível para clientes na busca</Muted>
          </View>
          <Switch
            checked={isActive}
            onCheckedChange={setIsActive}
            accessibilityLabel="Perfil ativo"
          />
        </View>

        <View className="flex-row gap-3 pt-1">
          <Button onPress={handleSubmit} loading={loading} className="h-11 flex-1">
            <Save size={16} color="#ffffff" />
            <Text className="text-base font-semibold text-primary-foreground">
              Salvar alterações
            </Text>
          </Button>
          <Button variant="outline" className="h-11" onPress={() => router.back()}>
            <ArrowLeft size={16} color="#f5f7fb" />
            <Text className="text-base font-semibold">Voltar</Text>
          </Button>
        </View>
      </View>
    </View>
  );
}
