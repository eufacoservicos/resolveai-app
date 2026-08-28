import { deleteOwnAccount } from "@eufaco/shared";
import { Button, Card, Text, useTheme } from "@eufaco/design-system/native";
import { useRouter } from "expo-router";
import { TriangleAlert, X } from "lucide-react-native";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { AppBar } from "@/components/AppBar";
import { Field } from "@/components/Field";
import { supabase } from "@/lib/supabase";

const CONFIRMATION = "EXCLUIR";

const CONSEQUENCES = [
  "Seu perfil sai da busca imediatamente",
  "As avaliações que você escreveu são apagadas",
  "Seus favoritos e histórico de contatos somem",
  "Portfólio, horários e ofertas são removidos",
  "A assinatura ativa é cancelada sem reembolso",
];

export default function DeleteAccountScreen() {
  const { colors, radii, spacing, layout } = useTheme();
  const router = useRouter();

  const [typed, setTyped] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const confirmed = typed.trim().toUpperCase() === CONFIRMATION;

  const submit = async () => {
    if (!confirmed) {
      setError(`Digite ${CONFIRMATION} para confirmar.`);
      return;
    }

    setDeleting(true);
    setError(null);

    const { error: deleteError } = await deleteOwnAccount(supabase);

    if (deleteError) {
      setDeleting(false);
      setError("Não foi possível excluir a conta agora. Tente de novo em instantes.");
      return;
    }

    // O signOut já aconteceu dentro de deleteOwnAccount
    router.replace("/");
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <AppBar title="Excluir conta" />
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: layout.screenPadding,
          paddingTop: spacing[4],
          paddingBottom: spacing[8],
          gap: spacing[5],
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={{
            width: 66,
            height: 66,
            borderRadius: 21,
            backgroundColor: colors.dangerSoft,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <TriangleAlert size={29} color={colors.danger} />
        </View>

        <View style={{ gap: spacing[2] }}>
          <Text variant="h1">Excluir sua conta?</Text>
          <Text color="textSecondary">
            Esta ação é permanente. Não conseguimos recuperar nada depois de confirmada.
          </Text>
        </View>

        <Card variant="plain" style={{ backgroundColor: colors.dangerSoft, gap: spacing[3], padding: spacing[4] }}>
          <Text variant="bodyStrong" color="danger">
            O que você perde
          </Text>
          {CONSEQUENCES.map((item) => (
            <View key={item} style={{ flexDirection: "row", alignItems: "center", gap: spacing[2] + 1 }}>
              <X size={14} color={colors.danger} />
              <Text variant="caption" style={{ flex: 1 }}>
                {item}
              </Text>
            </View>
          ))}
        </Card>

        <Field
          label={`Digite ${CONFIRMATION} para confirmar`}
          value={typed}
          onChangeText={(text) => {
            setTyped(text);
            setError(null);
          }}
          placeholder={CONFIRMATION}
          autoCapitalize="characters"
          autoCorrect={false}
          error={error}
        />

        <View style={{ gap: spacing[2], opacity: confirmed ? 1 : 0.5 }}>
          <Button
            label="Excluir permanentemente"
            variant="danger"
            loading={deleting}
            disabled={!confirmed}
            onPress={() => void submit()}
          />
        </View>

        <Button label="Manter minha conta" variant="secondary" onPress={() => router.back()} />

        <Text variant="caption" color="textMuted" style={{ textAlign: "center" }}>
          Ao excluir, você sai da conta automaticamente neste aparelho.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
