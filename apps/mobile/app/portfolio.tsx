import {
  MAX_PORTFOLIO_IMAGES,
  deletePortfolioImage,
  uploadPortfolioImage,
  type PortfolioImage,
} from "@eufaco/shared";
import { Button, Card, Text, useTheme } from "@eufaco/design-system/native";
import { ImageIcon, Plus, Trash2, Upload } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, View } from "react-native";
import { AppBar } from "@/components/AppBar";
import { SignInPrompt } from "@/components/SignInPrompt";
import { useProviderAccount } from "@/hooks/useProviderAccount";
import { isPickError, pickImage } from "@/lib/upload";
import { useSession } from "@/lib/session";
import { supabase } from "@/lib/supabase";

const COLUMNS = 2;

export default function PortfolioScreen() {
  const { colors, radii, spacing, layout } = useTheme();
  const { session, loading: sessionLoading } = useSession();
  const { provider, loading: accountLoading } = useProviderAccount();

  const [images, setImages] = useState<PortfolioImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (provider) setImages(provider.portfolio ?? []);
  }, [provider]);

  const add = async () => {
    if (!provider || !session) return;

    if (images.length >= MAX_PORTFOLIO_IMAGES) {
      setError(`Você já tem ${MAX_PORTFOLIO_IMAGES} fotos. Remova uma para adicionar outra.`);
      return;
    }

    const picked = await pickImage([4, 3]);
    if (!picked) return;
    if (isPickError(picked)) {
      setError(picked.message);
      return;
    }

    setUploading(true);
    setError(null);

    const { data, error: uploadError } = await uploadPortfolioImage(
      supabase,
      provider.id,
      session.user.id,
      picked.file,
    );

    setUploading(false);

    if (uploadError || !data) {
      setError("A foto não foi enviada. Tente outra imagem ou reduza o tamanho.");
      return;
    }
    setImages((prev) => [...prev, data as PortfolioImage]);
  };

  const remove = (image: PortfolioImage) => {
    Alert.alert("Remover esta foto?", "Ela sai do seu portfólio na hora e não dá para recuperar depois.", [
      { text: "Manter", style: "cancel" },
      {
        text: "Remover",
        style: "destructive",
        onPress: () => {
          const previous = images;
          setImages((prev) => prev.filter((i) => i.id !== image.id));

          void deletePortfolioImage(supabase, image.id, image.image_url).then(({ error: deleteError }) => {
            if (deleteError) {
              setImages(previous);
              setError("Não foi possível remover a foto. Tente de novo.");
            }
          });
        },
      },
    ]);
  };

  if (sessionLoading || accountLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <AppBar title="Portfólio" />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </View>
    );
  }

  if (!session) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <AppBar title="Portfólio" />
        <SignInPrompt
          title="Seu portfólio"
          description="Entre com sua conta de profissional para mostrar fotos dos seus trabalhos."
        />
      </View>
    );
  }

  if (!provider) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <AppBar title="Portfólio" />
        <View style={{ flex: 1, justifyContent: "center", paddingHorizontal: layout.screenPadding }}>
          <Card style={{ alignItems: "center", gap: spacing[2], paddingVertical: spacing[8] }}>
            <Text variant="title">Você ainda não tem perfil profissional</Text>
            <Text color="textSecondary" style={{ textAlign: "center" }}>
              Crie seu perfil para montar um portfólio.
            </Text>
          </Card>
        </View>
      </View>
    );
  }

  // Grade de duas colunas montada à mão: são poucas fotos e o layout
  // precisa acomodar a célula de "adicionar" no fim.
  const rows: (PortfolioImage | "add")[][] = [];
  const cells: (PortfolioImage | "add")[] = [...images];
  if (images.length < MAX_PORTFOLIO_IMAGES) cells.push("add");
  for (let i = 0; i < cells.length; i += COLUMNS) rows.push(cells.slice(i, i + COLUMNS));

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <AppBar title="Portfólio" />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: layout.screenPadding,
          paddingTop: spacing[3],
          paddingBottom: spacing[8],
          gap: spacing[4],
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text variant="title">
            {images.length} de {MAX_PORTFOLIO_IMAGES} fotos
          </Text>
          {images.length > 0 ? (
            <Text variant="caption" color="textMuted">
              A primeira é a capa
            </Text>
          ) : null}
        </View>

        {error ? (
          <Card variant="plain" style={{ backgroundColor: colors.dangerSoft }}>
            <Text variant="bodyStrong" color="danger">
              {error}
            </Text>
          </Card>
        ) : null}

        <View style={{ gap: spacing[3] - 1 }}>
          {rows.map((row, rowIndex) => (
            <View key={rowIndex} style={{ flexDirection: "row", gap: spacing[3] - 1 }}>
              {row.map((cell, cellIndex) =>
                cell === "add" ? (
                  <Pressable
                    key="add"
                    accessibilityRole="button"
                    accessibilityLabel="Adicionar foto"
                    onPress={() => void add()}
                    disabled={uploading}
                    style={{
                      flex: 1,
                      height: 126,
                      alignItems: "center",
                      justifyContent: "center",
                      gap: spacing[1] + 3,
                      borderRadius: radii.md,
                      backgroundColor: colors.surface,
                      borderWidth: 2,
                      borderColor: colors.borderStrong,
                    }}
                  >
                    {uploading ? (
                      <ActivityIndicator color={colors.primary} />
                    ) : (
                      <>
                        <Plus size={22} color={colors.textMuted} />
                        <Text variant="label" color="textMuted">
                          Adicionar
                        </Text>
                      </>
                    )}
                  </Pressable>
                ) : (
                  <View
                    key={cell.id}
                    style={{
                      flex: 1,
                      height: 126,
                      borderRadius: radii.md,
                      overflow: "hidden",
                      backgroundColor: colors.surface3,
                    }}
                  >
                    <Image
                      source={{ uri: cell.image_url }}
                      style={{ width: "100%", height: "100%" }}
                      resizeMode="cover"
                      accessibilityIgnoresInvertColors
                    />

                    {rowIndex === 0 && cellIndex === 0 ? (
                      <View
                        style={{
                          position: "absolute",
                          left: 8,
                          bottom: 8,
                          paddingVertical: 4,
                          paddingHorizontal: 8,
                          borderRadius: radii.full,
                          backgroundColor: colors.overlay,
                        }}
                      >
                        <Text variant="caption" style={{ color: "#FFFFFF" }}>
                          Capa
                        </Text>
                      </View>
                    ) : null}

                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Remover foto"
                      onPress={() => remove(cell)}
                      hitSlop={6}
                      style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        width: 26,
                        height: 26,
                        borderRadius: radii.full,
                        backgroundColor: colors.overlay,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Trash2 size={13} color="#FFFFFF" />
                    </Pressable>
                  </View>
                ),
              )}
              {row.length < COLUMNS ? <View style={{ flex: 1 }} /> : null}
            </View>
          ))}
        </View>

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
          <ImageIcon size={16} color={colors.textSecondary} />
          <Text variant="caption" color="textSecondary" style={{ flex: 1 }}>
            Fotos reais dos seus serviços aumentam bastante os contatos.
          </Text>
        </View>

        {images.length < MAX_PORTFOLIO_IMAGES ? (
          <Button
            label="Enviar novas fotos"
            loading={uploading}
            icon={<Upload size={18} color={colors.onPrimary} />}
            onPress={() => void add()}
          />
        ) : null}
      </ScrollView>
    </View>
  );
}
