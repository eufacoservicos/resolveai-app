import { signInWithApple, signInWithGoogle } from "@eufaco/shared";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { supabase } from "./supabase";

/**
 * Login com Google no app.
 *
 * O Supabase devolve os tokens no fragmento da URL de retorno, então
 * abrimos o navegador nós mesmos, esperamos o deep link e aplicamos a
 * sessão à mão — diferente da web, onde o redirect resolve sozinho.
 *
 * Devolve mensagem de erro pronta, ou null quando entrou.
 */
export async function signInWithGoogleNative(): Promise<string | null> {
  const redirectTo = Linking.createURL("/callback");

  const { data, error } = await signInWithGoogle(supabase, redirectTo, {
    skipBrowserRedirect: true,
  });

  if (error || !data?.url) return "Não foi possível abrir o login do Google. Tente de novo.";

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

  // Cancelar não é erro: a pessoa mudou de ideia
  if (result.type !== "success") return null;

  const fragment = result.url.split("#")[1] ?? "";
  const params = new URLSearchParams(fragment);
  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");

  if (!accessToken || !refreshToken) return "O Google não devolveu a sessão. Tente de novo.";

  const { error: sessionError } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  return sessionError ? "Não foi possível concluir o login. Tente de novo." : null;
}

/**
 * Login com Apple, pelo mesmo caminho do Google: abrimos o navegador,
 * esperamos o deep link e aplicamos a sessão à mão.
 */
export async function signInWithAppleNative(): Promise<string | null> {
  const redirectTo = Linking.createURL("/callback");

  const { data, error } = await signInWithApple(supabase, redirectTo, {
    skipBrowserRedirect: true,
  });

  if (error || !data?.url) return "Não foi possível abrir o login da Apple. Tente de novo.";

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== "success") return null;

  const fragment = result.url.split("#")[1] ?? "";
  const params = new URLSearchParams(fragment);
  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");

  if (!accessToken || !refreshToken) return "A Apple não devolveu a sessão. Tente de novo.";

  const { error: sessionError } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  return sessionError ? "Não foi possível concluir o login. Tente de novo." : null;
}
