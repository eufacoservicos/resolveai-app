import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import type { Provider } from "@supabase/supabase-js";
import { supabase } from "./supabase";

WebBrowser.maybeCompleteAuthSession();

/**
 * Starts an OAuth flow using an in-app browser and returns the resulting
 * Supabase session. On success the session is already persisted by the
 * Supabase client (AsyncStorage adapter) and will fire onAuthStateChange.
 *
 * Requires the OAuth provider to have `eufaco://` (and eventually
 * https://www.eufacooservico.com.br) whitelisted in the Supabase Dashboard
 * under Authentication > URL Configuration.
 */
export async function signInWithOAuth(provider: Provider) {
  const redirectTo = Linking.createURL("/callback");

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });

  if (error) throw error;
  if (!data.url) throw new Error("Supabase did not return an OAuth URL");

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

  if (result.type !== "success" || !result.url) {
    throw new Error("OAuth flow cancelled");
  }

  const { params, errorCode } = extractParams(result.url);
  if (errorCode) throw new Error(errorCode);

  const accessToken = params.access_token;
  const refreshToken = params.refresh_token;

  if (!accessToken || !refreshToken) {
    throw new Error("OAuth callback did not include tokens");
  }

  const { data: session, error: setError } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (setError) throw setError;
  return session;
}

function extractParams(url: string) {
  const parsed = Linking.parse(url);
  const params = {
    ...(parsed.queryParams as Record<string, string | undefined>),
  };

  // Supabase returns tokens in the URL fragment (#access_token=...)
  const hashIndex = url.indexOf("#");
  if (hashIndex >= 0) {
    const hash = url.slice(hashIndex + 1);
    for (const pair of hash.split("&")) {
      const [key, value] = pair.split("=");
      if (key) params[key] = value ? decodeURIComponent(value) : undefined;
    }
  }

  return {
    params,
    errorCode: params.error_code ?? params.error,
  };
}
