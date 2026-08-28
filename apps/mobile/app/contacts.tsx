import { getUserContacts, type ContactedProvider } from "@eufaco/shared";
import { Card, Text, useTheme } from "@eufaco/design-system/native";
import { useFocusEffect, useRouter } from "expo-router";
import { MessageCircle, SquarePen, Star } from "lucide-react-native";
import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";
import { AppBar } from "@/components/AppBar";
import { SignInPrompt } from "@/components/SignInPrompt";
import { initialsOf } from "@/lib/format";
import { useSession } from "@/lib/session";
import { supabase } from "@/lib/supabase";

function formatContactDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "numeric", month: "long" });
}

export default function ContactsScreen() {
  const { colors, radii, spacing, layout } = useTheme();
  const router = useRouter();
  const { session, loading: sessionLoading } = useSession();

  const [contacts, setContacts] = useState<ContactedProvider[]>([]);
  const [loading, setLoading] = useState(true);

  const userId = session?.user.id;

  useFocusEffect(
    useCallback(() => {
      if (!userId) {
        setLoading(false);
        return () => undefined;
      }
      let active = true;
      setLoading(true);
      getUserContacts(supabase, userId)
        .then((result) => {
          if (active) setContacts(result);
        })
        .finally(() => {
          if (active) setLoading(false);
        });
      return () => {
        active = false;
      };
    }, [userId]),
  );

  if (sessionLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <AppBar title="Meus contatos" />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </View>
    );
  }

  if (!session) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <AppBar title="Meus contatos" />
        <SignInPrompt
          title="Seus contatos ficam aqui"
          description="Entre para ver com quem você já falou e avaliar quem te atendeu."
        />
      </View>
    );
  }

  const pending = contacts.filter((c) => c.myRating === null);
  const reviewed = contacts.filter((c) => c.myRating !== null);

  const renderContact = (contact: ContactedProvider) => (
    // O botão "Avaliar" não pode ficar dentro de outro botão: só a linha
    // superior é tocável para abrir o perfil.
    <Card
      key={contact.providerId}
      style={{
        gap: spacing[3],
        borderColor: contact.myRating === null ? colors.primary : colors.border,
        borderWidth: contact.myRating === null ? 1.5 : 1,
      }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={contact.fullName}
        onPress={() => router.push(`/provider/${contact.providerId}`)}
        style={({ pressed }) => ({
          flexDirection: "row",
          alignItems: "center",
          gap: spacing[3],
          opacity: pressed ? 0.9 : 1,
        })}
      >
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
              {initialsOf(contact.fullName)}
            </Text>
          </View>

          <View style={{ flex: 1, gap: 2 }}>
            <Text variant="title" numberOfLines={1}>
              {contact.fullName}
            </Text>
            <Text variant="caption" color="textSecondary" numberOfLines={1}>
              {[contact.categoryName, formatContactDate(contact.lastContactAt)].filter(Boolean).join(" · ")}
            </Text>
          </View>

          <View
            style={{
              width: 34,
              height: 34,
              borderRadius: 11,
              backgroundColor: colors.successSoft,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
          <MessageCircle size={16} color={colors.whatsapp} />
        </View>
      </Pressable>

      <View style={{ height: 1, backgroundColor: colors.border }} />

        {contact.myRating === null ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing[2] + 1 }}>
            <Text variant="label" style={{ flex: 1 }}>
              Como foi o serviço?
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Avaliar ${contact.fullName}`}
              onPress={() => router.push(`/provider/${contact.providerId}/review`)}
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
              <Star size={14} color={colors.onPrimary} />
              <Text variant="label" color="onPrimary">
                Avaliar
              </Text>
            </Pressable>
          </View>
        ) : (
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing[2] }}>
            <View style={{ flexDirection: "row", gap: 2 }}>
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  size={13}
                  color={i < (contact.myRating ?? 0) ? colors.accent : colors.surface3}
                  fill={i < (contact.myRating ?? 0) ? colors.accent : colors.surface3}
                />
              ))}
            </View>
            <Text variant="caption" color="textMuted" style={{ flex: 1 }}>
              Você avaliou
            </Text>
          <SquarePen size={15} color={colors.textMuted} />
        </View>
      )}
    </Card>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <AppBar title="Meus contatos" />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: layout.screenPadding,
          paddingTop: spacing[3],
          paddingBottom: spacing[8],
          gap: spacing[5],
        }}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={{ paddingVertical: spacing[10], alignItems: "center" }}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : contacts.length === 0 ? (
          <Card style={{ alignItems: "center", paddingVertical: spacing[8], gap: spacing[2] }}>
            <Text variant="title">Você ainda não chamou ninguém</Text>
            <Text color="textSecondary" style={{ textAlign: "center" }}>
              Quando você pedir um orçamento pelo WhatsApp, o profissional aparece aqui para você avaliar depois.
            </Text>
          </Card>
        ) : (
          <>
            <Text color="textSecondary">
              Profissionais que você chamou no WhatsApp. Avaliar ajuda quem vai contratar depois de você.
            </Text>

            {pending.length > 0 ? (
              <View style={{ gap: spacing[3] }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: spacing[2] }}>
                  <Text variant="h3">Aguardando sua avaliação</Text>
                  <View
                    style={{
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                      borderRadius: radii.full,
                      backgroundColor: colors.primary,
                    }}
                  >
                    <Text variant="caption" color="onPrimary">
                      {pending.length}
                    </Text>
                  </View>
                </View>
                <View style={{ gap: spacing[3] - 1 }}>{pending.map(renderContact)}</View>
              </View>
            ) : null}

            {reviewed.length > 0 ? (
              <View style={{ gap: spacing[3] }}>
                <Text variant="h3">Contatos anteriores</Text>
                <View style={{ gap: spacing[3] - 1 }}>{reviewed.map(renderContact)}</View>
              </View>
            ) : null}
          </>
        )}
      </ScrollView>
    </View>
  );
}
