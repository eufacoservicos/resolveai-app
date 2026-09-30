import { signInWithApple, signInWithGoogle } from "@eufaco/shared";
import { supabase } from "./supabase";

/**
 * Na web o próprio Supabase redireciona o navegador e trata o retorno,
 * então não há sessão para aplicar à mão.
 */
export async function signInWithGoogleNative(): Promise<string | null> {
  const { error } = await signInWithGoogle(supabase, `${window.location.origin}/callback`);
  return error ? "Não foi possível abrir o login do Google. Tente de novo." : null;
}

export async function signInWithAppleNative(): Promise<string | null> {
  const { error } = await signInWithApple(supabase, `${window.location.origin}/callback`);
  return error ? "Não foi possível abrir o login da Apple. Tente de novo." : null;
}
