import { REPORT_REASONS, createReport, getProviderById, type ProviderWithDetails, type ReportReason } from "@eufaco/shared";
import { Button, Card, Text, nativeFonts, useTheme } from "@eufaco/design-system/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { CircleCheck, Lock } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import { AppBar } from "@/components/AppBar";
import { SignInPrompt } from "@/components/SignInPrompt";
import { initialsOf } from "@/lib/format";
import { useSession } from "@/lib/session";
import { supabase } from "@/lib/supabase";

const MAX_DETAILS = 1000;

export default function ReportScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, radii, spacing, layout } = useTheme();
  const router = useRouter();
  const { session, loading: sessionLoading } = useSession();

  const [provider, setProvider] = useState<ProviderWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!id) return;
    let active = true;
    getProviderById(supabase, id)
      .then((p) => {
        if (active) setProvider(p as ProviderWithDetails | null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  const submit = async () => {
    if (!reason) return setError("Escolha o motivo da denúncia.");
    if (!session || !id) return;

    setSending(true);
    setError(null);

    const { error: reportError } = await createReport(supabase, session.user.id, {
      targetType: "provider",
      targetId: id,
      reason,
      details,
    });

    setSending(false);

    if (reportError) {
      setError("Não foi possível enviar a denúncia. Verifique sua conexão e tente de novo.");
      return;
    }
    setSent(true);
  };

  if (sessionLoading || loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <AppBar title="Denunciar" />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </View>
    );
  }

  if (!session) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <AppBar title="Denunciar" />
        <SignInPrompt
          title="Entre para denunciar"
          description="Denúncias precisam de um remetente para que possamos apurar. Seu nome nunca é mostrado ao denunciado."
        />
      </View>
    );
  }

  if (sent) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <AppBar title="Denunciar" />
        <View style={{ flex: 1, justifyContent: "center", paddingHorizontal: layout.screenPadding, gap: spacing[4] }}>
          <Card style={{ alignItems: "center", gap: spacing[3], paddingVertical: spacing[8] }}>
            <View
              style={{
                width: 66,
                height: 66,
                borderRadius: 20,
                backgroundColor: colors.successSoft,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CircleCheck size={30} color={colors.success} />
            </View>
            <Text variant="h2" style={{ textAlign: "center" }}>
              Denúncia recebida
            </Text>
            <Text color="textSecondary" style={{ textAlign: "center" }}>
              Analisamos em até 48 horas. O profissional não fica sabendo quem denunciou.
            </Text>
          </Card>
          <Button label="Voltar" onPress={() => router.back()} />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <AppBar title="Denunciar" />
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: layout.screenPadding,
          paddingTop: spacing[3],
          paddingBottom: spacing[8],
          gap: spacing[5],
        }}
        keyboardShouldPersistTaps="handled"
      >
        {provider ? (
          <Card style={{ flexDirection: "row", alignItems: "center", gap: spacing[3] }}>
            <View
              style={{
                width: 46,
                height: 46,
                borderRadius: 14,
                backgroundColor: colors.primarySoft,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text variant="title" color="primaryStrong">
                {initialsOf(provider.user.full_name)}
              </Text>
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text variant="title">{provider.user.full_name}</Text>
              <Text variant="caption" color="textSecondary">
                {[provider.categories[0]?.name, provider.neighborhood].filter(Boolean).join(" · ")}
              </Text>
            </View>
          </Card>
        ) : null}

        <View style={{ gap: spacing[2] + 1 }}>
          <Text variant="h3">Por que você está denunciando?</Text>

          {REPORT_REASONS.map((item) => {
            const selected = reason === item.value;
            return (
              <Pressable
                key={item.value}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                onPress={() => {
                  setReason(item.value);
                  setError(null);
                }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: spacing[3],
                  paddingVertical: 13,
                  paddingHorizontal: 14,
                  borderRadius: radii.md,
                  backgroundColor: colors.surface,
                  borderWidth: selected ? 1.5 : 1,
                  borderColor: selected ? colors.primary : colors.border,
                }}
              >
                <View
                  style={{
                    width: 21,
                    height: 21,
                    borderRadius: radii.full,
                    borderWidth: 2,
                    borderColor: selected ? colors.primary : colors.borderStrong,
                    backgroundColor: selected ? colors.primary : "transparent",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {selected ? (
                    <View
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: radii.full,
                        backgroundColor: colors.onPrimary,
                      }}
                    />
                  ) : null}
                </View>
                <Text variant={selected ? "bodyStrong" : "body"} style={{ flex: 1 }}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={{ gap: spacing[1] + 3 }}>
          <Text variant="label" color="textSecondary">
            Conte o que aconteceu (opcional)
          </Text>
          <View
            style={{
              minHeight: 104,
              borderRadius: radii.md,
              backgroundColor: colors.surface,
              borderWidth: 1.5,
              borderColor: colors.border,
              padding: spacing[3] + 2,
            }}
          >
            <TextInput
              value={details}
              onChangeText={(text) => setDetails(text.slice(0, MAX_DETAILS))}
              placeholder="Datas, valores e o que foi combinado ajudam a nossa análise."
              placeholderTextColor={colors.textMuted}
              multiline
              textAlignVertical="top"
              accessibilityLabel="Detalhes da denúncia"
              style={{
                flex: 1,
                color: colors.textPrimary,
                fontFamily: nativeFonts.bodyRegular,
                fontSize: 13.5,
                lineHeight: 20,
              }}
            />
          </View>
        </View>

        {error ? (
          <Card variant="plain" style={{ backgroundColor: colors.dangerSoft }}>
            <Text variant="bodyStrong" color="danger">
              {error}
            </Text>
          </Card>
        ) : null}

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: spacing[2] + 1,
            backgroundColor: colors.surface2,
            borderRadius: radii.md,
            padding: spacing[3],
          }}
        >
          <Lock size={16} color={colors.textSecondary} />
          <Text variant="caption" color="textSecondary" style={{ flex: 1 }}>
            O profissional não vê quem denunciou. Analisamos em até 48 horas.
          </Text>
        </View>

        <Button label="Enviar denúncia" variant="danger" loading={sending} onPress={() => void submit()} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
