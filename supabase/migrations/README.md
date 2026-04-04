# Database Migrations

## How migrations work

Each `.sql` file in this folder is a versioned database change.
Files are named `YYYYMMDDHHMMSS_description.sql` and run in order.

## Applied migrations

| File | Description | Status |
|------|-------------|--------|
| `20260101000000_initial_schema.sql` | Full initial schema (tables, RLS, trigger, storage) | Applied |
| `20260404000001_update_plan_limits.sql` | Free plan 10 listings / 100 leads; Pro 5 agents; Business unlimited | Applied |

## How to apply a migration

### Option A — Supabase Dashboard (easiest)
1. Open your Supabase project → **SQL Editor**
2. Paste the contents of the migration file
3. Click **Run**

### Option B — Supabase CLI (linked project)
```bash
# Link once (need your project ref from Supabase dashboard → Settings → General)
npx supabase link --project-ref YOUR_PROJECT_REF

# Push all pending migrations
npx supabase db push
```

### Option C — Direct psql
```bash
psql "$DATABASE_URL" -f supabase/migrations/20260404000001_update_plan_limits.sql
```

## How to create a new migration

1. Create a new file: `YYYYMMDDHHMMSS_describe_change.sql`
   - Use current UTC datetime for the timestamp
   - Example: `20260510120000_add_listing_views_table.sql`
2. Write idempotent SQL (use `IF NOT EXISTS`, `OR REPLACE`, etc.)
3. Apply it via one of the methods above
4. Update the table above to mark it applied

## Tips
- Always write idempotent SQL so re-running doesn't break anything
- Test in Supabase SQL Editor first before saving to a file
- Never edit already-applied migrations — create a new one instead
