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
