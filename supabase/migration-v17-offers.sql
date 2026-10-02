-- ============================================
-- MIGRATION v17 - Ofertas e descontos
-- ============================================
--
-- Recurso exclusivo do plano pago. A regra não fica só na interface:
-- a policy de insert consulta provider_plan(), então um prestador grátis
-- não consegue criar oferta nem chamando a API direto.
--
-- Um prestador pode ter várias ofertas no histórico, mas só uma ativa
-- por vez — garantido pelo índice único parcial mais abaixo.

create table public.provider_offers (
  id uuid primary key default uuid_generate_v4(),
  provider_id uuid not null references public.provider_profiles(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 3 and 60),
  discount_type text not null check (discount_type in ('percent', 'fixed')),
  -- percent: 1 a 90. fixed: valor em centavos, para não usar float com dinheiro.
  discount_value integer not null check (discount_value > 0),
  valid_until date not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint percent_within_range check (
    discount_type <> 'percent' or discount_value between 1 and 90
  )
);

create index idx_provider_offers_provider_id on public.provider_offers(provider_id);
create index idx_provider_offers_active on public.provider_offers(provider_id, is_active)
  where is_active;

-- Uma oferta ativa por prestador
create unique index idx_provider_offers_one_active on public.provider_offers(provider_id)
  where is_active;

alter table public.provider_offers enable row level security;

-- Clientes veem apenas ofertas vigentes de prestadores ativos
create policy "Anyone can read valid offers"
  on public.provider_offers for select
  to authenticated, anon
  using (
    is_active
    and valid_until >= current_date
    and exists (
      select 1 from public.provider_profiles p
      where p.id = provider_id and p.is_active
    )
  );

create policy "Providers can read own offers"
  on public.provider_offers for select
  to authenticated
  using (
    exists (
      select 1 from public.provider_profiles p
      where p.id = provider_id and p.user_id = auth.uid()
    )
  );

-- Criar exige plano pago em vigor
create policy "Pro providers can create offers"
  on public.provider_offers for insert
  to authenticated
  with check (
    exists (
      select 1 from public.provider_profiles p
      where p.id = provider_id and p.user_id = auth.uid()
    )
    and public.provider_plan(provider_id) = 'pro'
  );

-- Editar e desativar continuam permitidos mesmo após cair para o grátis,
-- senão o prestador ficaria preso a uma oferta que não consegue encerrar.
create policy "Providers can update own offers"
  on public.provider_offers for update
  to authenticated
  using (
    exists (
      select 1 from public.provider_profiles p
      where p.id = provider_id and p.user_id = auth.uid()
    )
  );

create policy "Providers can delete own offers"
  on public.provider_offers for delete
  to authenticated
  using (
    exists (
      select 1 from public.provider_profiles p
      where p.id = provider_id and p.user_id = auth.uid()
    )
  );

create or replace trigger on_provider_offers_updated
  before update on public.provider_offers
  for each row execute function public.touch_updated_at();

comment on table public.provider_offers is
  'Descontos exibidos no card e no perfil. Só o plano pago cria; qualquer plano encerra.';
