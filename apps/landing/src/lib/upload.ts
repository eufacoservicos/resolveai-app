import type { UploadFile } from "@eufaco/shared";

/**
 * Converte um File do navegador para o formato portátil de upload.
 *
 * O pacote compartilhado não pode depender de File nem de Blob: essas APIs
 * não existem no React Native. A conversão para binário cru fica aqui.
 */
export async function toUploadFile(file: File): Promise<UploadFile> {
  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  return {
    body: await file.arrayBuffer(),
    extension,
    contentType: file.type || "application/octet-stream",
  };
}
