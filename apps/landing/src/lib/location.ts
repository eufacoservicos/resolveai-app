import { cookies } from "next/headers";
import {
  LOCATION_COOKIE_NAME,
  parseLocationCookie,
  type LocationData,
} from "@eufaco/shared";

/** Read the user's saved location from the cookie (server-side only) */
export async function getLocationFromCookie(): Promise<LocationData | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(LOCATION_COOKIE_NAME)?.value;
  return parseLocationCookie(raw);
}
