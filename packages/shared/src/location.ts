export const DEFAULT_RADIUS_KM = 50;

export type LocationGeo = {
  type: "geo";
  lat: number;
  lng: number;
  label: string;
};

export type LocationCity = { type: "city"; city: string };

export type LocationData = LocationGeo | LocationCity;

/**
 * Valida um objeto desserializado vindo de storage (cookie no web,
 * AsyncStorage no mobile). Retorna null se nao for uma localizacao valida.
 */
export function validateLocationData(parsed: unknown): LocationData | null {
  if (!parsed || typeof parsed !== "object") return null;
  const obj = parsed as Record<string, unknown>;
  if (
    obj.type === "geo" &&
    typeof obj.lat === "number" &&
    typeof obj.lng === "number"
  ) {
    return obj as unknown as LocationGeo;
  }
  if (obj.type === "city" && typeof obj.city === "string") {
    return obj as unknown as LocationCity;
  }
  return null;
}

/** Rotulo exibido para o usuario (chip de localizacao). */
export function getLocationLabel(location: LocationData | null): string | undefined {
  if (!location) return undefined;
  return location.type === "geo" ? location.label : location.city;
}

/** Converte a localizacao salva nos filtros aceitos por getActiveProviders. */
export function toProviderFilters(location: LocationData | null): {
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  city?: string;
} {
  if (!location) return {};
  if (location.type === "geo") {
    return {
      latitude: location.lat,
      longitude: location.lng,
      radiusKm: DEFAULT_RADIUS_KM,
    };
  }
  return { city: location.city };
}
