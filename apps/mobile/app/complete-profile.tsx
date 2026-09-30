import { acceptTerms, formatCpf, updateUser, uploadAvatar } from "@eufaco/shared";
import {
  Button,
  Card,
  Text,
  fontSize,
  letterSpacing,
  useTheme,
} from "@eufaco/design-system/native";
import { useRouter } from "expo-router";
import { ArrowRight, Briefcase, Camera, Check, CreditCard, Phone, Search, UserRound } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppBar } from "@/components/AppBar";
import { Field } from "@/components/Field";
import { SignInPrompt } from "@/components/SignInPrompt";
import { initialsOf } from "@/lib/format";
import { useSession } from "@/lib/session";
import { supabase } from "@/lib/supabase";
import { isPickError, pickImage } from "@/lib/upload";

type Role = "CLIENT" | "PROVIDER";

const ROLES: { value: Role; title: string; desc: string; icon: typeof Search }[] = [
  { value: "CLIENT", title: "Contratar", desc: "Encontrar profissionais", icon: Search },
  { value: "PROVIDER", title: "Oferecer", desc: "Divulgar meus serviços", icon: Briefcase },
];

export default function CompleteProfileScreen() {
  const { colors, radii, spacing, layout } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { session, loading: sessionLoading } = useSession();

  const [role, setRole] = useState<Role>("CLIENT");
  const [whatsapp, setWhatsapp] = useState("");
  const [cpf, setCpf] = useState("");
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Quem entra pelo Google ou pela Apple nunca viu os termos: o cadastro por
  // e-mail pede o aceite, o OAuth não tem onde pedir. É aqui ou em lugar nenhum.
  const [termsAccepted, setTermsAccepted] = useState(false);

  const fullName = session?.user.user_metadata?.full_name as string | undefined;

  useEffect(() => {
    const existing = session?.user.user_metadata?.avatar_url as string | undefined;
    if (existing) setAvatarUri(existing);
  }, [session]);

  const changeAvatar = async () => {
    if (!session) return;

    const picked = await pickImage([1, 1]);
    if (!picked) return;
    if (isPickError(picked)) {
      setError(picked.message);
      return;
    }

    setUploading(true);
    setError(null);
    setAvatarUri(picked.uri);

    const { error: uploadError } = await uploadAvatar(supabase, session.user.id, picked.file);
    setUploading(false);

    if (uploadError) {
      setError("A foto não foi enviada. Tente outra imagem ou reduza o tamanho.");
    }
  };

  /** Aceita os termos e vai para a Home, sem gravar os campos opcionais. */
  const skip = async () => {
    if (!session) return;
    setSaving(true);
    await acceptTerms(supabase, session.user.id);
    setSaving(false);
    router.replace("/");
  };

  const submit = async () => {
    if (!session) return;
    if (!termsAccepted) return setError("É preciso aceitar os Termos de Uso para continuar.");

    setSaving(true);
    setError(null);

    await acceptTerms(supabase, session.user.id);

    const { error: updateError } = await updateUser(supabase, session.user.id, { role });

    // Telefone e CPF ainda não têm dono no banco: `provider_profiles` só
    // nasce no cadastro profissional. Guardamos no metadado da conta para
    // o passo 2 já vir preenchido.
    if (whatsapp.trim() || cpf.trim()) {
      await supabase.auth.updateUser({
        data: { phone: whatsapp.trim() || null, cpf: cpf.trim() || null },
      });
    }

    setSaving(false);

    if (updateError) {
      setError("Não foi possível salvar. Verifique sua conexão e tente de novo.");
      return;
    }

    // Quem escolhe oferecer segue direto para o cadastro profissional
    router.replace(role === "PROVIDER" ? "/become-provider" : "/");
  };

  if (sessionLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <AppBar showBack={false} title="Complete seu perfil" />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </View>
    );
  }

  if (!session) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <AppBar showBack={false} title="Complete seu perfil" />
        <SignInPrompt
          title="Entre para continuar"
          description="Precisamos da sua conta para salvar suas preferências."
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: spacing[5],
          paddingTop: insets.top + 8,
          paddingBottom: Math.max(insets.bottom, 26),
          gap: 22,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Progresso: esta é a etapa 1; a 2 é o cadastro profissional, quando houver */}
        <View style={{ gap: 7 }}>
          <View style={{ flexDirection: "row", gap: 6 }}>
            <View style={{ flex: 1, height: 5, borderRadius: 3, backgroundColor: colors.primary }} />
            <View style={{ flex: 1, height: 5, borderRadius: 3, backgroundColor: colors.surface3 }} />
          </View>
          <Text variant="captionStrong" color="textMuted">
            Passo 1 de 2
          </Text>
        </View>

        <View style={{ alignItems: "center", gap: 8 }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Adicionar foto de perfil"
            onPress={() => void changeAvatar()}
            style={{ width: 98, height: 98, alignItems: "center", justifyContent: "center" }}
          >
            <View
              style={{
                width: 92,
                height: 92,
                borderRadius: 26,
                overflow: "hidden",
                backgroundColor: colors.surface2,
                borderWidth: 1.5,
                borderColor: colors.borderStrong,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {uploading ? (
                <ActivityIndicator color={colors.primary} />
              ) : avatarUri ? (
                <Image
                  source={{ uri: avatarUri }}
                  style={{ width: "100%", height: "100%" }}
                  resizeMode="cover"
                  accessibilityIgnoresInvertColors
                />
              ) : fullName ? (
                <Text variant="h1" color="textMuted">
                  {initialsOf(fullName)}
                </Text>
              ) : (
                <UserRound size={34} color={colors.textMuted} />
              )}
            </View>

            <View
              style={{
                position: "absolute",
                right: 0,
                bottom: 0,
                width: 32,
                height: 32,
                borderRadius: radii.full,
                backgroundColor: colors.primary,
                borderWidth: 3,
                borderColor: colors.bg,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Camera size={15} color={colors.onPrimary} />
            </View>
          </Pressable>

          <Text variant="caption" color="textMuted">
            Adicionar foto de perfil
          </Text>
        </View>

        <View style={{ gap: 14 }}>
          <Field
            label="Telefone / WhatsApp"
            icon={Phone}
            value={whatsapp}
            onChangeText={setWhatsapp}
            placeholder="(31) 99999-9999"
            keyboardType="phone-pad"
          />
          <Field
            label="CPF"
            icon={CreditCard}
            value={cpf}
            onChangeText={(text) => setCpf(formatCpf(text))}
            placeholder="000.000.000-00"
            keyboardType="number-pad"
          />
        </View>

        <View style={{ gap: 10 }}>
          <Text variant="title">O que você quer fazer?</Text>

          <View style={{ flexDirection: "row", gap: 10 }}>
            {ROLES.map((option) => {
              const selected = role === option.value;
              return (
                <Pressable
                  key={option.value}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  accessibilityLabel={`${option.title}: ${option.desc}`}
                  onPress={() => setRole(option.value)}
                  style={{
                    flex: 1,
                    gap: 8,
                    padding: 14,
                    borderRadius: radii.md,
                    backgroundColor: selected ? colors.primarySoft : colors.surface,
                    borderWidth: 1,
                    borderColor: selected ? colors.primary : colors.border,
                  }}
                >
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 11,
                      backgroundColor: selected ? colors.primary : colors.surface2,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <option.icon size={17} color={selected ? colors.onPrimary : colors.textSecondary} />
                  </View>
                  <Text
                    variant="title"
                    style={{ fontSize: fontSize.field, letterSpacing: letterSpacing.subtle }}
                  >
                    {option.title}
                  </Text>
                  <Text variant="caption" color="textSecondary">
                    {option.desc}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: termsAccepted }}
          accessibilityLabel="Aceito os Termos de Uso e a Política de Privacidade"
          onPress={() => {
            setTermsAccepted((v) => !v);
            setError(null);
          }}
          style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}
        >
          <View
            style={{
              width: 20,
              height: 20,
              borderRadius: 6,
              marginTop: 2,
              backgroundColor: termsAccepted ? colors.primary : "transparent",
              borderWidth: termsAccepted ? 0 : 1.5,
              borderColor: colors.borderStrong,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {termsAccepted ? <Check size={13} color={colors.onPrimary} /> : null}
          </View>
          <Text
            color="textSecondary"
            style={{ flex: 1, fontSize: fontSize.note, lineHeight: fontSize.note * 1.45 }}
          >
            Li e aceito os Termos de Uso e a Política de Privacidade da plataforma.
          </Text>
        </Pressable>

        {error ? (
          <Card variant="plain" style={{ backgroundColor: colors.dangerSoft }}>
            <Text variant="bodyStrong" color="danger">
              {error}
            </Text>
          </Card>
        ) : null}

        <Button
          label="Continuar"
          loading={saving}
          icon={<ArrowRight size={18} color={colors.onPrimary} />}
          iconPosition="right"
          onPress={() => void submit()}
        />

        {/* Pular deixa foto, telefone e CPF para depois — mas o aceite dos
            termos não é opcional, então ele passa pelo mesmo submit. */}
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            if (!termsAccepted) {
              setError("É preciso aceitar os Termos de Uso para continuar.");
              return;
            }
            void skip();
          }}
          hitSlop={8}
          style={{ alignItems: "center" }}
        >
          <Text variant="label" color="textMuted">
            Pular por enquanto
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
