import { useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { router } from "expo-router";
import { Wrench } from "lucide-react-native";
import { useQueryClient } from "@tanstack/react-query";
import { usePostHog } from "posthog-react-native";
import { toast } from "sonner-native";
import {
  createProviderProfile,
  setProviderCategories,
} from "@resolveai/shared/supabase/mutations";
import { formatWhatsApp, isValidWhatsApp } from "@resolveai/shared/phone";
import { isValidCpf } from "@resolveai/shared/validators/cpf";
import { isValidCnpj } from "@resolveai/shared/validators/cnpj";
import { supabase } from "@/lib/supabase";
import { formatAddressLine, useCepLookup } from "@/lib/use-cep-lookup";
import { Button } from "@/components/ui/button";
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
import { Text, Muted } from "@/components/ui/text";

type Props = {
  categories: Category[];
  userId: string;
};

export function BecomeProviderForm({ categories, userId }: Props) {
  const posthog = usePostHog();
  const queryClient = useQueryClient();

  const [description, setDescription] = useState("");
  const [providerType, setProviderType] = useState<ProviderType>("individual");
  const [document, setDocument] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [instagram, setInstagram] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const { cep, setCep, cepLoading, addressInfo } = useCepLookup();

  async function handleSubmit() {
    const rawDoc = document.replace(/\D/g, "");
    const rawWhatsapp = whatsapp.replace(/\D/g, "");

    const docType = getDocumentType(providerType);
    const isValid = docType === "cpf" ? isValidCpf(rawDoc) : isValidCnpj(rawDoc);
    if (!rawDoc || !isValid) {
      toast.error(
        `${docType.toUpperCase()} inválido. Verifique o número informado.`
      );
      return;
    }

    if (!addressInfo) {
      toast.error("Informe um CEP válido para localizarmos sua região.");
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

    const { error: profileError, profileId } = await createProviderProfile(
      supabase,
      userId,
      {
        description,
        city: addressInfo.city,
        neighborhood: addressInfo.neighborhood,
        cep: cep.replace(/\D/g, ""),
        state: addressInfo.state,
        latitude: addressInfo.latitude,
        longitude: addressInfo.longitude,
        whatsapp: rawWhatsapp,
        cpf: rawDoc,
        provider_type: providerType,
        instagram: instagram || undefined,
      }
    );

    if (profileError || !profileId) {
      toast.error("Erro ao criar perfil de prestador.");
      setLoading(false);
      return;
    }

    const { error: catError } = await setProviderCategories(
      supabase,
      profileId,
      selectedCategories
    );

    if (catError) {
      toast.error("Erro ao salvar categorias.");
      setLoading(false);
      return;
    }

    posthog?.capture("become_provider_submitted", {
      provider_type: providerType,
      category_count: selectedCategories.length,
      city: addressInfo.city,
      state: addressInfo.state,
    });
    toast.success("Perfil de prestador criado com sucesso!");
    // A role do usuario mudou para PROVIDER
    void queryClient.invalidateQueries({ queryKey: ["current-user"] });
    void queryClient.invalidateQueries({ queryKey: ["provider-by-user"] });
    router.replace("/profile");

    setLoading(false);
  }

  return (
    <View className="rounded-xl border border-border bg-card p-5">
      <View className="mb-5 flex-row items-center gap-3 rounded-lg border border-primary/10 bg-primary/5 p-4">
        <View className="h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Wrench size={20} color="#22d3ee" />
        </View>
        <View className="flex-1">
          <Text className="text-sm font-medium">
            Sua conta será convertida para prestador de serviços
          </Text>
          <Muted className="mt-0.5 text-xs">
            Você poderá receber avaliações e aparecer nas buscas
          </Muted>
        </View>
      </View>

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
          <Label className="text-sm font-medium">CEP *</Label>
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
          <Label className="text-sm font-medium">Categorias de serviço *</Label>
          <CategoryMultiSelect
            categories={categories}
            selected={selectedCategories}
            onChange={setSelectedCategories}
          />
        </View>

        <Button onPress={handleSubmit} loading={loading} className="h-11 w-full">
          Criar perfil de prestador
        </Button>
      </View>
    </View>
  );
}
