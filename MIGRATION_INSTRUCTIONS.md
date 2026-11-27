# Production Database Migration Instructions

## Issue
The production PostgreSQL database is missing the new columns added for the order claim workflow:
- `orders.claimed_at` (timestamp)
- `orders.released_at` (timestamp)  
- `orders.release_reason` (text)

## Migration File
Created: `migration_add_order_claim_columns.sql`

This is an **idempotent** migration - safe to run multiple times. It uses `IF NOT EXISTS` checks via PL/pgSQL DO blocks.

## How to Run

### Option 1: Using psql (recommended)
```bash
psql "postgresql://user:pass@host:port/dbname" -f migration_add_order_claim_columns.sql
```

### Option 2: Using DATABASE_URL environment variable
```bash
psql "$DATABASE_URL" -f migration_add_order_claim_columns.sql
```

### Option 3: From application code (Node.js)
```bash
# If you have a script that can run SQL
node -e "
const { Pool } = require('pg');
const fs = require('fs');
const sql = fs.readFileSync('migration_add_order_claim_columns.sql', 'utf8');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query(sql).then(() => {
  console.log('Migration completed');
  pool.end();
}).catch(err => {
  console.error('Migration failed:', err);
  pool.end();
});
"
```

## What the Migration Does
1. Checks if each column exists in `information_schema.columns`
2. Only adds the column if it doesn't exist
3. Outputs NOTICE messages showing what was added/already existed
4. Verifies the columns at the end

## Verification
After running, you should see output like:
```
NOTICE:  Added column claimed_at to orders
NOTICE:  Added column released_at to orders
NOTICE:  Added column release_reason to orders
 column_name  | data_type           | is_nullable | column_default
--------------|---------------------|-------------|----------------
 claimed_at   | timestamp without time zone | YES      | (null)
 released_at  | timestamp without time zone | YES      | (null)
 release_reason | text              | YES         | (null)
```

Or if columns already exist:
```
NOTICE:  Column claimed_at already exists in orders
NOTICE:  Column released_at already exists in orders
NOTICE:  Column release_reason already exists in orders
 column_name  | data_type           | is_nullable | column_default
--------------|---------------------|-------------|----------------
 claimed_at   | timestamp without time zone | YES      | (null)
 released_at  | timestamp without time zone | YES      | (null)
 release_reason | text              | YES         | (null)
```

## No Data Loss
- All columns are nullable with no default values
- Existing rows will have NULL for these columns
- No existing data is modified or deleted

## Related Schema Changes
These columns support the order claim workflow:
- `claimedAt` - When a staff member claimed the order
- `releasedAt` - When a staff member released the order back to inbox
- `releaseReason` - Optional reason for releasing

The `staff` table and `orderHandoffs` table already exist in the schema and should already be in production (they were added before the claiming feature).