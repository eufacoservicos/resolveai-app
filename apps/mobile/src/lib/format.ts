/** Iniciais para o avatar: primeira e última palavra do nome. */
export function initialsOf(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

/** Nota com vírgula decimal, como se escreve em português. */
export function formatRating(rating: number | null): string | null {
  if (rating === null) return null;
  return rating.toFixed(1).replace(".", ",");
}

/** Distância legível: metros abaixo de 1 km, senão uma casa decimal. */
export function formatDistance(km: number | null | undefined): string | null {
  if (km === null || km === undefined) return null;
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1).replace(".", ",")} km`;
}

/** Data curta do protótipo: "30/09". */
export function formatShortDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}`;
}

/**
 * Distância no tempo, como o Pen escreve nas avaliações:
 * "há 2 semanas", "há 1 mês", "há 3 anos".
 */
export function formatRelativeDate(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";

  const days = Math.floor((Date.now() - then) / 86_400_000);
  if (days <= 0) return "hoje";
  if (days === 1) return "ontem";
  if (days < 7) return `há ${days} dias`;

  const weeks = Math.floor(days / 7);
  if (weeks < 5) return weeks === 1 ? "há 1 semana" : `há ${weeks} semanas`;

  const months = Math.floor(days / 30);
  if (months < 12) return months === 1 ? "há 1 mês" : `há ${months} meses`;

  const years = Math.floor(days / 365);
  return years === 1 ? "há 1 ano" : `há ${years} anos`;
}

/** Tempo de casa para o bloco de estatísticas: "3 anos", "8 meses". */
export function formatTenure(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "—";

  const days = Math.floor((Date.now() - then) / 86_400_000);
  const years = Math.floor(days / 365);
  if (years >= 1) return years === 1 ? "1 ano" : `${years} anos`;

  const months = Math.floor(days / 30);
  if (months >= 1) return months === 1 ? "1 mês" : `${months} meses`;
  return "novo";
}
