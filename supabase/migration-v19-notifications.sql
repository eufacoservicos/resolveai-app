-- ============================================
-- MIGRATION v19 - Notificações e preferências
-- ============================================
--
-- Três peças: o registro do aparelho (push_tokens), o que foi notificado
-- (notifications, que também alimenta a central de avisos dentro do app)
-- e o que a pessoa aceita receber (notification_preferences).
--
-- As duas categorias de marketing nascem desligadas. Push promocional sem
-- opt-in é o caminho mais curto para a desinstalação.

create table public.push_tokens (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  token text not null unique,
  platform text not null check (platform in ('android', 'ios')),
  created_at timestamptz not null default now(),
  last_used_at timestamptz not null default now()
);

create index idx_push_tokens_user_id on public.push_tokens(user_id);

alter table public.push_tokens enable row level security;

create policy "Users can manage own push tokens"
  on public.push_tokens for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Service role reads push tokens"
  on public.push_tokens for select
  to service_role
  using (true);

-- ============================================
-- Avisos
-- ============================================

create table public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  type text not null check (type in (
    'quote_request',    -- alguém abriu seu WhatsApp
    'new_review',       -- você recebeu uma avaliação
    'review_reply',     -- o profissional respondeu você
    'review_reminder',  -- lembrete para avaliar quem te atendeu
    'quota_warning',    -- restam poucos orçamentos no plano grátis
    'offer_expiring',   -- sua oferta está acabando
    'system'
  )),
  title text not null,
  body text not null,
  -- Para onde o toque leva: { "route": "/provider/123" }
  data jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_notifications_user_unread on public.notifications(user_id, created_at desc)
  where read_at is null;
create index idx_notifications_user_id on public.notifications(user_id, created_at desc);

alter table public.notifications enable row level security;

create policy "Users can read own notifications"
  on public.notifications for select
  to authenticated
  using (auth.uid() = user_id);

-- A pessoa só pode marcar como lida; criar aviso é do backend
create policy "Users can mark own notifications read"
  on public.notifications for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Service role creates notifications"
  on public.notifications for all
  to service_role
  using (true)
  with check (true);

-- ============================================
-- Preferências
-- ============================================

create table public.notification_preferences (
  user_id uuid primary key references public.users(id) on delete cascade,
  -- Chave mestra: desligada aqui, nada é enviado
  push_enabled boolean not null default true,

  quote_requests boolean not null default true,
  new_reviews boolean not null default true,
  quota_warnings boolean not null default true,
  offers_expiring boolean not null default true,
  review_reminders boolean not null default true,
  review_replies boolean not null default true,

  -- Marketing entra desligado, por opt-in
  product_news boolean not null default false,
  promotions boolean not null default false,

  -- Não perturbe, em horário local do usuário
  quiet_hours_enabled boolean not null default false,
  quiet_hours_start time not null default '22:00',
  quiet_hours_end time not null default '08:00',

  updated_at timestamptz not null default now()
);

alter table public.notification_preferences enable row level security;

create policy "Users can manage own notification preferences"
  on public.notification_preferences for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Service role reads notification preferences"
  on public.notification_preferences for select
  to service_role
  using (true);

create or replace trigger on_notification_preferences_updated
  before update on public.notification_preferences
  for each row execute function public.touch_updated_at();

-- Cria a linha de preferências junto com o usuário, para o app nunca
-- precisar tratar o caso "ainda não existe"
create or replace function public.handle_new_user_notification_prefs()
returns trigger as $$
begin
  insert into public.notification_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create or replace trigger on_user_created_notification_prefs
  after insert on public.users
  for each row execute function public.handle_new_user_notification_prefs();

-- Preenche quem já existe
insert into public.notification_preferences (user_id)
select id from public.users
on conflict (user_id) do nothing;
