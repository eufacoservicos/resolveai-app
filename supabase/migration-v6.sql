-- ============================================
-- ResolveAi - Migration V6
-- Features:
--   - Add instagram field to provider_profiles
-- Idempotent: safe to run multiple times
-- ============================================

-- Add instagram column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'provider_profiles'
      AND column_name = 'instagram'
  ) THEN
    ALTER TABLE public.provider_profiles
    ADD COLUMN instagram text DEFAULT NULL;
  END IF;
END $$;
