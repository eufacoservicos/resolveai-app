import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  Search as SearchIcon,
  Wrench,
} from "lucide-react-native";
import { usePostHog } from "posthog-react-native";
import { toast } from "sonner-native";
import {
  createCustomCategory,
  signUpWithEmail,
} from "@resolveai/shared/supabase/mutations";
import { getCategories } from "@resolveai/shared/supabase/queries";
import { formatWhatsApp } from "@resolveai/shared/phone";
import { isValidCpf } from "@resolveai/shared/validators/cpf";
import { isValidCnpj } from "@resolveai/shared/validators/cnpj";
import { supabase } from "@/lib/supabase";
import { signInWithOAuth } from "@/lib/oauth";
import { formatAddressLine, useCepLookup } from "@/lib/use-cep-lookup";
import { AuthLogo } from "@/components/layout/auth-logo";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { GoogleIcon } from "@/components/ui/google-icon";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
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
import { Display, Muted, Text } from "@/components/ui/text";
import { AmbientBg } from "@/components/ui/ambient-bg";
import { cn } from "@resolveai/shared/cn";

type Role = "CLIENT" | "PROVIDER";

export default function RegisterScreen() {
  const params = useLocalSearchParams<{ role?: string }>();
  const providerSignup = params.role === "provider";
  const posthog = usePostHog();

  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<Role>(providerSignup ? "PROVIDER" : "CLIENT");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Campos do prestador (passo 2)
  const [description, setDescription] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [providerType, setProviderType] = useState<ProviderType>("individual");
  const [document, setDocument] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [customCategories, setCustomCategories] = useState<Category[]>([]);

  const { cep, setCep, cepLoading, addressInfo } = useCepLookup();

  const totalSteps = role === "PROVIDER" ? 2 : 1;

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories(supabase),
    enabled: role === "PROVIDER",
  });

  const categories = [
    ...((categoriesQuery.data ?? []) as Category[]),
    ...customCategories,
  ].sort((a, b) => a.name.localeCompare(b.name));

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
      void handleSubmit();
    }
  }

  async function handleSubmit() {
    if (!validateStep1()) return;

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

    const { data, error } = await signUpWithEmail(
      supabase,
      email.trim(),
      password,
      fullName.trim(),
      role,
      role === "PROVIDER"
        ? {
            description,
            cpf: document.replace(/\D/g, ""),
            provider_type: providerType,
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

    // O Supabase devolve um usuario falso, sem identities, quando o email ja existe
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      toast.error("Este email já está cadastrado. Tente fazer login.");
      setLoading(false);
      return;
    }

    posthog?.identify(data.user!.id, {
      email: email.trim(),
      name: fullName.trim(),
      role,
    });
    posthog?.capture("user_signed_up", { role, method: "email" });
    toast.success("Conta criada! Verifique seu email para confirmar.");
    router.replace("/login");
    setLoading(false);
  }

  async function handleGoogleSignUp() {
    setGoogleLoading(true);
    try {
      await signInWithOAuth("google");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao entrar com Google.";
      if (msg !== "OAuth flow cancelled") toast.error(msg);
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <View className="flex-1 bg-background">
      <AmbientBg variant={providerSignup ? "violet" : "primary"} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            paddingHorizontal: 20,
            paddingVertical: 32,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="w-full max-w-md self-center">
            <AuthLogo />

            <View className="mb-7">
              <Display className="text-[32px] leading-[34px]">
                {providerSignup
                  ? "Comece a receber "
                  : "Criar sua "}
                <Text className="text-[32px] font-black text-primary">
                  {providerSignup ? "clientes." : "conta."}
                </Text>
              </Display>
              <Muted className="mt-3 text-base">
                {step === 1
                  ? providerSignup
                    ? "Cadastre seu serviço e comece a receber contatos no WhatsApp."
                    : "Escolha como deseja usar o eufaço!"
                  : "Complete seu perfil profissional para aparecer nas buscas."}
              </Muted>
              {totalSteps > 1 && (
                <View className="mt-5 flex-row items-center gap-2">
                  {Array.from({ length: totalSteps }).map((_, i) => (
                    <View
                      key={i}
                      className={cn(
                        "h-1.5 flex-1 rounded-full",
                        i + 1 <= step ? "bg-primary" : "bg-white/10"
                      )}
                    />
                  ))}
                  <Muted className="ml-2 text-xs font-semibold">
                    {step}/{totalSteps}
                  </Muted>
                </View>
              )}
            </View>

            <View className="rounded-3xl border border-white/10 bg-card/60 p-6">
          {step === 1 ? (
            <>
              <View className="gap-4">
                {providerSignup ? (
                  <View className="flex-row items-center gap-3 rounded-2xl border border-primary/25 bg-primary/10 p-4">
                    <View className="h-11 w-11 items-center justify-center rounded-xl bg-primary/20">
                      <Wrench size={20} color="#22d3ee" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm font-bold text-primary">
                        Cadastro de prestador
                      </Text>
                      <Muted className="mt-0.5 text-xs">
                        Seu cadastro já está configurado como prestador.
                      </Muted>
                    </View>
                  </View>
                ) : (
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
                )}

                <View className="gap-1.5">
                  <Label className="text-sm font-medium">Nome completo</Label>
                  <Input
                    placeholder="Seu nome"
                    value={fullName}
                    onChangeText={setFullName}
                    autoComplete="name"
                  />
                </View>

                <View className="gap-1.5">
                  <Label className="text-sm font-medium">Email</Label>
                  <Input
                    placeholder="seu@email.com"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                  />
                </View>

                <View className="gap-1.5">
                  <Label className="text-sm font-medium">Senha</Label>
                  <PasswordInput
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChangeText={setPassword}
                  />
                </View>

                <View className="gap-1.5">
                  <Label className="text-sm font-medium">Confirmar senha</Label>
                  <PasswordInput
                    placeholder="Digite a senha novamente"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                  />
                </View>

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
                  onPress={handleNextStep}
                  loading={loading}
                  disabled={!acceptedTerms}
                  className="mt-2 w-full"
                >
                  {role === "PROVIDER" ? (
                    <>
                      <Text className="text-base font-bold text-primary-foreground">
                        {providerSignup ? "Continuar cadastro" : "Próximo"}
                      </Text>
                      <ArrowRight size={18} color="#05070a" />
                    </>
                  ) : (
                    <Text className="text-base font-bold text-primary-foreground">
                      Criar conta
                    </Text>
                  )}
                </Button>
              </View>

              {!providerSignup && (
                <>
                  <View className="my-6 flex-row items-center gap-3">
                    <View className="h-px flex-1 bg-white/10" />
                    <Muted className="text-[10px] uppercase tracking-widest">
                      ou continue com
                    </Muted>
                    <View className="h-px flex-1 bg-white/10" />
                  </View>

                  <Button
                    variant="glass"
                    size="lg"
                    onPress={handleGoogleSignUp}
                    loading={googleLoading}
                    className="w-full gap-3"
                  >
                    <GoogleIcon />
                    <Text className="text-base font-semibold text-foreground">
                      Continuar com Google
                    </Text>
                  </Button>
                </>
              )}
            </>
          ) : (
            <View className="gap-4">
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
                />
              </View>

              <View className="gap-1.5">
                <Label className="text-sm font-medium">
                  Categorias de serviço *
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

              <View className="flex-row gap-3">
                <Button
                  variant="glass"
                  size="lg"
                  className="gap-1"
                  onPress={() => setStep(1)}
                >
                  <ArrowLeft size={16} color="#f5f7fb" />
                  <Text className="text-base font-semibold text-foreground">
                    Voltar
                  </Text>
                </Button>
                <Button
                  variant="gradient"
                  size="lg"
                  onPress={handleSubmit}
                  loading={loading}
                  className="flex-1"
                >
                  {providerSignup ? "Criar perfil" : "Criar conta"}
                </Button>
              </View>
            </View>
          )}
        </View>

            <View className="mt-8 flex-row items-center justify-center gap-1.5">
              <Muted>Já tem conta?</Muted>
              <Pressable onPress={() => router.push("/login")} hitSlop={8}>
                <Text className="text-sm font-bold text-primary">Entrar</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
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
