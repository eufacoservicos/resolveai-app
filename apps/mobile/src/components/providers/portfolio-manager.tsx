import { useState } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import { Image } from "expo-image";
import { ImagePlus, Trash2, Upload, X } from "lucide-react-native";
import { toast } from "sonner-native";
import { MAX_PORTFOLIO_IMAGES } from "@resolveai/shared/constants";
import { deletePortfolioImage } from "@resolveai/shared/supabase/mutations";
import { supabase } from "@/lib/supabase";
import {
  pickMultipleImages,
  uploadPortfolioImage,
  type PickedImage,
} from "@/lib/image-upload";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Text, Muted } from "@/components/ui/text";
import { cn } from "@resolveai/shared/cn";

export type PortfolioImage = {
  id: string;
  image_url: string;
  created_at: string;
};

type PendingUpload = {
  id: string;
  image: PickedImage;
  status: "pending" | "uploading" | "error";
};

type Props = {
  providerId: string;
  userId: string;
  images: PortfolioImage[];
  onChanged?: () => void;
};

export function PortfolioManager({
  providerId,
  userId,
  images: initialImages,
  onChanged,
}: Props) {
  const [images, setImages] = useState(initialImages);
  const [pending, setPending] = useState<PendingUpload[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PortfolioImage | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const totalSlots = MAX_PORTFOLIO_IMAGES;
  const usedSlots =
    images.length + pending.filter((p) => p.status !== "error").length;
  const remainingSlots = totalSlots - usedSlots;

  async function handlePick() {
    try {
      const picked = await pickMultipleImages(remainingSlots);
      if (picked.length === 0) return;

      setPending((prev) => [
        ...prev,
        ...picked.map((image, i) => ({
          id: `${Date.now()}-${i}`,
          image,
          status: "pending" as const,
        })),
      ]);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erro ao selecionar imagens."
      );
    }
  }

  function removePending(id: string) {
    setPending((prev) => prev.filter((p) => p.id !== id));
  }

  async function uploadAll() {
    const toUpload = pending.filter(
      (p) => p.status === "pending" || p.status === "error"
    );
    if (toUpload.length === 0) return;

    setIsUploading(true);
    let successCount = 0;

    for (let i = 0; i < toUpload.length; i++) {
      const item = toUpload[i];
      setUploadProgress({ current: i + 1, total: toUpload.length });

      setPending((prev) =>
        prev.map((p) => (p.id === item.id ? { ...p, status: "uploading" } : p))
      );

      const { data, error } = await uploadPortfolioImage(
        providerId,
        userId,
        item.image
      );

      if (error) {
        setPending((prev) =>
          prev.map((p) => (p.id === item.id ? { ...p, status: "error" } : p))
        );
        toast.error(error.message);
      } else {
        successCount++;
        if (data) setImages((prev) => [...prev, data]);
        setPending((prev) => prev.filter((p) => p.id !== item.id));
      }
    }

    if (successCount > 0) {
      toast.success(
        `${successCount} ${successCount === 1 ? "imagem enviada" : "imagens enviadas"} com sucesso!`
      );
      onChanged?.();
    }

    setUploadProgress(null);
    setIsUploading(false);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);

    const { error } = await deletePortfolioImage(
      supabase,
      deleteTarget.id,
      deleteTarget.image_url
    );

    if (error) {
      toast.error("Erro ao remover imagem.");
    } else {
      setImages((prev) => prev.filter((img) => img.id !== deleteTarget.id));
      toast.success("Imagem removida!");
      onChanged?.();
    }

    setIsDeleting(false);
    setDeleteTarget(null);
  }

  const pendingCount = pending.filter(
    (p) => p.status === "pending" || p.status === "error"
  ).length;

  return (
    <View className="gap-5 rounded-xl border border-border bg-card p-5">
      {/* Contador + botao de adicionar */}
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-sm font-medium">
            {images.length} de {totalSlots} fotos
          </Text>
          <View className="mt-1.5 h-1.5 w-32 overflow-hidden rounded-full bg-muted">
            <View
              className="h-full rounded-full bg-primary"
              style={{ width: `${(images.length / totalSlots) * 100}%` }}
            />
          </View>
        </View>
        {remainingSlots > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="border-primary/30"
            disabled={isUploading}
            onPress={handlePick}
          >
            <Upload size={16} color="#22d3ee" />
            <Text className="text-sm font-semibold text-primary">Adicionar</Text>
          </Button>
        )}
      </View>

      {/* Fila de envio */}
      {pending.length > 0 && (
        <View className="gap-3">
          <Muted className="text-xs font-medium">Imagens para enviar</Muted>
          <View className="flex-row flex-wrap" style={{ gap: 12 }}>
            {pending.map((item) => (
              <View
                key={item.id}
                style={{ width: "30%", aspectRatio: 1 }}
                className="overflow-hidden rounded-lg border-2 border-dashed border-primary/30"
              >
                <Image
                  source={{ uri: item.image.uri }}
                  style={{ width: "100%", height: "100%" }}
                  contentFit="cover"
                />
                {item.status === "uploading" && (
                  <View className="absolute inset-0 items-center justify-center bg-black/40">
                    <ActivityIndicator size="small" color="#ffffff" />
                  </View>
                )}
                {item.status === "error" && (
                  <View className="absolute inset-0 items-center justify-center bg-red-500/40">
                    <Text className="text-xs font-semibold text-white">Erro</Text>
                  </View>
                )}
                {item.status !== "uploading" && !isUploading && (
                  <Pressable
                    onPress={() => removePending(item.id)}
                    hitSlop={6}
                    accessibilityRole="button"
                    accessibilityLabel="Remover da fila"
                    className="absolute right-1 top-1 h-6 w-6 items-center justify-center rounded-full bg-black/60"
                  >
                    <X size={14} color="#ffffff" />
                  </Pressable>
                )}
              </View>
            ))}
          </View>

          {pendingCount > 0 && (
            <Button
              onPress={uploadAll}
              loading={isUploading}
              className="h-10 w-full"
            >
              <Upload size={16} color="#ffffff" />
              <Text className="text-base font-semibold text-primary-foreground">
                {uploadProgress
                  ? `Enviando ${uploadProgress.current} de ${uploadProgress.total}...`
                  : `Enviar ${pendingCount} imagem(ns)`}
              </Text>
            </Button>
          )}
        </View>
      )}

      {/* Grade enviada */}
      {images.length === 0 && pending.length === 0 ? (
        <View className="items-center py-12">
          <View className="mb-3 h-14 w-14 items-center justify-center rounded-xl bg-muted">
            <ImagePlus size={28} color="#8891a4" />
          </View>
          <Text className="text-center font-medium">Nenhuma imagem ainda</Text>
          <Muted className="mt-1 text-center">
            Adicione fotos dos seus trabalhos
          </Muted>
        </View>
      ) : images.length > 0 ? (
        <View className="flex-row flex-wrap" style={{ gap: 12 }}>
          {images.map((img) => (
            <View
              key={img.id}
              style={{ width: "47%", aspectRatio: 1 }}
              className={cn("overflow-hidden rounded-lg")}
            >
              <Image
                source={{ uri: img.image_url }}
                style={{ width: "100%", height: "100%" }}
                contentFit="cover"
              />
              <Pressable
                onPress={() => setDeleteTarget(img)}
                hitSlop={6}
                accessibilityRole="button"
                accessibilityLabel="Excluir foto"
                className="absolute right-2 top-2 h-8 w-8 items-center justify-center rounded-full bg-red-500"
              >
                <Trash2 size={16} color="#ffffff" />
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Excluir foto"
        description="Tem certeza que deseja excluir esta foto do portfólio? Essa ação não pode ser desfeita."
        actionLabel={isDeleting ? "Excluindo..." : "Excluir"}
        onAction={confirmDelete}
        loading={isDeleting}
        destructive
      />
    </View>
  );
}
