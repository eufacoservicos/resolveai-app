import { useState } from "react";
import { View, Pressable } from "react-native";
import { toast } from "sonner-native";
import { Camera } from "lucide-react-native";
import { Avatar } from "@/components/ui/avatar";
import { Muted } from "@/components/ui/text";
import { pickAndProcessImage, uploadToSupabase } from "@/lib/image-upload";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-provider";

type Props = {
  currentUrl: string | null;
  fallbackName: string;
  onUploaded?: (url: string) => void;
};

export function AvatarPicker({ currentUrl, fallbackName, onUploaded }: Props) {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentUrl);

  async function handlePress() {
    if (!user) return;
    try {
      setUploading(true);
      const image = await pickAndProcessImage({
        aspect: [1, 1],
        quality: 0.85,
        maxWidth: 512,
      });
      if (!image) return;

      const path = `${user.id}/avatar-${Date.now()}.jpg`;
      const url = await uploadToSupabase("avatars", path, image);

      await supabase
        .from("users")
        .update({ avatar_url: url })
        .eq("id", user.id);

      setPreview(url);
      onUploaded?.(url);
      toast.success("Avatar atualizado!");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao atualizar avatar";
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  }

  return (
    <View className="items-center gap-2">
      <Pressable onPress={handlePress} disabled={uploading}>
        <View className="relative">
          <Avatar src={preview} fallback={fallbackName} size={96} />
          <View className="absolute -bottom-1 -right-1 h-8 w-8 items-center justify-center rounded-full bg-primary border-2 border-background">
            <Camera size={16} color="#ffffff" />
          </View>
        </View>
      </Pressable>
      <Muted className="text-xs">
        {uploading ? "Enviando..." : "Toque para trocar foto"}
      </Muted>
    </View>
  );
}
