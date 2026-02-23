-- ============================================
-- ResolveAi - Migration V8
-- Features:
--   - Review replies: providers can respond to client reviews
--   - One reply per review (unique constraint on review_id)
-- Idempotent: safe to run multiple times
-- ============================================

-- ============================================
-- 1. REVIEW REPLIES table
-- ============================================

CREATE TABLE IF NOT EXISTS public.review_replies (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id uuid NOT NULL UNIQUE REFERENCES public.reviews(id) ON DELETE CASCADE,
  provider_id uuid NOT NULL REFERENCES public.provider_profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_review_replies_review_id
  ON public.review_replies(review_id);

CREATE INDEX IF NOT EXISTS idx_review_replies_provider_id
  ON public.review_replies(provider_id);

-- ============================================
-- 2. RLS policies
-- ============================================

ALTER TABLE public.review_replies ENABLE ROW LEVEL SECURITY;

-- Anyone can read replies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can read review replies' AND tablename = 'review_replies') THEN
    CREATE POLICY "Anyone can read review replies"
      ON public.review_replies FOR SELECT
      USING (true);
  END IF;
END $$;

-- Providers can insert replies to reviews on their own profile
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Providers can reply to own reviews' AND tablename = 'review_replies') THEN
    CREATE POLICY "Providers can reply to own reviews"
      ON public.review_replies FOR INSERT
      TO authenticated
      WITH CHECK (
        provider_id IN (
          SELECT id FROM public.provider_profiles WHERE user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Providers can update their own replies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Providers can update own replies' AND tablename = 'review_replies') THEN
    CREATE POLICY "Providers can update own replies"
      ON public.review_replies FOR UPDATE
      TO authenticated
      USING (
        provider_id IN (
          SELECT id FROM public.provider_profiles WHERE user_id = auth.uid()
        )
      );
  END IF;
END $$;
