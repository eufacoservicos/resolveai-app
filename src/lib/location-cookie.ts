export const LOCATION_COOKIE_NAME = "user-location";
export const LOCATION_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year
export const DEFAULT_RADIUS_KM = 50;

export type LocationGeo = {
  type: "geo";
  lat: number;
  lng: number;
  label: string;
};
export type LocationCity = { type: "city"; city: string };
export type LocationData = LocationGeo | LocationCity;

/** Encode a UTF-8 string to base64 (works in browser and Node 18+) */
function utf8ToBase64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  const binary = Array.from(bytes, (b) => String.fromCharCode(b)).join("");
  return btoa(binary);
}

/** Decode a base64 string back to UTF-8 */
function base64ToUtf8(base64: string): string {
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function validateLocationData(parsed: unknown): LocationData | null {
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

/** Parse the cookie value into LocationData or null */
export function parseLocationCookie(
  value: string | undefined
): LocationData | null {
  if (!value) return null;

  // Try base64 format (current)
  try {
    const json = base64ToUtf8(value);
    const parsed = JSON.parse(json);
    const result = validateLocationData(parsed);
    if (result) return result;
  } catch {
    // Not base64, try legacy format
  }

  // Fallback: legacy encodeURIComponent format
  try {
    const parsed = JSON.parse(decodeURIComponent(value));
    return validateLocationData(parsed);
  } catch {
    return null;
  }
}

/** Serialize LocationData for cookie storage (base64 for UTF-8 safety) */
export function serializeLocationCookie(data: LocationData): string {
  return utf8ToBase64(JSON.stringify(data));
}
