/**
 * Validates a Brazilian CNPJ number.
 * Accepts formatted (xx.xxx.xxx/xxxx-xx) or raw digits (xxxxxxxxxxxxxx).
 */
export function isValidCnpj(cnpj: string): boolean {
  const digits = cnpj.replace(/\D/g, "");

  if (digits.length !== 14) return false;

  // Reject known invalid patterns (all same digit)
  if (/^(\d)\1{13}$/.test(digits)) return false;

  // Validate first check digit
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const sum1 = weights1.reduce((acc, weight, i) => acc + parseInt(digits.charAt(i)) * weight, 0);
  let remainder = sum1 % 11;
  const check1 = remainder < 2 ? 0 : 11 - remainder;
  if (check1 !== parseInt(digits.charAt(12))) return false;

  // Validate second check digit
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const sum2 = weights2.reduce((acc, weight, i) => acc + parseInt(digits.charAt(i)) * weight, 0);
  remainder = sum2 % 11;
  const check2 = remainder < 2 ? 0 : 11 - remainder;
  if (check2 !== parseInt(digits.charAt(13))) return false;

  return true;
}

/**
 * Formats a CNPJ string as xx.xxx.xxx/xxxx-xx
 */
export function formatCnpj(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8)
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 12)
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12, 14)}`;
}
