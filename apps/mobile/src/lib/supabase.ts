import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
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
    // AsyncStorage mantém a sessão entre aberturas do app
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    // No app não existe callback de URL como no navegador
    detectSessionInUrl: false,
  },
});
