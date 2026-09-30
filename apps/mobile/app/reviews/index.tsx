import { createReviewReply, getProviderReviews } from "@eufaco/shared";
import {
  Button,
  Card,
  Text,
  fontSize,
  nativeFonts,
  useTheme,
} from "@eufaco/design-system/native";
import { CircleCheck, Eye, Lightbulb, Reply, Star } from "lucide-react-native";
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
import { useProviderAccount } from "@/hooks/useProviderAccount";
import { initialsOf } from "@/lib/format";
import { useSession } from "@/lib/session";
import { supabase } from "@/lib/supabase";

type Review = Awaited<ReturnType<typeof getProviderReviews>>[number];

const MAX_REPLY = 500;

const TIPS = [
  "Reconhece o ponto do cliente sem discutir",
  "Explica o que mudou para não repetir",
  "Fica curta — quem lê está comparando perfis",
];

function relativeDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "numeric", month: "long" });
}

export default function ReceivedReviewsScreen() {
  const { colors, radii, spacing, layout } = useTheme();
  const { session, loading: sessionLoading } = useSession();
  const { provider, loading: accountLoading } = useProviderAccount();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const providerId = provider?.id;

  useEffect(() => {
    if (!providerId) {
      setLoading(false);
      return;
    }
    let active = true;
    getProviderReviews(supabase, providerId)
      .then((result) => {
        if (active) setReviews(result);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [providerId]);

  const sendReply = async (reviewId: string) => {
    if (!providerId) return;
    if (replyText.trim().length < 5) {
      setError("Escreva uma resposta com pelo menos 5 letras.");
      return;
    }

    setSending(true);
    setError(null);

    const { error: replyError } = await createReviewReply(
      supabase,
      reviewId,
      providerId,
      replyText.trim(),
    );

    setSending(false);

    if (replyError) {
      setError("Sua resposta não foi enviada. Ela continua aqui, tente de novo.");
      return;
    }

    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId
          ? { ...r, reply: { content: replyText.trim(), created_at: new Date().toISOString() } }
          : r,
      ),
    );
    setReplyingTo(null);
    setReplyText("");
  };

  if (sessionLoading || accountLoading || loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <AppBar title="Avaliações" />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </View>
    );
  }

  if (!session) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <AppBar title="Avaliações" />
        <SignInPrompt
          title="Suas avaliações"
          description="Entre com sua conta de profissional para ver e responder quem avaliou você."
        />
      </View>
    );
  }

  if (!provider) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <AppBar title="Avaliações" />
        <View style={{ flex: 1, justifyContent: "center", paddingHorizontal: layout.screenPadding }}>
          <Card style={{ alignItems: "center", gap: spacing[2], paddingVertical: spacing[8] }}>
            <Text variant="title">Você ainda não tem perfil profissional</Text>
            <Text color="textSecondary" style={{ textAlign: "center" }}>
              Crie seu perfil para começar a receber avaliações.
            </Text>
          </Card>
        </View>
      </View>
    );
  }

  const unanswered = reviews.filter((r) => !r.reply).length;
  const average =
    reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : null;

  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));
  const maxCount = Math.max(1, ...distribution.map((d) => d.count));

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <AppBar title="Avaliações" />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: layout.screenPadding,
          paddingTop: 10,
          paddingBottom: spacing[8],
          gap: 18,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {reviews.length === 0 ? (
          <Card style={{ alignItems: "center", paddingVertical: spacing[8], gap: spacing[2] }}>
            <Text variant="title">Nenhuma avaliação ainda</Text>
            <Text color="textSecondary" style={{ textAlign: "center" }}>
              Quem você atende recebe um lembrete para avaliar depois do contato.
            </Text>
          </Card>
        ) : (
          <>
            <Card style={{ flexDirection: "row", gap: 20, alignItems: "center", padding: 16 }}>
              <View style={{ alignItems: "center", gap: 5 }}>
                <Text variant="h1">{average?.toFixed(1).replace(".", ",")}</Text>
                <View style={{ flexDirection: "row", gap: 2 }}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      size={13}
                      color={i < Math.round(average ?? 0) ? colors.accent : colors.surface3}
                      fill={i < Math.round(average ?? 0) ? colors.accent : colors.surface3}
                    />
                  ))}
                </View>
                <Text variant="caption" color="textMuted">
                  {reviews.length} {reviews.length === 1 ? "avaliação" : "avaliações"}
                </Text>
              </View>

              <View style={{ flex: 1, gap: 6 }}>
                {distribution.map((row) => (
                  <View key={row.star} style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
                    <Text variant="caption" color="textSecondary">
                      {row.star}
                    </Text>
                    <Star size={10} color={colors.accent} fill={colors.accent} />
                    <View
                      style={{
                        flex: 1,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: colors.surface3,
                        overflow: "hidden",
                      }}
                    >
                      <View
                        style={{
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: colors.accent,
                          width: `${(row.count / maxCount) * 100}%`,
                        }}
                      />
                    </View>
                    <Text variant="caption" color="textMuted">
                      {row.count}
                    </Text>
                  </View>
                ))}
              </View>
            </Card>

            {unanswered > 0 ? (
              <Text variant="label" color="primaryStrong">
                {unanswered} {unanswered === 1 ? "avaliação sem resposta" : "avaliações sem resposta"}
              </Text>
            ) : null}

            {reviews.map((review) => {
              const isReplying = replyingTo === review.id;

              return (
                <Card
                  key={review.id}
                  style={{
                    gap: 12,
                    borderColor: review.reply ? colors.border : colors.primary,
                    borderWidth: review.reply ? 1 : 1.5,
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <View
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: radii.full,
                        backgroundColor: colors.surface3,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text variant="label" color="textSecondary">
                        {initialsOf(review.client.full_name)}
                      </Text>
                    </View>
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text variant="bodyStrong">{review.client.full_name}</Text>
                      <Text variant="caption" color="textMuted">
                        {relativeDate(review.created_at)}
                      </Text>
                    </View>
                    <View style={{ flexDirection: "row", gap: 2 }}>
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          size={13}
                          color={i < review.rating ? colors.accent : colors.surface3}
                          fill={i < review.rating ? colors.accent : colors.surface3}
                        />
                      ))}
                    </View>
                  </View>

                  {review.comment ? <Text color="textSecondary">{review.comment}</Text> : null}

                  {review.reply ? (
                    <View
                      style={{
                        backgroundColor: colors.surface2,
                        borderRadius: radii.md,
                        padding: 12,
                        gap: 7,
                      }}
                    >
                      <Text variant="label" color="primaryStrong">
                        Sua resposta
                      </Text>
                      <Text variant="caption" color="textSecondary">
                        {review.reply.content}
                      </Text>
                    </View>
                  ) : isReplying ? (
                    <View style={{ gap: 12 }}>
                      <View
                        style={{
                          minHeight: 150,
                          borderRadius: radii.md,
                          backgroundColor: colors.surface,
                          borderWidth: 1.5,
                          borderColor: colors.primary,
                          padding: 14,
                        }}
                      >
                        <TextInput
                          value={replyText}
                          onChangeText={(text) => setReplyText(text.slice(0, MAX_REPLY))}
                          placeholder="Responda com calma. Quem lê está comparando perfis."
                          placeholderTextColor={colors.textMuted}
                          multiline
                          autoFocus
                          textAlignVertical="top"
                          accessibilityLabel="Sua resposta"
                          style={{
                            flex: 1,
                            color: colors.textPrimary,
                            fontFamily: nativeFonts.bodyRegular,
                            fontSize: fontSize.name,
                            lineHeight: fontSize.name * 1.5,
                          }}
                        />
                      </View>

                      <Text
                        color="textMuted"
                        style={{ textAlign: "right", fontSize: fontSize.xs }}
                      >
                        {replyText.length} / {MAX_REPLY}
                      </Text>

                      <View
                        style={{
                          backgroundColor: colors.primarySoft,
                          borderRadius: radii.md,
                          padding: 14,
                          gap: 9,
                        }}
                      >
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                          <Lightbulb size={15} color={colors.primaryStrong} />
                          <Text
                            variant="titleSm"
                            color="primaryStrong"
                            style={{ fontSize: fontSize.chip }}
                          >
                            Uma boa resposta
                          </Text>
                        </View>
                        {TIPS.map((tip) => (
                          <View
                            key={tip}
                            style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
                          >
                            <CircleCheck size={14} color={colors.primaryStrong} />
                            <Text
                              color="textSecondary"
                              style={{ flex: 1, fontSize: fontSize.note }}
                            >
                              {tip}
                            </Text>
                          </View>
                        ))}
                      </View>

                      <View
                        style={{
                          flexDirection: "row",
                          gap: 9,
                          padding: 12,
                          borderRadius: radii.md,
                          backgroundColor: colors.surface2,
                        }}
                      >
                        <Eye size={16} color={colors.textSecondary} />
                        <Text
                          color="textSecondary"
                          style={{ flex: 1, fontSize: fontSize.caption }}
                        >
                          Sua resposta aparece no seu perfil, logo abaixo da avaliação.
                        </Text>
                      </View>

                      {error ? (
                        <Text variant="caption" color="danger">
                          {error}
                        </Text>
                      ) : null}

                      <View style={{ flexDirection: "row", gap: spacing[2] }}>
                        <View style={{ flex: 1 }}>
                          <Button
                            label="Cancelar"
                            variant="secondary"
                            size="md"
                            onPress={() => {
                              setReplyingTo(null);
                              setReplyText("");
                              setError(null);
                            }}
                          />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Button
                            label="Publicar"
                            size="md"
                            loading={sending}
                            onPress={() => void sendReply(review.id)}
                          />
                        </View>
                      </View>
                    </View>
                  ) : (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: spacing[2] }}>
                      <Text variant="label" color="primaryStrong" style={{ flex: 1 }}>
                        Ainda sem resposta
                      </Text>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Responder ${review.client.full_name}`}
                        onPress={() => {
                          setReplyingTo(review.id);
                          setReplyText("");
                          setError(null);
                        }}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: spacing[1] + 2,
                          paddingVertical: 9,
                          paddingHorizontal: 15,
                          borderRadius: radii.full,
                          backgroundColor: colors.primary,
                        }}
                      >
                        <Reply size={14} color={colors.onPrimary} />
                        <Text variant="label" color="onPrimary">
                          Responder
                        </Text>
                      </Pressable>
                    </View>
                  )}
                </Card>
              );
            })}
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
