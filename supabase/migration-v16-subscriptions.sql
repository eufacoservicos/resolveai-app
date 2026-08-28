-- ============================================
-- MIGRATION v16 - Planos, assinatura e cota de orçamentos
-- ============================================
--
-- Modelo: todo prestador é "free" por padrão, sem linha nesta tabela.
-- Assinar cria a linha com plan = 'pro'. Cancelar mantém a linha com
-- status = 'canceled' e current_period_end no futuro, porque o benefício
-- vale até o fim do período já pago.
--
-- A cota de 10 orçamentos do plano grátis não é um contador guardado:
-- é derivada de whatsapp_clicks, tabela que já registra cada contato desde
-- o começo. Contador guardado desincroniza; contagem derivada, não.

create table public.provider_subscriptions (
  id uuid primary key default uuid_generate_v4(),
  provider_id uuid not null unique references public.provider_profiles(id) on delete cascade,
  plan text not null default 'pro' check (plan in ('free', 'pro')),
  status text not null default 'active' check (status in ('active', 'canceled', 'past_due')),
  current_period_start timestamptz not null default now(),
  current_period_end timestamptz not null,
  -- Identificador da assinatura no gateway de pagamento
  external_id text,
  external_provider text check (external_provider in ('play_billing', 'stripe', 'mercadopago')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_provider_subscriptions_provider_id on public.provider_subscriptions(provider_id);
create index idx_provider_subscriptions_status on public.provider_subscriptions(status);

alter table public.provider_subscriptions enable row level security;

-- O prestador vê a própria assinatura. Ninguém mais precisa ver isso.
create policy "Providers can read own subscription"
  on public.provider_subscriptions for select
  to authenticated
  using (
    exists (
      select 1 from public.provider_profiles p
      where p.id = provider_id and p.user_id = auth.uid()
    )
  );

-- Escrita só pelo backend: o app nunca cria a própria assinatura, senão
-- bastaria um insert para virar pro sem pagar.
create policy "Service role manages subscriptions"
  on public.provider_subscriptions for all
  to service_role
  using (true)
  with check (true);

-- ============================================
-- FUNÇÃO: plano ativo de um prestador
-- ============================================

create or replace function public.provider_plan(p_provider_id uuid)
returns text as $$
  select coalesce(
    (
      select s.plan
        from public.provider_subscriptions s
       where s.provider_id = p_provider_id
         and s.status in ('active', 'canceled')
         and s.current_period_end > now()
       limit 1
    ),
    'free'
  );
$$ language sql stable security definer set search_path = public;

comment on function public.provider_plan(uuid) is
  'Plano em vigor. Assinatura cancelada continua valendo até current_period_end.';

-- ============================================
-- FUNÇÃO: uso da cota de orçamentos no mês corrente
-- ============================================

create or replace function public.provider_quote_usage(p_provider_id uuid)
returns table (
  plan text,
  used integer,
  quota integer,
  period_start timestamptz,
  exhausted boolean
) as $$
declare
  v_plan text := public.provider_plan(p_provider_id);
  v_start timestamptz := date_trunc('month', now());
  v_used integer;
  v_quota integer;
begin
  select count(*)::integer into v_used
    from public.whatsapp_clicks c
   where c.provider_id = p_provider_id
     and c.created_at >= v_start;

  -- null = ilimitado no plano pago
  v_quota := case when v_plan = 'pro' then null else 10 end;

  return query select
    v_plan,
    v_used,
    v_quota,
    v_start,
    (v_quota is not null and v_used >= v_quota);
end;
$$ language plpgsql stable security definer set search_path = public;

comment on function public.provider_quote_usage(uuid) is
  'Orçamentos recebidos no mês. Derivado de whatsapp_clicks, sem contador paralelo.';

grant execute on function public.provider_plan(uuid) to authenticated, anon;
grant execute on function public.provider_quote_usage(uuid) to authenticated;

-- ============================================
-- Mantém updated_at coerente
-- ============================================

create or replace function public.touch_updated_at()
returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

create or replace trigger on_provider_subscriptions_updated
  before update on public.provider_subscriptions
  for each row execute function public.touch_updated_at();
