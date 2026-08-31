import { updateUser, uploadAvatar } from "@eufaco/shared";
import { Button, Card, Text, useTheme } from "@eufaco/design-system/native";
import { useRouter } from "expo-router";
import { Briefcase, Camera, Search, UserRound } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppBar } from "@/components/AppBar";
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
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const submit = async () => {
    if (!session) return;

    setSaving(true);
    setError(null);

    const { error: updateError } = await updateUser(supabase, session.user.id, { role });
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
      <AppBar showBack={false} title="Complete seu perfil" />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: spacing[5],
          paddingTop: spacing[2],
          paddingBottom: Math.max(insets.bottom, spacing[6]),
          gap: spacing[5],
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Progresso: esta é a etapa 1; a 2 é o cadastro profissional, quando houver */}
        <View style={{ gap: spacing[1] + 3 }}>
          <View style={{ flexDirection: "row", gap: spacing[1] + 2 }}>
            <View style={{ flex: 1, height: 5, borderRadius: 3, backgroundColor: colors.primary }} />
            <View style={{ flex: 1, height: 5, borderRadius: 3, backgroundColor: colors.surface3 }} />
          </View>
          <Text variant="caption" color="textMuted">
            Passo 1 de 2
          </Text>
        </View>

        <View style={{ alignItems: "center", gap: spacing[2] }}>
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

        <View style={{ gap: spacing[3] }}>
          <Text variant="title">O que você quer fazer?</Text>

          <View style={{ flexDirection: "row", gap: spacing[2] + 2 }}>
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
                    gap: spacing[2],
                    padding: spacing[3] + 2,
                    borderRadius: radii.md,
                    backgroundColor: selected ? colors.primarySoft : colors.surface,
                    borderWidth: selected ? 2 : 1.5,
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
                  <Text variant="title">{option.title}</Text>
                  <Text variant="caption" color="textSecondary">
                    {option.desc}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {error ? (
          <Card variant="plain" style={{ backgroundColor: colors.dangerSoft }}>
            <Text variant="bodyStrong" color="danger">
              {error}
            </Text>
          </Card>
        ) : null}

        <Button label="Continuar" loading={saving} onPress={() => void submit()} />

        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace("/")}
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
