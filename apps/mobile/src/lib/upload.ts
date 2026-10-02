import type { UploadFile } from "@eufaco/shared";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";

/** Falha esperada do fluxo, com mensagem pronta para mostrar. */
export interface PickError {
  message: string;
}

const MAX_BYTES = 5 * 1024 * 1024;

/**
 * Abre a galeria e devolve a imagem no formato portátil de upload.
 *
 * O React Native não tem File nem Blob, então o arquivo é lido em base64 e
 * convertido para bytes — que é o que o storage do Supabase aceita nas duas
 * plataformas.
 *
 * Devolve `null` quando a pessoa cancela, sem tratar isso como erro.
 */
export async function pickImage(
  aspect?: [number, number],
): Promise<{ file: UploadFile; uri: string } | null | PickError> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    return {
      message: "Precisamos de acesso às suas fotos. Libere nos ajustes do aparelho e tente de novo.",
    };
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect,
    quality: 0.8,
  });

  if (result.canceled) return null;

  const asset = result.assets[0];
  if (!asset) return null;

  if (asset.fileSize && asset.fileSize > MAX_BYTES) {
    return { message: "A imagem passa de 5 MB. Escolha outra ou reduza o tamanho." };
  }

  try {
    const base64 = await FileSystem.readAsStringAsync(asset.uri, {
      encoding: "base64",
    });

    const extension = asset.uri.split(".").pop()?.toLowerCase() || "jpg";

    return {
      uri: asset.uri,
      file: {
        body: base64ToBytes(base64),
        extension,
        contentType: asset.mimeType ?? `image/${extension === "jpg" ? "jpeg" : extension}`,
      },
    };
  } catch {
    return { message: "Não foi possível ler a imagem. Tente escolher outra." };
  }
}

export function isPickError(value: unknown): value is PickError {
  return typeof value === "object" && value !== null && "message" in value;
}

/**
 * Converte base64 em bytes sem depender de `atob`, que o Hermes não expõe.
 */
function base64ToBytes(base64: string): Uint8Array {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  const clean = base64.replace(/[^A-Za-z0-9+/]/g, "");
  const byteLength = Math.floor((clean.length * 3) / 4);
  const bytes = new Uint8Array(byteLength);

  let buffer = 0;
  let bits = 0;
  let index = 0;

  for (const char of clean) {
    const value = alphabet.indexOf(char);
    if (value === -1) continue;

    buffer = (buffer << 6) | value;
    bits += 6;

    if (bits >= 8) {
      bits -= 8;
      bytes[index++] = (buffer >> bits) & 0xff;
    }
  }

  return bytes;
}
