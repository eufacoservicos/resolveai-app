-- Migration v13: Add profanity filter trigger on categories table
-- This is a server-side safety net to block offensive category names
-- even if client-side validation is bypassed.

CREATE OR REPLACE FUNCTION check_category_profanity()
RETURNS TRIGGER AS $$
DECLARE
  normalised TEXT;
  blocked_words TEXT[] := ARRAY[
    'porra','merda','caralho','puta','putaria','puteiro',
    'buceta','boceta','cuzao',
    'arrombado','arrombada','fdp',
    'filho da puta','filha da puta',
    'vagabunda','vagabundo','viado','viadinho',
    'piranha','otario','otaria','babaca','imbecil',
    'retardado','retardada','corno','cornudo','canalha',
    'desgraca','desgracado',
    'pau no cu','vai se fuder','vai tomar no cu',
    'foda-se','fodase','pqp','vsf','vtnc',
    'macaco','macaca','crioulo','crioula',
    'negrinho','negrinha','sapatao','traveco'
  ];
  word TEXT;
BEGIN
  -- Normalise: lowercase, strip accents, collapse whitespace
  normalised := trim(
    regexp_replace(
      translate(
        lower(unaccent(NEW.name)),
        '', ''
      ),
      '\s+', ' ', 'g'
    )
  );

  FOREACH word IN ARRAY blocked_words LOOP
    -- Multi-word phrases: substring match
    IF word LIKE '% %' THEN
      IF normalised LIKE '%' || word || '%' THEN
        RAISE EXCEPTION 'O nome da categoria contém termos inadequados.';
      END IF;
    ELSE
      -- Single words: whole-word boundary match using regex
      IF normalised ~ ('\m' || word || '\M') THEN
        RAISE EXCEPTION 'O nome da categoria contém termos inadequados.';
      END IF;
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Make sure unaccent extension is available
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Attach the trigger
DROP TRIGGER IF EXISTS trg_check_category_profanity ON categories;
CREATE TRIGGER trg_check_category_profanity
  BEFORE INSERT OR UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION check_category_profanity();
