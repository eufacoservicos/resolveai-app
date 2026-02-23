"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  createProviderProfile,
  setProviderCategories,
} from "@/lib/supabase/mutations";
import { fetchCepData, geocodeAddress, formatCep } from "@/lib/cep";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CategoryMultiSelect } from "@/components/ui/category-multi-select";
import { toast } from "sonner";
import { Loader2, Wrench } from "lucide-react";

interface BecomeProviderFormProps {
  categories: { id: string; name: string; slug: string }[];
  userId: string;
}

function formatWhatsApp(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

export function BecomeProviderForm({
  categories,
  userId,
}: BecomeProviderFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [description, setDescription] = useState("");
  const [cep, setCep] = useState("");
  const [cepLoading, setCepLoading] = useState(false);
  const [addressInfo, setAddressInfo] = useState<{
    city: string;
    state: string;
    neighborhood: string;
    latitude: number | null;
    longitude: number | null;
  } | null>(null);
  const [whatsapp, setWhatsapp] = useState("");
  const [instagram, setInstagram] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  function handleWhatsAppChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 11);
    setWhatsapp(formatWhatsApp(digits));
  }

  async function handleCepChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 8);
    setCep(formatCep(raw));

    if (raw.length === 8) {
      setCepLoading(true);
      const data = await fetchCepData(raw);
      if (data) {
        const coords = await geocodeAddress(data.city, data.state, data.neighborhood);
        setAddressInfo({
          city: data.city,
          state: data.state,
          neighborhood: data.neighborhood,
          latitude: coords?.latitude ?? null,
          longitude: coords?.longitude ?? null,
        });
      } else {
        setAddressInfo(null);
        toast.error("CEP não encontrado. Verifique e tente novamente.");
      }
      setCepLoading(false);
    } else {
      setAddressInfo(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const rawWhatsapp = whatsapp.replace(/\D/g, "");

    if (!addressInfo) {
      toast.error("Informe um CEP válido para localizarmos sua região.");
      return;
    }

    if (rawWhatsapp && (rawWhatsapp.length < 10 || rawWhatsapp.length > 11)) {
      toast.error(
        "WhatsApp inválido. Informe DDD + número (10 ou 11 dígitos)."
      );
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

    toast.success("Perfil de prestador criado com sucesso!");
    router.push("/profile");
    router.refresh();
  }

  return (
    <div className="rounded-xl border border-border bg-white p-5">
      <div className="mb-5 flex items-center gap-3 rounded-lg bg-primary/5 border border-primary/10 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Wrench className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium">
            Sua conta será convertida para prestador de serviços
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Você poderá receber avaliações e aparecer nas buscas
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Description */}
        <div className="space-y-1.5">
          <Label htmlFor="description" className="text-sm font-medium">
            Descrição do serviço
          </Label>
          <Textarea
            id="description"
            placeholder="Descreva seus serviços, experiência e especialidades..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="rounded-lg border-border resize-none"
          />
        </div>

        {/* CEP */}
        <div className="space-y-1.5">
          <Label htmlFor="cep" className="text-sm font-medium">
            CEP *
          </Label>
          <div className="relative">
            <Input
              id="cep"
              placeholder="00000-000"
              value={cep}
              onChange={handleCepChange}
              className="h-11 rounded-lg border-border"
              inputMode="numeric"
              maxLength={9}
              required
            />
            {cepLoading && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>
          {addressInfo && (
            <p className="text-xs text-muted-foreground">
              {addressInfo.neighborhood ? `${addressInfo.neighborhood}, ` : ""}
              {addressInfo.city} - {addressInfo.state}
            </p>
          )}
        </div>

        {/* WhatsApp */}
        <div className="space-y-1.5">
          <Label htmlFor="whatsapp" className="text-sm font-medium">
            WhatsApp (DDD + número)
          </Label>
          <Input
            id="whatsapp"
            placeholder="(11) 99999-9999"
            value={whatsapp}
            onChange={handleWhatsAppChange}
            className="h-11 rounded-lg border-border"
            inputMode="tel"
          />
        </div>

        {/* Instagram */}
        <div className="space-y-1.5">
          <Label htmlFor="instagram" className="text-sm font-medium">
            Instagram (opcional)
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">@</span>
            <Input
              id="instagram"
              placeholder="seuperfil"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value.replace(/^@/, ""))}
              className="h-11 rounded-lg border-border pl-8"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Categorias de serviço *
          </Label>
          <CategoryMultiSelect
            categories={categories}
            selected={selectedCategories}
            onChange={setSelectedCategories}
          />
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={loading}
          className="w-full h-11 rounded-lg font-semibold gap-2 gradient-bg"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Criar perfil de prestador"
          )}
        </Button>
      </form>
    </div>
  );
}
