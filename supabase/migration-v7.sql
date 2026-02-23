-- ============================================
-- ResolveAi - Migration V7
-- Features:
--   - Fix: populate provider_profiles from auth metadata at signup time
--   - The trigger now reads provider_data from auth.users.raw_user_meta_data
--     and creates a fully populated profile + categories + business hours
--   - This eliminates the need for client-side auto-complete after email confirmation
-- Idempotent: safe to run multiple times
-- ============================================

-- ============================================
-- 1. Update handle_new_provider trigger function
--    Now reads provider_data from auth metadata to populate the profile
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_provider()
RETURNS trigger AS $$
DECLARE
  provider_data jsonb;
  pp_id uuid;
  cat_id text;
BEGIN
  IF new.role = 'PROVIDER' THEN
    -- Read provider_data from auth.users metadata (set during email signup wizard)
    SELECT raw_user_meta_data->'provider_data' INTO provider_data
    FROM auth.users WHERE id = new.id;

    IF provider_data IS NOT NULL
       AND (provider_data->>'whatsapp') IS NOT NULL
       AND (provider_data->>'whatsapp') != '' THEN
      -- Provider registered via email wizard with full data
      INSERT INTO public.provider_profiles (
        user_id, description, city, neighborhood, cep, state,
        latitude, longitude, whatsapp, is_active
      )
      VALUES (
        new.id,
        coalesce(provider_data->>'description', ''),
        coalesce(provider_data->>'city', ''),
        coalesce(provider_data->>'neighborhood', ''),
        nullif(provider_data->>'cep', ''),
        nullif(provider_data->>'state', ''),
        (provider_data->>'latitude')::double precision,
        (provider_data->>'longitude')::double precision,
        provider_data->>'whatsapp',
        true
      )
      ON CONFLICT (user_id) DO UPDATE SET
        description = EXCLUDED.description,
        city = EXCLUDED.city,
        neighborhood = EXCLUDED.neighborhood,
        cep = EXCLUDED.cep,
        state = EXCLUDED.state,
        latitude = EXCLUDED.latitude,
        longitude = EXCLUDED.longitude,
        whatsapp = EXCLUDED.whatsapp,
        is_active = true
      RETURNING id INTO pp_id;

      -- Insert provider categories from metadata
      IF pp_id IS NOT NULL AND provider_data->'categoryIds' IS NOT NULL THEN
        FOR cat_id IN SELECT jsonb_array_elements_text(provider_data->'categoryIds')
        LOOP
          INSERT INTO public.provider_categories (provider_id, category_id)
          VALUES (pp_id, cat_id::uuid)
          ON CONFLICT (provider_id, category_id) DO NOTHING;
        END LOOP;
      END IF;

      -- Create default business hours (Mon-Fri 08:00-18:00, Sat-Sun closed)
      IF pp_id IS NOT NULL THEN
        INSERT INTO public.business_hours (provider_id, day_of_week, open_time, close_time, is_closed)
        VALUES
          (pp_id, 0, null, null, true),
          (pp_id, 1, '08:00', '18:00', false),
          (pp_id, 2, '08:00', '18:00', false),
          (pp_id, 3, '08:00', '18:00', false),
          (pp_id, 4, '08:00', '18:00', false),
          (pp_id, 5, '08:00', '18:00', false),
          (pp_id, 6, null, null, true)
        ON CONFLICT (provider_id, day_of_week) DO NOTHING;
      END IF;

    ELSE
      -- Provider without data (Google OAuth or incomplete signup) - create empty profile
      INSERT INTO public.provider_profiles (user_id, is_active)
      VALUES (new.id, true)
      ON CONFLICT (user_id) DO NOTHING;
    END IF;
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
