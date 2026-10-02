-- ============================================
-- MIGRATION v18 - Denúncias e bloqueios
-- ============================================
--
-- Exigência da política de conteúdo gerado por usuário da Google Play:
-- todo app com perfis e avaliações públicas precisa de um caminho in-app
-- para denunciar conteúdo e bloquear pessoas. Hoje não existe nem tabela.
--
-- O denunciante nunca é exposto: a policy de leitura só devolve as próprias
-- denúncias, e a moderação acontece pelo service_role.

create table public.reports (
  id uuid primary key default uuid_generate_v4(),
  reporter_id uuid not null references public.users(id) on delete cascade,
  target_type text not null check (target_type in ('provider', 'review')),
  target_id uuid not null,
  reason text not null check (reason in (
    'fake_profile',      -- perfil falso ou golpe
    'service_not_done',  -- serviço não foi prestado
    'offensive',         -- conteúdo ofensivo ou discriminatório
    'wrong_photos',      -- fotos não são do profissional
    'abusive_pricing',   -- cobrança abusiva
    'other'
  )),
  details text check (details is null or char_length(details) <= 1000),
  status text not null default 'pending' check (status in ('pending', 'reviewed', 'dismissed')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,

  -- Evita a mesma pessoa denunciar o mesmo alvo repetidamente
  unique (reporter_id, target_type, target_id)
);

create index idx_reports_status on public.reports(status, created_at);
create index idx_reports_target on public.reports(target_type, target_id);

alter table public.reports enable row level security;

create policy "Users can report"
  on public.reports for insert
  to authenticated
  with check (auth.uid() = reporter_id);

-- Cada um vê só o que denunciou. Ninguém descobre quem denunciou o quê.
create policy "Users can read own reports"
  on public.reports for select
  to authenticated
  using (auth.uid() = reporter_id);

create policy "Service role moderates reports"
  on public.reports for all
  to service_role
  using (true)
  with check (true);

-- ============================================
-- Bloqueio entre usuários
-- ============================================

create table public.user_blocks (
  id uuid primary key default uuid_generate_v4(),
  blocker_id uuid not null references public.users(id) on delete cascade,
  blocked_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),

  unique (blocker_id, blocked_id),
  constraint cannot_block_self check (blocker_id <> blocked_id)
);

create index idx_user_blocks_blocker on public.user_blocks(blocker_id);

alter table public.user_blocks enable row level security;

create policy "Users can manage own blocks"
  on public.user_blocks for all
  to authenticated
  using (auth.uid() = blocker_id)
  with check (auth.uid() = blocker_id);

-- ============================================
-- FUNÇÃO: prestadores visíveis para quem está logado
-- ============================================
--
-- Bloquear precisa sumir com o perfil da busca, senão o botão não cumpre
-- o que promete. Esta função devolve os ids a excluir da listagem.

create or replace function public.blocked_provider_ids()
returns setof uuid as $$
  select p.id
    from public.provider_profiles p
    join public.user_blocks b on b.blocked_id = p.user_id
   where b.blocker_id = auth.uid();
$$ language sql stable security definer set search_path = public;

grant execute on function public.blocked_provider_ids() to authenticated;

comment on function public.blocked_provider_ids() is
  'Ids de prestadores bloqueados pelo usuário atual, para filtrar da busca.';
