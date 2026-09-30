-- ============================================
-- MIGRATION v21 - Quem cria os avisos
-- ============================================
--
-- A v19 criou a tabela `notifications`, as preferências, a RLS e a central
-- de avisos no app — mas ninguém escreve na tabela. A policy de escrita é só
-- do service_role e não existe serviço que a use, então a central abre
-- sempre vazia e o sino nunca tem o que mostrar.
--
-- Estes gatilhos fecham o circuito no próprio banco, para os três eventos
-- que o app já modela e que acontecem por ação de outra pessoa:
--
--   quote_request  alguém abriu seu WhatsApp   -> avisa o prestador
--   new_review     você recebeu uma avaliação  -> avisa o prestador
--   review_reply   responderam sua avaliação   -> avisa o cliente
--
-- Cada um respeita a preferência correspondente: desligou no app, não gera.
-- `quiet_hours` fica de fora de propósito — ele silencia o push, não o
-- histórico; a pessoa ainda quer achar o aviso na central de manhã.
--
-- Entrega por push continua dependendo de um serviço que leia `push_tokens`.
-- Isto aqui faz a central e o contador de não lidos funcionarem.
--
-- Idempotente: pode rodar de novo sem duplicar nada.

-- ============================================
-- Helper: grava o aviso se a preferência permitir
-- ============================================

create or replace function public.push_notification(
  p_user_id uuid,
  p_type text,
  p_preference text,
  p_title text,
  p_body text,
  p_data jsonb default '{}'::jsonb
)
returns void as $$
declare
  v_allowed boolean;
begin
  -- Sem linha de preferência, o padrão da v19 é receber
  execute format(
    'select coalesce((select %I from public.notification_preferences where user_id = $1), true)',
    p_preference
  )
  into v_allowed
  using p_user_id;

  if not v_allowed then
    return;
  end if;

  insert into public.notifications (user_id, type, title, body, data)
  values (p_user_id, p_type, p_title, p_body, p_data);
end;
$$ language plpgsql security definer set search_path = public;

comment on function public.push_notification(uuid, text, text, text, text, jsonb) is
  'Grava um aviso respeitando a preferência do usuário. Usado pelos gatilhos abaixo.';

-- ============================================
-- Pedido de orçamento: alguém abriu o WhatsApp do prestador
-- ============================================

create or replace function public.notify_quote_request()
returns trigger as $$
declare
  v_owner uuid;
  v_who text;
begin
  select p.user_id into v_owner
    from public.provider_profiles p
   where p.id = new.provider_id;

  -- O prestador abrindo o próprio WhatsApp não vira aviso
  if v_owner is null or v_owner = new.clicker_id then
    return new;
  end if;

  select coalesce(u.full_name, 'Alguém') into v_who
    from public.users u
   where u.id = new.clicker_id;

  perform public.push_notification(
    v_owner,
    'quote_request',
    'quote_requests',
    'Novo pedido de orçamento',
    coalesce(v_who, 'Alguém') || ' abriu seu WhatsApp para pedir um orçamento.',
    jsonb_build_object('route', '/provider/' || new.provider_id)
  );

  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_whatsapp_click_notify on public.whatsapp_clicks;
create trigger on_whatsapp_click_notify
  after insert on public.whatsapp_clicks
  for each row execute function public.notify_quote_request();

-- ============================================
-- Nova avaliação: avisa o prestador avaliado
-- ============================================

create or replace function public.notify_new_review()
returns trigger as $$
declare
  v_owner uuid;
  v_who text;
begin
  select p.user_id into v_owner
    from public.provider_profiles p
   where p.id = new.provider_id;

  if v_owner is null or v_owner = new.client_id then
    return new;
  end if;

  select coalesce(u.full_name, 'Um cliente') into v_who
    from public.users u
   where u.id = new.client_id;

  perform public.push_notification(
    v_owner,
    'new_review',
    'new_reviews',
    new.rating || ' ' || case when new.rating = 1 then 'estrela' else 'estrelas' end
      || ' de ' || coalesce(v_who, 'um cliente'),
    coalesce(nullif(new.comment, ''), 'Toque para ver a avaliação no seu perfil.'),
    jsonb_build_object('route', '/reviews', 'review_id', new.id)
  );

  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_review_created_notify on public.reviews;
create trigger on_review_created_notify
  after insert on public.reviews
  for each row execute function public.notify_new_review();

-- ============================================
-- Resposta do profissional: avisa quem avaliou
-- ============================================

create or replace function public.notify_review_reply()
returns trigger as $$
declare
  v_client uuid;
  v_provider_id uuid;
  v_who text;
begin
  select r.client_id, r.provider_id into v_client, v_provider_id
    from public.reviews r
   where r.id = new.review_id;

  if v_client is null then
    return new;
  end if;

  select coalesce(u.full_name, 'O profissional') into v_who
    from public.provider_profiles p
    join public.users u on u.id = p.user_id
   where p.id = v_provider_id;

  perform public.push_notification(
    v_client,
    'review_reply',
    'review_replies',
    coalesce(v_who, 'O profissional') || ' respondeu sua avaliação',
    new.content,
    jsonb_build_object('route', '/provider/' || v_provider_id)
  );

  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_review_reply_notify on public.review_replies;
create trigger on_review_reply_notify
  after insert on public.review_replies
  for each row execute function public.notify_review_reply();
