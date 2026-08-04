import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { supabase } from "./supabase";

export type PickImageOptions = {
  /** true = square crop for avatars */
  aspect?: [number, number];
  /** 0..1 — jpeg compression */
  quality?: number;
  /** max width for output */
  maxWidth?: number;
};

export type PickedImage = {
  uri: string;
  width: number;
  height: number;
  mimeType: string;
};

/**
 * Prompts the user to pick a photo from the library, then downsizes
 * and compresses it. Returns null if the user cancels.
 */
export async function pickAndProcessImage(
  opts: PickImageOptions = {}
): Promise<PickedImage | null> {
  const { aspect, quality = 0.85, maxWidth = 1200 } = opts;

  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new Error(
      "Precisamos de permissão para acessar suas fotos. Habilite nas configurações."
    );
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect,
    quality: 1,
  });

  if (result.canceled || result.assets.length === 0) return null;

  const asset = result.assets[0]!;
  const needsResize = asset.width > maxWidth;
  const manipulated = await ImageManipulator.manipulateAsync(
    asset.uri,
    needsResize ? [{ resize: { width: maxWidth } }] : [],
    { compress: quality, format: ImageManipulator.SaveFormat.JPEG }
  );

  return {
    uri: manipulated.uri,
    width: manipulated.width,
    height: manipulated.height,
    mimeType: "image/jpeg",
  };
}

/**
 * Uploads a local file URI to Supabase Storage and returns its public URL.
 * The bucket must exist and have an RLS policy that allows the current user
 * to insert into the target path.
 */
export async function uploadToSupabase(
  bucket: string,
  path: string,
  image: PickedImage
): Promise<string> {
  const response = await fetch(image.uri);
  const arrayBuffer = await response.arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, arrayBuffer, {
      contentType: image.mimeType,
      upsert: true,
    });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
