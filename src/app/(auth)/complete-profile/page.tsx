"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { createProviderProfile, setProviderCategories, createCustomCategory } from "@/lib/supabase/mutations";
import { UserRole } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Search as SearchIcon, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import { CategoryMultiSelect } from "@/components/ui/category-multi-select";
import { fetchCepData, geocodeAddress, formatCep } from "@/lib/cep";

function formatWhatsApp(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

export default function CompleteProfilePage() {
  const router = useRouter();
  const supabase = createClient();

  const [userName, setUserName] = useState("");
  const [role, setRole] = useState<UserRole>("CLIENT");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Provider fields
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
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categories, setCategories] = useState<
    { id: string; name: string; slug: string }[]
  >([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push("/login");
        return;
      }
      setUserId(user.id);
      setUserName(user.user_metadata?.full_name ?? user.user_metadata?.name ?? "");

      // Pre-fill from metadata if available (email signup provider)
      const providerData = user.user_metadata?.provider_data;
      if (providerData) {
        setRole("PROVIDER");
        setDescription(providerData.description ?? "");
        setWhatsapp(formatWhatsApp(providerData.whatsapp ?? ""));
        setCep(formatCep(providerData.cep ?? ""));
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
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (role === "PROVIDER" && categories.length === 0) {
      setLoadingCategories(true);
      supabase
        .from("categories")
        .select("id, name, slug")
        .order("name")
        .then(({ data, error }) => {
          if (data && data.length > 0) {
            setCategories(data);
          } else if (error) {
            console.error("Erro ao carregar categorias:", error);
          }
          setLoadingCategories(false);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  async function handleAddCustomCategory(name: string) {
    const { data, error } = await createCustomCategory(supabase, name);
    if (error || !data) {
      toast.error("Erro ao adicionar categoria.");
      return null;
    }
    setCategories((prev) =>
      [...prev, data].sort((a, b) => a.name.localeCompare(b.name))
    );
    return data;
  }

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

    if (!userId) return;

    if (role === "PROVIDER") {
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

    if (role === "CLIENT") {
      // CLIENT role is already the default from the trigger, just redirect
      router.push("/home");
      router.refresh();
      return;
    }

    // PROVIDER flow: create provider profile
    const rawWa = whatsapp.replace(/\D/g, "");
    const { error, profileId } = await createProviderProfile(supabase, userId, {
      description,
      city: addressInfo!.city,
      neighborhood: addressInfo!.neighborhood,
      cep: cep.replace(/\D/g, ""),
      state: addressInfo!.state,
      latitude: addressInfo!.latitude,
      longitude: addressInfo!.longitude,
      whatsapp: rawWa,
    });

    if (error || !profileId) {
      toast.error("Erro ao criar perfil de prestador.");
      setLoading(false);
      return;
    }

    if (selectedCategories.length > 0) {
      await setProviderCategories(supabase, profileId, selectedCategories);
    }

    // Clean up provider_data from metadata
    await supabase.auth.updateUser({
      data: { provider_data: null },
    });

    toast.success("Perfil configurado com sucesso!");
    router.push("/home");
    router.refresh();
  }

  return (
    <div>
      <div className="mb-6 flex flex-col items-center text-center">
        <h1 className="text-2xl font-bold tracking-tight">Complete seu perfil</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {userName ? `Olá, ${userName}! ` : ""}Como deseja usar o eufaço!?
        </p>
      </div>

      <div className="rounded-xl border border-border bg-white p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role selector */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Eu quero...</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("CLIENT")}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all",
                  role === "CLIENT"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-border"
                )}
              >
                <SearchIcon
                  className={cn(
                    "h-6 w-6",
                    role === "CLIENT" ? "text-primary" : "text-muted-foreground"
                  )}
                />
                <div className="text-center">
                  <p className={cn("text-sm font-semibold", role === "CLIENT" ? "text-primary" : "text-foreground")}>
                    Quero contratar
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">Busco serviços</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRole("PROVIDER")}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all",
                  role === "PROVIDER"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-border"
                )}
              >
                <Wrench
                  className={cn(
                    "h-6 w-6",
                    role === "PROVIDER" ? "text-primary" : "text-muted-foreground"
                  )}
                />
                <div className="text-center">
                  <p className={cn("text-sm font-semibold", role === "PROVIDER" ? "text-primary" : "text-foreground")}>
                    Quero oferecer
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">Ofereço serviços</p>
                </div>
              </button>
            </div>
          </div>

          {/* Provider-specific fields */}
          {role === "PROVIDER" && (
            <div className="space-y-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
              <p className="text-sm font-semibold text-primary">Dados do prestador</p>

              <div className="space-y-1.5">
                <Label htmlFor="whatsapp" className="text-sm font-medium">WhatsApp (DDD + numero)</Label>
                <Input id="whatsapp" placeholder="(11) 99999-9999" value={whatsapp} onChange={handleWhatsAppChange} className="h-11 rounded-lg border-border bg-white" inputMode="tel" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cep" className="text-sm font-medium">CEP *</Label>
                <div className="relative">
                  <Input
                    id="cep"
                    placeholder="00000-000"
                    value={cep}
                    onChange={handleCepChange}
                    className="h-11 rounded-lg border-border bg-white"
                    inputMode="numeric"
                    maxLength={9}
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

              <div className="space-y-1.5">
                <Label htmlFor="description" className="text-sm font-medium">Descricao dos servicos</Label>
                <Textarea id="description" placeholder="Descreva seus servicos e experiencia..." value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="rounded-lg border-border bg-white resize-none" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Categorias de servico</Label>
                {loadingCategories ? (
                  <div className="flex items-center gap-2 py-3 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Carregando categorias...
                  </div>
                ) : categories.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-2">
                    Nenhuma categoria disponivel. Tente novamente mais tarde.
                  </p>
                ) : (
                  <CategoryMultiSelect
                    categories={categories}
                    selected={selectedCategories}
                    onChange={setSelectedCategories}
                    onAddCustom={handleAddCustomCategory}
                  />
                )}
              </div>
            </div>
          )}

          <Button type="submit" className="w-full h-11 rounded-lg font-semibold gradient-bg" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Continuar"}
          </Button>
        </form>
      </div>
    </div>
  );
}
