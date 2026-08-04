"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { updateUser, uploadAvatar } from "@/lib/supabase/mutations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Save, ArrowLeft, Loader2, Camera } from "lucide-react";
import { AvatarCropModal } from "@/components/ui/avatar-crop-modal";

interface UserProfileFormProps {
  user: {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string | null;
  };
}

export function UserProfileForm({ user }: UserProfileFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState(user.full_name);
  const [avatarUrl, setAvatarUrl] = useState(user.avatar_url);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);

  const initials = user.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  function handleAvatarSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setCropImageSrc(reader.result as string);
      setCropModalOpen(true);
    };
    reader.readAsDataURL(file);

    // Reset input so the same file can be selected again
    e.target.value = "";
  }

  function handleCropConfirm(blob: Blob) {
    const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(blob));
    setCropModalOpen(false);
    setCropImageSrc(null);
  }

  function handleCropCancel() {
    setCropModalOpen(false);
    setCropImageSrc(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!fullName.trim()) {
      toast.error("O nome é obrigatório.");
      return;
    }

    setLoading(true);

    // Upload avatar if changed
    if (avatarFile) {
      setAvatarUploading(true);
      const { error: avatarError, url } = await uploadAvatar(
        supabase,
        user.id,
        avatarFile
      );
      setAvatarUploading(false);
      if (avatarError) {
        toast.error("Erro ao enviar foto.");
        setLoading(false);
        return;
      }
      if (url) {
        setAvatarUrl(url);
        toast.success("Foto atualizada!");
      }
    }

    const { error } = await updateUser(supabase, user.id, {
      full_name: fullName.trim(),
    });

    if (error) {
      toast.error("Erro ao salvar dados.");
    } else {
      toast.success("Dados atualizados!");
      router.push("/profile");
      router.refresh();
    }

    setLoading(false);
  }

  const displayAvatar = avatarPreview || avatarUrl;

  return (
    <div className="rounded-xl border border-border bg-white p-5">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="group relative h-24 w-24 rounded-full overflow-hidden border-2 border-border hover:border-primary transition-colors"
          >
            {displayAvatar ? (
              <Image
                src={displayAvatar}
                alt="Avatar"
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary font-bold text-2xl">
                {initials}
              </div>
            )}
            {avatarUploading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <Loader2 className="h-6 w-6 animate-spin text-white" />
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="h-6 w-6 text-white" />
              </div>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarSelect}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-sm font-medium text-primary"
          >
            Alterar foto
          </button>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="fullName" className="text-sm font-medium">
            Nome completo
          </Label>
          <Input
            id="fullName"
            type="text"
            placeholder="Seu nome completo"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="h-11 rounded-lg border-border"
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Email</Label>
          <Input
            type="email"
            value={user.email}
            disabled
            className="h-11 rounded-lg border-border bg-muted"
          />
          <p className="text-xs text-muted-foreground">
            O email não pode ser alterado.
          </p>
        </div>

        <div className="flex gap-3 pt-1">
          <Button
            type="submit"
            disabled={loading}
            className="flex-1 h-11 rounded-lg font-semibold gap-2 gradient-bg"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Save className="h-4 w-4" />
                Salvar alterações
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-11 rounded-lg gap-2 border-border"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </div>
      </form>

      {cropImageSrc && (
        <AvatarCropModal
          open={cropModalOpen}
          imageSrc={cropImageSrc}
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
        />
      )}
    </div>
  );
}
