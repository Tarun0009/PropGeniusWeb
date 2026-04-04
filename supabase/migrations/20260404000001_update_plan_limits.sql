-- =====================================================
-- Migration: 20260404000001_update_plan_limits
-- Update free plan defaults to be more generous,
-- and update the signup trigger to match.
--
-- Changes:
--   free plan: max_listings 5→10, max_leads 50→100
--   pro plan:  max_agents 1→5
--   business:  max_agents 5→unlimited (-1 in code,
--              but we use 9999 in DB for compatibility)
-- =====================================================

-- 1. Update existing FREE plan orgs to new limits
UPDATE public.organizations
SET
  max_listings = 10,
  max_leads    = 100,
  updated_at   = now()
WHERE plan = 'free'
  AND max_listings = 5;   -- only bump if still at old default

-- 2. Update existing PRO plan orgs: allow 5 agents
UPDATE public.organizations
SET
  max_agents = 5,
  updated_at = now()
WHERE plan = 'pro'
  AND max_agents = 1;     -- only bump if still at old default

-- 3. Update existing BUSINESS plan orgs: unlimited agents (9999)
UPDATE public.organizations
SET
  max_agents = 9999,
  updated_at = now()
WHERE plan = 'business'
  AND max_agents < 9999;

-- 4. Update the signup trigger to use new free defaults
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  org_id   uuid := gen_random_uuid();
  org_name text := COALESCE(NEW.raw_user_meta_data->>'organization_name', 'My Organization');
  org_slug text := lower(regexp_replace(org_name, '[^a-zA-Z0-9]+', '-', 'g'));
BEGIN
  INSERT INTO public.organizations (id, name, slug, plan, max_listings, max_leads, max_agents)
  VALUES (org_id, org_name, org_slug || '-' || substr(org_id::text, 1, 8), 'free', 10, 100, 1);

  INSERT INTO public.profiles (id, organization_id, full_name, email, role, monthly_listing_count, is_active)
  VALUES (
    NEW.id,
    org_id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    'owner',
    0,
    true
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
