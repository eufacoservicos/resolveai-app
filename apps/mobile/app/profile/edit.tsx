import { getCurrentUser, updateUser, type User } from "@eufaco/shared";
import { Button, Card, Text, useTheme } from "@eufaco/design-system/native";
import { useRouter } from "expo-router";
import { Mail, UserRound } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { AppBar } from "@/components/AppBar";
import { Field } from "@/components/Field";
import { initialsOf } from "@/lib/format";
import { useSession } from "@/lib/session";
import { supabase } from "@/lib/supabase";

export default function EditProfileScreen() {
  const { colors, spacing, layout } = useTheme();
  const router = useRouter();
  const { session } = useSession();

  const [user, setUser] = useState<User | null>(null);
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [userId]);

  const submit = async () => {
    if (fullName.trim().length < 3) return setError("Informe seu nome completo.");
    if (!userId) return;

    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      await updateUser(supabase, userId, { full_name: fullName.trim() });
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
          paddingTop: spacing[4],
          paddingBottom: spacing[8],
          gap: spacing[6],
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ alignItems: "center", gap: spacing[2] }}>
          <View
            style={{
              width: 92,
              height: 92,
              borderRadius: 26,
              backgroundColor: colors.primarySoft,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text variant="h1" color="primaryStrong">
              {initialsOf(fullName || user?.email || "?")}
            </Text>
          </View>
          <Text variant="caption" color="textMuted">
            A troca de foto ainda não está disponível no app
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

          <View style={{ opacity: 0.6 }}>
            <Field
              label="E-mail"
              icon={Mail}
              value={user?.email ?? ""}
              editable={false}
              placeholder="—"
            />
          </View>
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

        <Button label="Salvar alterações" loading={saving} onPress={() => void submit()} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
