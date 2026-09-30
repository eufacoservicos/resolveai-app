import {
  getCurrentUser,
  updateProviderProfile,
  updateUser,
  uploadAvatar,
  type User,
} from "@eufaco/shared";
import { Button, Card, Text, fontSize, nativeFonts, useTheme } from "@eufaco/design-system/native";
import { useRouter } from "expo-router";
import { ArrowRight, Camera, CreditCard, Mail, Phone, Trash2, UserRound } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { AppBar } from "@/components/AppBar";
import { Field } from "@/components/Field";
import { useProviderAccount } from "@/hooks/useProviderAccount";
import { initialsOf } from "@/lib/format";
import { useSession } from "@/lib/session";
import { supabase } from "@/lib/supabase";
import { isPickError, pickImage } from "@/lib/upload";

export default function EditProfileScreen() {
  const { colors, radii, spacing, layout } = useTheme();
  const router = useRouter();
  const { session } = useSession();
  const { provider, refresh: refreshProvider } = useProviderAccount();

  const [user, setUser] = useState<User | null>(null);
  const [fullName, setFullName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [cpf, setCpf] = useState("");
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const userId = session?.user.id;

  useEffect(() => {
    if (!userId) return;
    let active = true;
    getCurrentUser(supabase)
      .then((result) => {
        if (!active) return;
        const current = result as User | null;
        setUser(current);
        setFullName(current?.full_name ?? "");
        setAvatarUri(current?.avatar_url ?? null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [userId]);

  // Telefone e CPF vivem no perfil profissional, não na conta
  useEffect(() => {
    if (!provider) return;
    setWhatsapp(provider.whatsapp ?? "");
    setCpf(provider.cpf ?? "");
  }, [provider]);

  const changePhoto = async () => {
    if (!userId) return;
    const picked = await pickImage([1, 1]);
    if (!picked) return;
    if (isPickError(picked)) {
      setError(picked.message);
      return;
    }

    setUploading(true);
    setError(null);
    const { error: uploadError } = await uploadAvatar(supabase, userId, picked.file);
    setUploading(false);

    if (uploadError) {
      setError("Não foi possível enviar a foto. Tente de novo.");
      return;
    }
    setAvatarUri(picked.uri);
  };

  const submit = async () => {
    if (fullName.trim().length < 3) return setError("Informe seu nome completo.");
    if (!userId) return;

    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      await updateUser(supabase, userId, { full_name: fullName.trim() });
      if (provider) {
        await updateProviderProfile(supabase, provider.id, {
          whatsapp: whatsapp.trim(),
          cpf: cpf.trim() || null,
        });
        refreshProvider();
      }
      setSaved(true);
      router.back();
    } catch {
      setError("Não foi possível salvar. Verifique sua conexão e tente de novo.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <AppBar title="Editar perfil" />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <AppBar title="Editar perfil" />
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: layout.screenPadding,
          paddingTop: 20,
          paddingBottom: 20,
          gap: 22,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ alignItems: "center", gap: 8 }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Alterar foto do perfil"
            onPress={() => void changePhoto()}
            style={{ width: 98, height: 98 }}
          >
            <View
              style={{
                width: 92,
                height: 92,
                borderRadius: 26,
                backgroundColor: colors.primarySoft,
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              {uploading ? (
                <ActivityIndicator color={colors.primaryStrong} />
              ) : avatarUri ? (
                <Image
                  source={{ uri: avatarUri }}
                  style={{ width: "100%", height: "100%" }}
                  resizeMode="cover"
                  accessibilityIgnoresInvertColors
                />
              ) : (
                <Text
                  variant="h1"
                  color="primaryStrong"
                  style={{ fontSize: fontSize["4xl"], lineHeight: fontSize["4xl"] * 1.2 }}
                >
                  {initialsOf(fullName || user?.email || "?")}
                </Text>
              )}
            </View>

            {/* Selo de câmera no canto, com anel da cor do fundo */}
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
            Toque para alterar a foto
          </Text>
        </View>

        <View style={{ gap: spacing[4] }}>
          <Field
            label="Nome completo"
            icon={UserRound}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Como você quer ser chamado"
            autoComplete="name"
            error={error}
          />

          <Field
            label="E-mail"
            icon={Mail}
            value={user?.email ?? ""}
            editable={false}
            placeholder="—"
          />

          {provider ? (
            <>
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
                onChangeText={setCpf}
                placeholder="000.000.000-00"
                keyboardType="number-pad"
              />
            </>
          ) : null}

          <Text variant="caption" color="textMuted">
            O e-mail é o seu login e não pode ser alterado por aqui.
          </Text>
        </View>

        {saved ? (
          <Card variant="plain" style={{ backgroundColor: colors.successSoft }}>
            <Text variant="bodyStrong" color="success">
              Perfil atualizado
            </Text>
          </Card>
        ) : null}

        <Button
          label="Salvar alterações"
          loading={saving}
          icon={<ArrowRight size={18} color={colors.onPrimary} />}
          iconPosition="right"
          onPress={() => void submit()}
        />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Excluir minha conta"
          onPress={() => router.push("/profile/delete")}
          style={({ pressed }) => ({
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            paddingVertical: 13,
            paddingHorizontal: 14,
            borderRadius: radii.md,
            backgroundColor: colors.dangerSoft,
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <Trash2 size={16} color={colors.danger} />
          <Text variant="titleSm" color="danger" style={{ fontFamily: nativeFonts.bodySemiBold }}>
            Excluir minha conta
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
