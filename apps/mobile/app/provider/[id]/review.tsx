import { createReview, getProviderById, hasUserReviewedProvider, type ProviderWithDetails } from "@eufaco/shared";
import {
  Button,
  Card,
  Text,
  fontSize,
  letterSpacing,
  lineHeight,
  nativeFonts,
  useTheme,
} from "@eufaco/design-system/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowRight, ShieldCheck, Star } from "lucide-react-native";
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

const MAX_COMMENT = 500;

const RATING_LABELS: Record<number, string> = {
  1: "Ruim",
  2: "Razoável",
  3: "Bom",
  4: "Muito bom",
  5: "Excelente",
};

export default function ReviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, radii, spacing, layout } = useTheme();
  const router = useRouter();
  const { session, loading: sessionLoading } = useSession();

  const [provider, setProvider] = useState<ProviderWithDetails | null>(null);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [loading, setLoading] = useState(true);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const userId = session?.user.id;

  useEffect(() => {
    if (!id) return;
    let active = true;
    setLoading(true);

    Promise.all([
      getProviderById(supabase, id),
      userId ? hasUserReviewedProvider(supabase, id, userId) : Promise.resolve(false),
    ])
      .then(([p, reviewed]) => {
        if (!active) return;
        setProvider(p as ProviderWithDetails | null);
        setAlreadyReviewed(reviewed);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id, userId]);

  const submit = async () => {
    if (rating === 0) return setError("Escolha uma nota de 1 a 5 estrelas.");
    if (!userId || !id) return;

    setSaving(true);
    setError(null);

    try {
      await createReview(supabase, id, userId, rating, comment.trim() || null);
      router.back();
    } catch {
      setError("Sua avaliação não foi enviada. Ela continua aqui, tente de novo.");
      setSaving(false);
    }
  };

  if (sessionLoading || loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <AppBar title="Avaliar serviço" />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </View>
    );
  }

  if (!session) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <AppBar title="Avaliar serviço" />
        <SignInPrompt
          title="Entre para avaliar"
          description="Só quem tem conta pode avaliar, para que cada opinião tenha um dono."
        />
      </View>
    );
  }

  if (!provider) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <AppBar title="Avaliar serviço" />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: layout.screenPadding }}>
          <Text variant="title" style={{ textAlign: "center" }}>
            Este perfil não está mais disponível.
          </Text>
        </View>
      </View>
    );
  }

  if (alreadyReviewed) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <AppBar title="Avaliar serviço" />
        <View style={{ flex: 1, justifyContent: "center", paddingHorizontal: layout.screenPadding, gap: spacing[4] }}>
          <Card style={{ alignItems: "center", gap: spacing[2], paddingVertical: spacing[8] }}>
            <Text variant="h2" style={{ textAlign: "center" }}>
              Você já avaliou
            </Text>
            <Text color="textSecondary" style={{ textAlign: "center" }}>
              Cada pessoa pode avaliar um profissional uma vez. Sua avaliação já está no perfil dele.
            </Text>
          </Card>
          <Button label="Voltar ao perfil" onPress={() => router.back()} />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <AppBar title="Avaliar serviço" />
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: layout.screenPadding,
          paddingTop: 20,
          paddingBottom: 20,
          gap: 20,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <Card style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              backgroundColor: colors.primarySoft,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text variant="initials" color="primaryStrong" style={{ fontSize: fontSize.subtitle }}>
              {initialsOf(provider.user.full_name)}
            </Text>
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text variant="title">{provider.user.full_name}</Text>
            <Text color="textSecondary" style={{ fontSize: fontSize.note }}>
              {[provider.categories[0]?.name, provider.neighborhood].filter(Boolean).join(" · ")}
            </Text>
          </View>
        </Card>

        <Card
          style={{
            alignItems: "center",
            gap: 14,
            paddingVertical: 24,
            paddingHorizontal: spacing[4],
          }}
        >
          <Text
            variant="h2"
            style={{
              fontFamily: nativeFonts.displayBold,
              fontSize: fontSize.sheet,
              letterSpacing: -0.4,
              lineHeight: fontSize.sheet * lineHeight.tight,
            }}
          >
            Como foi o serviço?
          </Text>

          <View style={{ flexDirection: "row", gap: 10 }}>
            {[1, 2, 3, 4, 5].map((value) => (
              <Pressable
                key={value}
                accessibilityRole="radio"
                accessibilityState={{ selected: rating === value }}
                accessibilityLabel={`${value} ${value === 1 ? "estrela" : "estrelas"}`}
                onPress={() => {
                  setRating(value);
                  setError(null);
                }}
                hitSlop={4}
              >
                <Star
                  size={38}
                  color={value <= rating ? colors.accent : colors.surface3}
                  fill={value <= rating ? colors.accent : colors.surface3}
                />
              </Pressable>
            ))}
          </View>

          <Text
            variant="title"
            color={rating > 0 ? "accent" : "textMuted"}
            style={{ fontSize: fontSize.base, letterSpacing: letterSpacing.normal }}
          >
            {rating > 0 ? RATING_LABELS[rating] : "Toque nas estrelas"}
          </Text>
        </Card>

        <View style={{ gap: 7 }}>
          <Text variant="label" color="textSecondary">
            Conte como foi (opcional)
          </Text>
          <View
            style={{
              minHeight: 128,
              borderRadius: radii.md,
              backgroundColor: colors.surface,
              borderWidth: 1.5,
              borderColor: colors.border,
              padding: 14,
            }}
          >
            <TextInput
              value={comment}
              onChangeText={(text) => setComment(text.slice(0, MAX_COMMENT))}
              placeholder="O profissional foi pontual? O serviço ficou bom? Sua opinião ajuda outras pessoas."
              placeholderTextColor={colors.textMuted}
              multiline
              textAlignVertical="top"
              accessibilityLabel="Comentário sobre o serviço"
              style={{
                flex: 1,
                color: colors.textPrimary,
                fontFamily: nativeFonts.bodyRegular,
                fontSize: fontSize.name,
                lineHeight: fontSize.name * lineHeight.normal,
              }}
            />
          </View>
          <Text
            variant="caption"
            color="textMuted"
            style={{ textAlign: "right", fontSize: fontSize.xs }}
          >
            {comment.length} / {MAX_COMMENT}
          </Text>
        </View>

        {error ? (
          <Card style={{ flexDirection: "row", gap: spacing[2] + 2, backgroundColor: colors.dangerSoft }} variant="plain">
            <Text variant="bodyStrong" color="danger" style={{ flex: 1 }}>
              {error}
            </Text>
          </Card>
        ) : null}

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 9,
            backgroundColor: colors.surface2,
            borderRadius: radii.md,
            padding: 12,
          }}
        >
          <ShieldCheck size={16} color={colors.textSecondary} />
          <Text
            variant="caption"
            color="textSecondary"
            style={{ flex: 1, lineHeight: fontSize.caption * 1.4 }}
          >
            Sua avaliação é pública e não pode ser editada depois.
          </Text>
        </View>

        <Button
          label="Enviar avaliação"
          loading={saving}
          icon={<ArrowRight size={18} color={colors.onPrimary} />}
          iconPosition="right"
          onPress={() => void submit()}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
