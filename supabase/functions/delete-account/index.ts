// Edge Function: exclusao de conta.
//
// No PWA isso e uma server action (profile/delete/actions.ts) que usa a
// service_role key. Um app mobile nao pode carregar essa chave, entao a mesma
// logica vive aqui e o client chama via supabase.functions.invoke("delete-account").
//
// Deploy: supabase functions deploy delete-account
// A funcao usa SUPABASE_SERVICE_ROLE_KEY, injetada automaticamente no ambiente
// das Edge Functions — nao precisa configurar secret.

import { createClient } from "jsr:@supabase/supabase-js@2";

const BUCKETS = ["avatars", "portfolio", "verification-documents"];

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  // Identifica o chamador pelo JWT do proprio request: so da para excluir a
  // propria conta, nunca a de outro usuario.
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return json({ error: "Usuário não autenticado." }, 401);
  }

  const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: authHeader } },
  });

  const {
    data: { user },
  } = await userClient.auth.getUser();

  if (!user) {
    return json({ error: "Usuário não autenticado." }, 401);
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  try {
    // 1. Remove arquivos do storage (avatars, portfolio, documentos)
    for (const bucket of BUCKETS) {
      const { data: files } = await adminClient.storage.from(bucket).list(user.id);
      if (files && files.length > 0) {
        await adminClient.storage
          .from(bucket)
          .remove(files.map((f: { name: string }) => `${user.id}/${f.name}`));
      }
    }

    // 2. Remove o usuario do auth — cascateia para os dados relacionados
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id);

    if (deleteError) {
      return json({ error: "Erro ao excluir conta. Tente novamente." }, 500);
    }

    return json({ success: true }, 200);
  } catch {
    return json({ error: "Erro inesperado. Tente novamente mais tarde." }, 500);
  }
});
