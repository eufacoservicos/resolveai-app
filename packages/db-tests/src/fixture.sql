-- ============================================
-- Dublês do que o Supabase fornece e o Postgres puro não tem
-- ============================================
--
-- O alvo dos testes são os gatilhos e funções das nossas migrações. Tudo
-- aqui existe só para o schema conseguir subir: nada disto é verificado.

create schema if not exists auth;
create schema if not exists extensions;

create table if not exists auth.users (
  id uuid primary key,
  email text,
  created_at timestamptz not null default now(),
  raw_user_meta_data jsonb not null default '{}'::jsonb
);

-- No Supabase auth.uid() lê o JWT. Aqui lê uma configuração de sessão, para
-- os testes poderem trocar de usuário e exercitar a RLS de verdade.
create or replace function auth.uid() returns uuid as $fn$
  select nullif(current_setting('test.uid', true), '')::uuid;
$fn$ language sql stable;

do $do$ begin
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then
    create role service_role;
  end if;
end $do$;

-- pg_net não existe fora do Supabase. Este dublê registra a chamada em vez de
-- fazê-la, para dar para verificar que o gatilho de push dispararia.
create schema if not exists net;

create table if not exists net._calls (
  id bigserial primary key,
  url text,
  body jsonb,
  called_at timestamptz not null default now()
);

create or replace function net.http_post(
  url text,
  body jsonb default '{}'::jsonb,
  params jsonb default '{}'::jsonb,
  headers jsonb default '{}'::jsonb,
  timeout_milliseconds integer default 5000
) returns bigint as $fn$
  insert into net._calls (url, body) values (url, body) returning id;
$fn$ language sql;

-- ============================================
-- Dublê do Supabase Vault
-- ============================================
--
-- O Vault de verdade criptografa com pgsodium. Aqui guardamos em claro: o
-- que os testes verificam é o gatilho ler o segredo certo pelo nome, não a
-- criptografia, que é responsabilidade do Supabase.

create schema if not exists vault;

create table if not exists vault.secrets (
  id uuid primary key default gen_random_uuid(),
  name text unique,
  description text,
  secret text,
  created_at timestamptz not null default now()
);

create or replace view vault.decrypted_secrets as
  select id, name, description, secret, secret as decrypted_secret, created_at
    from vault.secrets;

create or replace function vault.create_secret(
  new_secret text,
  new_name text default null,
  new_description text default ''
) returns uuid as $fn$
  insert into vault.secrets (name, description, secret)
  values (new_name, new_description, new_secret)
  returning id;
$fn$ language sql;

create or replace function vault.update_secret(
  secret_id uuid,
  new_secret text default null,
  new_name text default null,
  new_description text default null
) returns void as $fn$
  update vault.secrets
     set secret = coalesce(new_secret, secret),
         name = coalesce(new_name, name),
         description = coalesce(new_description, description)
   where id = secret_id;
$fn$ language sql;

-- Extensões que o PGlite não empacota
create or replace function public.uuid_generate_v4() returns uuid as $fn$
  select gen_random_uuid();
$fn$ language sql volatile;

create or replace function public.unaccent(text) returns text as $fn$
  select $1;
$fn$ language sql immutable;

create or replace function public.ll_to_earth(float8, float8) returns point as $fn$
  select point($2, $1);
$fn$ language sql immutable;

create or replace function public.earth_distance(point, point) returns float8 as $fn$
  select 0::float8;
$fn$ language sql immutable;

-- Supabase Storage
create schema if not exists storage;

create table if not exists storage.buckets (
  id text primary key,
  name text not null,
  public boolean not null default false
);

create table if not exists storage.objects (
  id uuid primary key default gen_random_uuid(),
  bucket_id text references storage.buckets(id),
  name text not null,
  owner uuid
);
alter table storage.objects enable row level security;

create or replace function storage.foldername(name text) returns text[] as $fn$
  select string_to_array(name, '/');
$fn$ language sql immutable;
