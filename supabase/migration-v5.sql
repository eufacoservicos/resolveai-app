-- ============================================
-- ResolveAi - Migration V5
-- Features:
--   - New categories (Arquiteto, Engenheiro Civil, Designer de Interiores, Paisagista)
--   - "Outros" parent category group
--   - RLS policies for public access and custom categories
-- Idempotent: safe to run multiple times
-- ============================================

-- ============================================
-- 1. Insert new categories
-- ============================================

INSERT INTO public.categories (name, slug) VALUES
  ('Arquiteto', 'arquiteto'),
  ('Engenheiro Civil', 'engenheiro-civil'),
  ('Designer de Interiores', 'designer-de-interiores'),
  ('Paisagista', 'paisagista')
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- 2. Assign parent_id (Construção e Reformas)
-- ============================================

UPDATE public.categories
SET parent_id = (SELECT id FROM public.categories WHERE slug = 'construcao-reformas')
WHERE slug IN ('arquiteto', 'engenheiro-civil', 'designer-de-interiores', 'paisagista')
  AND parent_id IS NULL;

-- ============================================
-- 3. Create "Outros" parent category group
-- ============================================

INSERT INTO public.categories (name, slug, parent_id, display_order) VALUES
  ('Outros', 'outros-servicos', NULL, 12)
ON CONFLICT (slug) DO NOTHING;

-- Assign orphan categories to "Outros" parent
UPDATE public.categories
SET parent_id = (SELECT id FROM public.categories WHERE slug = 'outros-servicos')
WHERE slug IN ('costureira', 'sapateiro', 'lavanderia', 'soldador', 'outros')
  AND parent_id IS NULL;

-- ============================================
-- 4. RLS: Allow authenticated users to INSERT categories (custom categories)
-- ============================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'categories' AND policyname = 'Authenticated users can create categories'
  ) THEN
    CREATE POLICY "Authenticated users can create categories"
      ON public.categories FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;
END $$;

-- ============================================
-- 5. RLS: Allow anonymous access to public data (for public browsing)
-- ============================================

-- Provider profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'provider_profiles' AND policyname = 'Anyone can read active providers'
  ) THEN
    CREATE POLICY "Anyone can read active providers"
      ON public.provider_profiles FOR SELECT
      TO anon
      USING (is_active = true);
  END IF;
END $$;

-- Users (public info for provider display)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'users' AND policyname = 'Anyone can read user profiles'
  ) THEN
    CREATE POLICY "Anyone can read user profiles"
      ON public.users FOR SELECT
      TO anon
      USING (true);
  END IF;
END $$;

-- Provider categories
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'provider_categories' AND policyname = 'Anyone can read provider categories'
  ) THEN
    CREATE POLICY "Anyone can read provider categories"
      ON public.provider_categories FOR SELECT
      TO anon
      USING (true);
  END IF;
END $$;

-- Portfolio images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'portfolio_images' AND policyname = 'Anyone can read portfolio images'
  ) THEN
    CREATE POLICY "Anyone can read portfolio images"
      ON public.portfolio_images FOR SELECT
      TO anon
      USING (true);
  END IF;
END $$;

-- Reviews
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'reviews' AND policyname = 'Anyone can read reviews'
  ) THEN
    CREATE POLICY "Anyone can read reviews"
      ON public.reviews FOR SELECT
      TO anon
      USING (true);
  END IF;
END $$;

-- Business hours
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'business_hours' AND policyname = 'Anyone can read business hours'
  ) THEN
    CREATE POLICY "Anyone can read business hours"
      ON public.business_hours FOR SELECT
      TO anon
      USING (true);
  END IF;
END $$;
