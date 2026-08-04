export interface CepData {
  cep: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Fetches address information from a Brazilian CEP (postal code).
 * Uses the ViaCEP public API.
 */
export async function fetchCepData(cep: string): Promise<CepData | null> {
  const cleanCep = cep.replace(/\D/g, "");
  if (cleanCep.length !== 8) return null;

  try {
    const response = await fetch(
      `https://viacep.com.br/ws/${cleanCep}/json/`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (!response.ok) return null;

    const data = await response.json();
    if (data.erro) return null;

    return {
      cep: data.cep,
      street: data.logradouro || "",
      neighborhood: data.bairro || "",
      city: data.localidade || "",
      state: data.uf || "",
    };
  } catch {
    return null;
  }
}

/**
 * Geocodes an address string into lat/lng coordinates.
 * Uses Nominatim (OpenStreetMap) free geocoding API.
 */
export async function geocodeAddress(
  city: string,
  state: string,
  neighborhood?: string
): Promise<Coordinates | null> {
  const parts = [neighborhood, city, state, "Brazil"].filter(Boolean);
  const query = parts.join(", ");

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?` +
        new URLSearchParams({
          q: query,
          format: "json",
          limit: "1",
          countrycodes: "br",
        }),
      {
        headers: { "User-Agent": "eufaco/1.0" },
        signal: AbortSignal.timeout(5000),
      }
    );

    if (!response.ok) return null;

    const results = await response.json();
    if (!results || results.length === 0) return null;

    return {
      latitude: parseFloat(results[0].lat),
      longitude: parseFloat(results[0].lon),
    };
  } catch {
    return null;
  }
}

/** Formats a CEP string as XXXXX-XXX */
export function formatCep(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5, 8)}`;
}

/** Validates if a string is a valid CEP format (8 digits) */
export function isValidCep(cep: string): boolean {
  return cep.replace(/\D/g, "").length === 8;
}
