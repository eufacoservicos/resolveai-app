import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";
import "react-native-url-polyfill/auto";

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    "Faltam EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_ANON_KEY. Copie de apps/mobile/.env.example para .env.local.",
  );
}

export const supabase = createClient(url, anonKey, {
  auth: {
    // No nativo, AsyncStorage guarda a sessão entre aberturas. Na web,
    // deixamos o padrão do supabase-js, que usa localStorage e sabe se
    // proteger quando não há window — o AsyncStorage web não sabe, e
    // quebra em qualquer render fora do navegador.
    ...(Platform.OS === "web" ? {} : { storage: AsyncStorage }),
    autoRefreshToken: true,
    persistSession: true,
    // Só o fluxo OAuth do navegador devolve a sessão pela URL
    detectSessionInUrl: Platform.OS === "web",
  },
});
