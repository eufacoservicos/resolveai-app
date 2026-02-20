-- ============================================
-- ResolveAi - Migration V5
-- Features: New categories (Arquiteto, Engenheiro Civil, Designer de Interiores, Paisagista)
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
