-- ============================================
-- MIGRATION v22 - Entrega do push
-- ============================================
--
-- A v21 fez os avisos existirem; esta faz eles chegarem no aparelho.
-- Quando uma linha entra em `notifications`, um gatilho chama a Edge
-- Function `send-push`, que lê `push_tokens` e fala com a API do Expo.
--
-- A chamada é assíncrona, por `pg_net`: entrega de push não pode segurar —
-- nem derrubar — a transação que criou o aviso. Se o push falhar, o aviso
-- continua na central, que é o que a pessoa realmente precisa achar depois.
--
-- ONDE FICAM A URL E A CHAVE
--
-- No Supabase hospedado o papel `postgres` não é superusuário, então
-- `alter database ... set app.settings.*` é recusado com 42501. O lugar
-- suportado para segredo que o SQL precisa ler é o Vault, que guarda
-- criptografado e só expõe pela view `vault.decrypted_secrets`.
--
-- DEPOIS DE APLICAR, rode uma vez (veja o README):
--
--   select public.set_push_config(
--     'https://SEU-REF.supabase.co/functions/v1',
--     'SUA_SERVICE_ROLE_KEY'
--   );
--
-- Enquanto isso não for feito o gatilho não faz nada — de propósito: é
-- melhor a central funcionar sem push do que o insert falhar.
--
-- Idempotente: pode rodar de novo sem duplicar nada.

create extension if not exists pg_net with schema extensions;
create extension if not exists supabase_vault with schema vault;

-- ============================================
-- Marca o que já foi entregue
-- ============================================
--
-- Serve para diagnóstico ("o aviso saiu do banco?") e para uma eventual
-- rotina de reenvio saber o que ficou para trás.

alter table public.notifications
  add column if not exists push_sent_at timestamptz;

comment on column public.notifications.push_sent_at is
  'Quando a Edge Function send-push entregou este aviso. Null = só na central.';

-- ============================================
-- Guarda a configuração do push no Vault
-- ============================================
--
-- Existe para você não precisar lidar com a API do Vault nem com os UUIDs
-- dos segredos: uma chamada só, que cria na primeira vez e atualiza depois.
-- Útil também ao rotacionar a service_role_key.

create or replace function public.set_push_config(
  p_base_url text,
  p_service_role_key text
)
returns void as $$
declare
  v_id uuid;
begin
  select id into v_id from vault.secrets where name = 'push_edge_base_url';
  if v_id is null then
    perform vault.create_secret(
      p_base_url, 'push_edge_base_url', 'Base das Edge Functions, para o gatilho de push'
    );
  else
    perform vault.update_secret(
      v_id, p_base_url, 'push_edge_base_url', 'Base das Edge Functions, para o gatilho de push'
    );
  end if;

  select id into v_id from vault.secrets where name = 'push_service_role_key';
  if v_id is null then
    perform vault.create_secret(
      p_service_role_key, 'push_service_role_key', 'Chave que autentica o gatilho na Edge Function'
    );
  else
    perform vault.update_secret(
      v_id, p_service_role_key, 'push_service_role_key', 'Chave que autentica o gatilho na Edge Function'
    );
  end if;
end;
$$ language plpgsql security definer set search_path = public, vault;

-- Só quem administra o banco pode mexer nisto. Sem este revoke, qualquer
-- pessoa logada no app poderia apontar o push para um servidor próprio —
-- a função é SECURITY DEFINER e o EXECUTE nasce liberado para PUBLIC.
revoke all on function public.set_push_config(text, text) from public, anon, authenticated;

comment on function public.set_push_config(text, text) is
  'Grava no Vault a URL das Edge Functions e a chave usadas pelo gatilho de push. Rodar uma vez, e de novo a cada rotação da chave.';

-- ============================================
-- Gatilho: chama a Edge Function a cada aviso novo
-- ============================================

create or replace function public.dispatch_push()
returns trigger as $$
declare
  v_base_url text;
  v_key text;
begin
  select decrypted_secret into v_base_url
    from vault.decrypted_secrets where name = 'push_edge_base_url';

  select decrypted_secret into v_key
    from vault.decrypted_secrets where name = 'push_service_role_key';

  -- Projeto ainda sem push configurado: o aviso já está gravado e a central
  -- o mostra. Não é erro, não pode abortar o insert.
  if coalesce(v_base_url, '') = '' or coalesce(v_key, '') = '' then
    return null;
  end if;

  perform net.http_post(
    url := v_base_url || '/send-push',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || v_key
    ),
    body := jsonb_build_object('notification_id', new.id),
    timeout_milliseconds := 5000
  );

  return null;
end;
$$ language plpgsql security definer set search_path = public, vault, extensions;

comment on function public.dispatch_push() is
  'Enfileira a entrega de push do aviso recém-criado. Assíncrono: nunca derruba o insert.';

drop trigger if exists on_notification_created_push on public.notifications;
create trigger on_notification_created_push
  after insert on public.notifications
  for each row execute function public.dispatch_push();
