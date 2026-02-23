"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { signUpWithEmail, signInWithGoogle, createCustomCategory } from "@/lib/supabase/mutations";
import { UserRole } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Search as SearchIcon, Wrench, ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { CategoryMultiSelect } from "@/components/ui/category-multi-select";
import { fetchCepData, geocodeAddress, formatCep } from "@/lib/cep";

function formatWhatsApp(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<UserRole>("CLIENT");
  const [loading, setLoading] = useState(false);

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

  const totalSteps = role === "PROVIDER" ? 2 : 1;

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

  function validateStep1(): boolean {
    if (!fullName.trim() || fullName.trim().length < 3) {
      toast.error("Informe seu nome completo (mínimo 3 caracteres).");
      return false;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Informe um email válido.");
      return false;
    }
    if (password.length < 6) {
      toast.error("A senha deve ter no mínimo 6 caracteres.");
      return false;
    }
    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      return false;
    }
    return true;
  }

  function handleNextStep() {
    if (!validateStep1()) return;

    if (role === "PROVIDER") {
      setStep(2);
    } else {
      handleSubmit();
    }
  }

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();

    if (!validateStep1()) return;

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

    const { data, error } = await signUpWithEmail(
      supabase,
      email.trim(),
      password,
      fullName.trim(),
      role,
      role === "PROVIDER"
        ? {
            description,
            whatsapp: whatsapp.replace(/\D/g, ""),
            cep: cep.replace(/\D/g, ""),
            city: addressInfo!.city,
            state: addressInfo!.state,
            neighborhood: addressInfo!.neighborhood,
            latitude: addressInfo!.latitude,
            longitude: addressInfo!.longitude,
            categoryIds: selectedCategories,
          }
        : undefined
    );

    if (error) {
      toast.error("Erro ao criar conta.");
      setLoading(false);
      return;
    }

    // Supabase returns a fake user with empty identities when email already exists
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      toast.error("Este email já está cadastrado. Tente fazer login.");
      setLoading(false);
      return;
    }

    toast.success("Conta criada! Verifique seu email para confirmar.");
    router.push("/login");
  }

  async function handleGoogleSignUp() {
    const { error } = await signInWithGoogle(supabase);
    if (error) {
      toast.error("Erro ao entrar com Google.");
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-col items-center text-center">
        <h1 className="text-2xl font-bold tracking-tight">Criar conta</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {step === 1 ? "Escolha como deseja usar o eufaço!" : "Complete seu perfil profissional"}
        </p>
        {totalSteps > 1 && (
          <div className="mt-3 flex items-center gap-2">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i + 1 <= step ? "w-8 bg-primary" : "w-8 bg-muted"
                )}
              />
            ))}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        {step === 1 ? (
          <>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleNextStep();
              }}
              className="space-y-4"
            >
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

              {/* Base fields */}
              <div className="space-y-1.5">
                <Label htmlFor="fullName" className="text-sm font-medium">Nome completo</Label>
                <Input id="fullName" type="text" placeholder="Seu nome" value={fullName} onChange={(e) => setFullName(e.target.value)} className="h-11 rounded-lg border-border" required />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <Input id="email" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="h-11 rounded-lg border-border" required />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-medium">Senha</Label>
                <PasswordInput id="password" placeholder="Mínimo 6 caracteres" value={password} onChange={(e) => setPassword(e.target.value)} className="h-11 rounded-lg border-border" minLength={6} required />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirmar senha</Label>
                <PasswordInput id="confirmPassword" placeholder="Digite a senha novamente" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="h-11 rounded-lg border-border" minLength={6} required />
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Ao criar uma conta, você concorda com os{" "}
                <Link href="/terms" className="text-primary hover:underline">Termos de Uso</Link>{" "}
                e a{" "}
                <Link href="/privacy" className="text-primary hover:underline">Política de Privacidade</Link>.
              </p>

              <Button type="submit" className="w-full h-11 rounded-lg font-semibold gradient-bg" disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : role === "PROVIDER" ? (
                  <>
                    Próximo
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </>
                ) : (
                  "Criar conta"
                )}
              </Button>
            </form>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-3 text-muted-foreground">ou continue com</span>
              </div>
            </div>

            <Button variant="outline" className="w-full h-11 rounded-lg gap-3 border-border" onClick={handleGoogleSignUp}>
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continuar com Google
            </Button>
          </>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label htmlFor="whatsapp" className="text-sm font-medium">WhatsApp (DDD + número) *</Label>
              <Input id="whatsapp" placeholder="(11) 99999-9999" value={whatsapp} onChange={handleWhatsAppChange} className="h-11 rounded-lg border-border" inputMode="tel" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cep" className="text-sm font-medium">CEP *</Label>
              <div className="relative">
                <Input
                  id="cep"
                  placeholder="00000-000"
                  value={cep}
                  onChange={handleCepChange}
                  className="h-11 rounded-lg border-border"
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
              <Label htmlFor="description" className="text-sm font-medium">Descrição dos serviços</Label>
              <Textarea id="description" placeholder="Descreva seus serviços e experiência..." value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="rounded-lg border-border resize-none" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Categorias de serviço *</Label>
              {loadingCategories ? (
                <div className="flex items-center gap-2 py-3 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Carregando categorias...
                </div>
              ) : categories.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">
                  Nenhuma categoria disponível. Tente novamente mais tarde.
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

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-lg border-border gap-1"
                onClick={() => setStep(1)}
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
              <Button type="submit" className="flex-1 h-11 rounded-lg font-semibold gradient-bg" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Criar conta"}
              </Button>
            </div>
          </form>
        )}
      </div>

      <p className="mt-5 text-center text-sm text-muted-foreground">
        Já tem conta?{" "}
        <Link href="/login" className="font-semibold text-primary">Entrar</Link>
      </p>
    </div>
  );
}
