-- Idempotent migration to add order claim workflow columns
-- Safe to run multiple times - uses IF NOT EXISTS checks
-- Does not lose any existing data

-- 1. Add claimed_at column to orders table (timestamp, nullable)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'claimed_at'
  ) THEN
    ALTER TABLE orders ADD COLUMN claimed_at TIMESTAMP;
    RAISE NOTICE 'Added column claimed_at to orders';
  ELSE
    RAISE NOTICE 'Column claimed_at already exists in orders';
  END IF;
END $$;

-- 2. Add released_at column to orders table (timestamp, nullable)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'released_at'
  ) THEN
    ALTER TABLE orders ADD COLUMN released_at TIMESTAMP;
    RAISE NOTICE 'Added column released_at to orders';
  ELSE
    RAISE NOTICE 'Column released_at already exists in orders';
  END IF;
END $$;

-- 3. Add release_reason column to orders table (text, nullable)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'release_reason'
  ) THEN
    ALTER TABLE orders ADD COLUMN release_reason TEXT;
    RAISE NOTICE 'Added column release_reason to orders';
  ELSE
    RAISE NOTICE 'Column release_reason already exists in orders';
  END IF;
END $$;

-- 4. Verify the columns exist and show their types
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'orders'
  AND column_name IN ('claimed_at', 'released_at', 'release_reason')
ORDER BY ordinal_position;

-- Expected output:
-- column_name  | data_type           | is_nullable | column_default
-- -------------|---------------------|-------------|----------------
-- claimed_at   | timestamp without time zone | YES      | (null)
-- released_at  | timestamp without time zone | YES      | (null)
-- release_reason | text              | YES         | (null)