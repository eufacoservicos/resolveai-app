-- ============================================
-- ResolveAí - Database Schema
-- Run this in the Supabase SQL Editor
-- ============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- Users table (extends Supabase auth.users)
create table public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null unique,
  full_name text not null,
  avatar_url text,
  role text not null default 'CLIENT' check (role in ('CLIENT', 'PROVIDER')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Categories table
create table public.categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);

-- Provider profiles
create table public.provider_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  description text not null default '',
  neighborhood text not null default '',
  whatsapp text not null default '',
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Provider <-> Category (many-to-many)
create table public.provider_categories (
  id uuid primary key default uuid_generate_v4(),
  provider_id uuid not null references public.provider_profiles(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  unique(provider_id, category_id)
);

-- Portfolio images
create table public.portfolio_images (
  id uuid primary key default uuid_generate_v4(),
  provider_id uuid not null references public.provider_profiles(id) on delete cascade,
  image_url text not null,
  created_at timestamptz not null default now()
);

-- Reviews
create table public.reviews (
  id uuid primary key default uuid_generate_v4(),
  provider_id uuid not null references public.provider_profiles(id) on delete cascade,
  client_id uuid not null references public.users(id) on delete cascade,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamptz not null default now(),
  unique(provider_id, client_id) -- one review per client per provider
);

-- ============================================
-- VIEWS
-- ============================================

-- View for provider average rating
create or replace view public.provider_ratings as
select
  provider_id,
  round(avg(rating)::numeric, 1) as average_rating,
  count(*) as review_count
from public.reviews
group by provider_id;

-- ============================================
-- INDEXES
-- ============================================

create index idx_provider_profiles_user_id on public.provider_profiles(user_id);
create index idx_provider_profiles_is_active on public.provider_profiles(is_active);
create index idx_provider_profiles_neighborhood on public.provider_profiles(neighborhood);
create index idx_provider_categories_provider_id on public.provider_categories(provider_id);
create index idx_provider_categories_category_id on public.provider_categories(category_id);
create index idx_portfolio_images_provider_id on public.portfolio_images(provider_id);
create index idx_reviews_provider_id on public.reviews(provider_id);
create index idx_reviews_client_id on public.reviews(client_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all tables
alter table public.users enable row level security;
alter table public.categories enable row level security;
alter table public.provider_profiles enable row level security;
alter table public.provider_categories enable row level security;
alter table public.portfolio_images enable row level security;
alter table public.reviews enable row level security;

-- USERS policies
create policy "Authenticated users can read all users"
  on public.users for select
  to authenticated
  using (true);

create policy "Users can update own data"
  on public.users for update
  using (auth.uid() = id);

create policy "Users can insert own data"
  on public.users for insert
  with check (auth.uid() = id);

-- CATEGORIES policies (read-only for all authenticated users)
create policy "Authenticated users can read categories"
  on public.categories for select
  to authenticated
  using (true);

-- PROVIDER PROFILES policies
create policy "Authenticated users can read active providers"
  on public.provider_profiles for select
  to authenticated
  using (is_active = true or user_id = auth.uid());

create policy "Providers can insert own profile"
  on public.provider_profiles for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "Providers can update own profile"
  on public.provider_profiles for update
  to authenticated
  using (user_id = auth.uid());

-- PROVIDER CATEGORIES policies
create policy "Authenticated users can read provider categories"
  on public.provider_categories for select
  to authenticated
  using (true);

create policy "Providers can manage own categories"
  on public.provider_categories for insert
  to authenticated
  with check (
    provider_id in (
      select id from public.provider_profiles where user_id = auth.uid()
    )
  );

create policy "Providers can delete own categories"
  on public.provider_categories for delete
  to authenticated
  using (
    provider_id in (
      select id from public.provider_profiles where user_id = auth.uid()
    )
  );

-- PORTFOLIO IMAGES policies
create policy "Authenticated users can view portfolio images"
  on public.portfolio_images for select
  to authenticated
  using (true);

create policy "Providers can upload own portfolio images"
  on public.portfolio_images for insert
  to authenticated
  with check (
    provider_id in (
      select id from public.provider_profiles where user_id = auth.uid()
    )
  );

create policy "Providers can delete own portfolio images"
  on public.portfolio_images for delete
  to authenticated
  using (
    provider_id in (
      select id from public.provider_profiles where user_id = auth.uid()
    )
  );

-- REVIEWS policies
create policy "Authenticated users can read reviews"
  on public.reviews for select
  to authenticated
  using (true);

create policy "Authenticated users can create reviews"
  on public.reviews for insert
  to authenticated
  with check (auth.uid() = client_id);

-- ============================================
-- SEED DATA - Categories
-- ============================================

insert into public.categories (name, slug) values
  ('Pintor', 'pintor'),
  ('Eletricista', 'eletricista'),
  ('Encanador', 'encanador'),
  ('Diarista', 'diarista'),
  ('Pedreiro', 'pedreiro');

-- ============================================
-- STORAGE BUCKET
-- ============================================

-- Run this in the Supabase Dashboard > Storage, or via SQL:
insert into storage.buckets (id, name, public)
values ('portfolio', 'portfolio', true);

-- Storage policies
create policy "Authenticated users can view portfolio files"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'portfolio');

create policy "Users can upload portfolio files"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'portfolio');

