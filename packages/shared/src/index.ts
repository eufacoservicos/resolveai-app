/**
 * Código compartilhado entre a landing (Next.js) e o app (React Native).
 *
 * Só entra aqui o que roda nas duas plataformas. Nada de `next/*`,
 * `@supabase/ssr`, DOM ou APIs nativas — essas camadas ficam em cada app,
 * que injeta o cliente Supabase já construído nas funções daqui.
 */

// Tipos do banco
export * from "./types";

// Regras de domínio
export * from "./domain/cpf";
export * from "./domain/cnpj";
export * from "./domain/cep";
export * from "./domain/constants";
export * from "./domain/profanity";
export * from "./domain/business-hours";
export * from "./domain/location";

// Acesso a dados — recebem o SupabaseClient como primeiro argumento
export * from "./supabase/queries";
export * from "./supabase/mutations";
