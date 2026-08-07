/**
 * Formatacao de WhatsApp brasileiro (DDD + numero), usada nos formularios de
 * prestador do web e do mobile.
 */
export function formatWhatsApp(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

export function unformatWhatsApp(value: string): string {
  return value.replace(/\D/g, "");
}

/** Valido quando tem DDD + 8 ou 9 digitos */
export function isValidWhatsApp(value: string): boolean {
  const digits = unformatWhatsApp(value);
  return digits.length === 10 || digits.length === 11;
}