create policy "Users can delete own portfolio files"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'portfolio' and (storage.foldername(name))[1] = auth.uid()::text);

-- ============================================
-- ANALYTICS TABLES
-- ============================================

-- Profile views tracking
create table public.profile_views (
  id uuid primary key default uuid_generate_v4(),
  provider_id uuid not null references public.provider_profiles(id) on delete cascade,
  viewer_id uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index idx_profile_views_provider_id on public.profile_views(provider_id);
create index idx_profile_views_created_at on public.profile_views(created_at);

-- WhatsApp clicks tracking
create table public.whatsapp_clicks (
  id uuid primary key default uuid_generate_v4(),
  provider_id uuid not null references public.provider_profiles(id) on delete cascade,
  clicker_id uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index idx_whatsapp_clicks_provider_id on public.whatsapp_clicks(provider_id);
create index idx_whatsapp_clicks_created_at on public.whatsapp_clicks(created_at);

-- RLS for analytics tables
alter table public.profile_views enable row level security;
alter table public.whatsapp_clicks enable row level security;

-- Anyone (including anonymous) can insert tracking events
create policy "Anyone can track profile views"
  on public.profile_views for insert
  to anon, authenticated
  with check (true);

create policy "Anyone can track whatsapp clicks"
  on public.whatsapp_clicks for insert
  to anon, authenticated
  with check (true);

-- Providers can read only their own stats
create policy "Providers can read own profile views"
  on public.profile_views for select
  to authenticated
  using (
    provider_id in (
      select id from public.provider_profiles where user_id = auth.uid()
    )
  );

create policy "Providers can read own whatsapp clicks"
  on public.whatsapp_clicks for select
  to authenticated
  using (
    provider_id in (
      select id from public.provider_profiles where user_id = auth.uid()
    )
  );

-- ============================================
-- FUNCTION: Auto-create user profile on signup
-- ============================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name, avatar_url, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url',
    coalesce(new.raw_user_meta_data->>'role', 'CLIENT')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to auto-create user on signup
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================
-- FUNCTION: Auto-create provider profile when role is PROVIDER
-- ============================================

create or replace function public.handle_provider_role()
returns trigger as $$
begin
  if new.role = 'PROVIDER' and old.role = 'CLIENT' then
    insert into public.provider_profiles (user_id, is_active)
    values (new.id, true)
    on conflict (user_id) do nothing;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_user_role_change
  after update of role on public.users
  for each row execute function public.handle_provider_role();

-- Also create provider profile if user signs up as PROVIDER
create or replace function public.handle_new_provider()
returns trigger as $$
begin
  if new.role = 'PROVIDER' then
    insert into public.provider_profiles (user_id, is_active)
    values (new.id, true)
    on conflict (user_id) do nothing;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_user_created_provider
  after insert on public.users
  for each row execute function public.handle_new_provider();
