"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import {
  uploadPortfolioImage,
  deletePortfolioImage,
} from "@/lib/supabase/mutations";
import { Button } from "@/components/ui/button";
import { Trash2, Upload, ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { MAX_PORTFOLIO_IMAGES } from "@/lib/constants";

interface PortfolioManagerProps {
  providerId: string;
  userId: string;
  images: { id: string; image_url: string; created_at: string }[];
}

interface PendingUpload {
  id: string;
  file: File;
  preview: string;
  status: "pending" | "uploading" | "done" | "error";
}

export function PortfolioManager({
  providerId,
  userId,
  images: initialImages,
}: PortfolioManagerProps) {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState(initialImages);
  const [pending, setPending] = useState<PendingUpload[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null);

  const totalSlots = MAX_PORTFOLIO_IMAGES;
  const usedSlots = images.length + pending.filter((p) => p.status !== "error").length;
  const remainingSlots = totalSlots - usedSlots;

  function handleFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    const maxToAdd = Math.min(files.length, remainingSlots);
    if (files.length > remainingSlots) {
      toast.error(`Você pode adicionar no máximo ${remainingSlots} imagem(ns).`);
    }

    const newPending: PendingUpload[] = [];
    for (let i = 0; i < maxToAdd; i++) {
      const file = files[i];

      if (file.size > 5 * 1024 * 1024) {
        toast.error(`"${file.name}" excede 5MB e foi ignorada.`);
        continue;
      }

      newPending.push({
        id: `${Date.now()}-${i}`,
        file,
        preview: URL.createObjectURL(file),
        status: "pending",
      });
    }

    if (newPending.length > 0) {
      setPending((prev) => [...prev, ...newPending]);
    }

    e.target.value = "";
  }

  function removePending(id: string) {
    setPending((prev) => {
      const item = prev.find((p) => p.id === id);
      if (item) URL.revokeObjectURL(item.preview);
      return prev.filter((p) => p.id !== id);
    });
  }

  async function uploadAll() {
    const toUpload = pending.filter((p) => p.status === "pending" || p.status === "error");
    if (toUpload.length === 0) return;

    setIsUploading(true);
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < toUpload.length; i++) {
      const item = toUpload[i];
      setUploadProgress({ current: i + 1, total: toUpload.length });

      setPending((prev) =>
        prev.map((p) => (p.id === item.id ? { ...p, status: "uploading" } : p))
      );

      const { error } = await uploadPortfolioImage(
        supabase,
        providerId,
        userId,
        item.file
      );

      if (error) {
        errorCount++;
        setPending((prev) =>
          prev.map((p) => (p.id === item.id ? { ...p, status: "error" } : p))
        );
        toast.error(
          "message" in error ? error.message : `Erro ao enviar "${item.file.name}".`
        );
      } else {
        successCount++;
        setPending((prev) => {
          const p = prev.find((p) => p.id === item.id);
          if (p) URL.revokeObjectURL(p.preview);
          return prev.filter((p) => p.id !== item.id);
        });
      }
    }

    if (successCount > 0) {
      toast.success(
        `${successCount} ${successCount === 1 ? "imagem enviada" : "imagens enviadas"} com sucesso!`
      );
    }

    setUploadProgress(null);
    setIsUploading(false);
    router.refresh();
  }

  async function handleDelete(imageId: string, imageUrl: string) {
    const { error } = await deletePortfolioImage(supabase, imageId, imageUrl);

    if (error) {
      toast.error("Erro ao remover imagem.");
    } else {
      setImages((prev) => prev.filter((img) => img.id !== imageId));
      toast.success("Imagem removida!");
    }
  }

  const hasPending = pending.some((p) => p.status === "pending" || p.status === "error");

  return (
    <div className="rounded-xl border border-border bg-white p-5 space-y-5">
      {/* Header with counter and upload */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">
            {images.length} de {totalSlots} fotos
          </p>
          <div className="mt-1.5 h-1.5 w-32 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full gradient-bg transition-all"
              style={{
                width: `${(images.length / totalSlots) * 100}%`,
              }}
            />
          </div>
        </div>
        {remainingSlots > 0 && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFilesSelected}
              disabled={isUploading}
            />
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg gap-2 border-primary/30 text-primary"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <Upload className="h-4 w-4" />
              Adicionar
            </Button>
          </>
        )}
      </div>

      {/* Pending uploads preview */}
      {pending.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground">
            Imagens para enviar
          </p>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {pending.map((item) => (
              <div
                key={item.id}
                className="relative aspect-square overflow-hidden rounded-lg border-2 border-dashed border-primary/30"
              >
                <Image
                  src={item.preview}
                  alt="Preview"
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 33vw, 25vw"
                />
                {item.status === "uploading" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <Loader2 className="h-6 w-6 animate-spin text-white" />
                  </div>
                )}
                {item.status === "error" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-red-500/40">
                    <span className="text-xs font-semibold text-white">Erro</span>
                  </div>
                )}
                {(item.status === "pending" || item.status === "error") && !isUploading && (
                  <button
                    onClick={() => removePending(item.id)}
                    className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
          {hasPending && (
            <Button
              onClick={uploadAll}
              disabled={isUploading}
              className="w-full h-10 rounded-lg font-semibold gap-2 gradient-bg"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {uploadProgress
                    ? `Enviando ${uploadProgress.current} de ${uploadProgress.total}...`
                    : "Enviando..."}
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Enviar {pending.filter((p) => p.status === "pending" || p.status === "error").length} imagem(ns)
                </>
              )}
            </Button>
          )}
        </div>
      )}

      {/* Uploaded images grid */}
      {images.length === 0 && pending.length === 0 ? (
        <div className="flex flex-col items-center py-12 text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-muted">
            <ImagePlus className="h-7 w-7 text-muted-foreground" />
          </div>
          <p className="font-medium text-foreground">Nenhuma imagem ainda</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Adicione fotos dos seus trabalhos
          </p>
        </div>
      ) : images.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((img) => (
            <div
              key={img.id}
              className="group relative aspect-square overflow-hidden rounded-lg"
            >
              <Image
                src={img.image_url}
                alt="Portfólio"
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
              <button
                onClick={() => handleDelete(img.id, img.image_url)}
                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
