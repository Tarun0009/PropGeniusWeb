-- =====================================================
-- PropGenius AI — Complete Database Schema
-- Run this ONCE in Supabase SQL Editor
-- =====================================================

-- 1. ORGANIZATIONS
CREATE TABLE public.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  logo_url text,
  address text,
  city text,
  phone text,
  email text,
  plan text NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'business', 'enterprise')),
  razorpay_customer_id text,
  razorpay_subscription_id text,
  max_listings integer NOT NULL DEFAULT 5,
  max_leads integer NOT NULL DEFAULT 50,
  max_agents integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. PROFILES
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  email text NOT NULL,
  phone text,
  avatar_url text,
  role text NOT NULL DEFAULT 'owner' CHECK (role IN ('owner', 'admin', 'agent')),
  monthly_listing_count integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3. LISTINGS
CREATE TABLE public.listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  property_type text NOT NULL CHECK (property_type IN ('apartment', 'house', 'villa', 'plot', 'commercial', 'pg')),
  transaction_type text NOT NULL CHECK (transaction_type IN ('sale', 'rent', 'lease')),
  price numeric NOT NULL,
  price_unit text NOT NULL DEFAULT 'total' CHECK (price_unit IN ('total', 'per_sqft', 'per_month')),
  address text,
  locality text,
  city text NOT NULL,
  state text NOT NULL,
  pincode text,
  latitude double precision,
  longitude double precision,
  bedrooms integer,
  bathrooms integer,
  area_sqft numeric,
  carpet_area_sqft numeric,
  floor_number integer,
  total_floors integer,
  furnishing text CHECK (furnishing IS NULL OR furnishing IN ('unfurnished', 'semi', 'fully')),
  facing text,
  age_years integer,
  parking integer NOT NULL DEFAULT 0,
  amenities text[] NOT NULL DEFAULT '{}',
  images text[] NOT NULL DEFAULT '{}',
  floor_plan_url text,
  virtual_tour_url text,
  ai_description text,
  ai_social_post text,
  ai_seo_title text,
  ai_seo_description text,
  ai_highlights text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'sold', 'rented', 'archived')),
  views_count integer NOT NULL DEFAULT 0,
  inquiries_count integer NOT NULL DEFAULT 0,
  published_platforms text[] NOT NULL DEFAULT '{}',
  external_urls jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 4. LEADS
CREATE TABLE public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  email text,
  phone text,
  whatsapp_number text,
  source text NOT NULL CHECK (source IN ('website', 'whatsapp', 'phone', 'walkin', 'referral', '99acres', 'magicbricks', 'housing', 'other')),
  interested_in text,
  budget_min numeric,
  budget_max numeric,
  preferred_location text,
  preferred_property_type text,
  ai_score integer NOT NULL DEFAULT 0,
  ai_score_reason text,
  ai_recommended_action text,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'interested', 'site_visit', 'negotiation', 'converted', 'lost')),
  lost_reason text,
  last_contacted_at timestamptz,
  next_followup_at timestamptz,
  followup_notes text,
  notes text,
  tags text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 5. LEAD ACTIVITIES
CREATE TABLE public.lead_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  performed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  type text NOT NULL CHECK (type IN ('call', 'email', 'whatsapp', 'site_visit', 'note', 'status_change', 'score_update')),
  description text NOT NULL,
  old_value text,
  new_value text,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 6. WHATSAPP MESSAGES
CREATE TABLE public.whatsapp_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  lead_id uuid REFERENCES public.leads(id) ON DELETE SET NULL,
  direction text NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  message_type text NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'template', 'image', 'document')),
  content text,
  template_name text,
  media_url text,
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'sent', 'delivered', 'read', 'failed')),
  whatsapp_message_id text,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 7. SUBSCRIPTIONS
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  razorpay_subscription_id text,
  razorpay_payment_id text,
  plan text NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'business', 'enterprise')),
  status text NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'active', 'paused', 'cancelled', 'expired')),
  amount numeric,
  currency text NOT NULL DEFAULT 'INR',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX idx_profiles_org ON public.profiles(organization_id);
CREATE INDEX idx_listings_org ON public.listings(organization_id);
CREATE INDEX idx_listings_status ON public.listings(status);
CREATE INDEX idx_listings_city ON public.listings(city);
CREATE INDEX idx_leads_org ON public.leads(organization_id);
CREATE INDEX idx_leads_status ON public.leads(status);
CREATE INDEX idx_lead_activities_lead ON public.lead_activities(lead_id);
CREATE INDEX idx_whatsapp_messages_org ON public.whatsapp_messages(organization_id);
CREATE INDEX idx_whatsapp_messages_lead ON public.whatsapp_messages(lead_id);
CREATE INDEX idx_subscriptions_org ON public.subscriptions(organization_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Helper: get current user's org_id
CREATE OR REPLACE FUNCTION public.get_user_org_id()
RETURNS uuid AS $$
  SELECT organization_id FROM public.profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ORGANIZATIONS: members can read their own org
CREATE POLICY "Users can view own org"
  ON public.organizations FOR SELECT
  USING (id = public.get_user_org_id());

CREATE POLICY "Owners can update own org"
  ON public.organizations FOR UPDATE
  USING (id = public.get_user_org_id());

-- PROFILES: members can read profiles in their org
CREATE POLICY "Users can view org profiles"
  ON public.profiles FOR SELECT
  USING (organization_id = public.get_user_org_id());

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid());

-- LISTINGS: org isolation
CREATE POLICY "Users can view org listings"
  ON public.listings FOR SELECT
  USING (organization_id = public.get_user_org_id());

CREATE POLICY "Users can create org listings"
  ON public.listings FOR INSERT
  WITH CHECK (organization_id = public.get_user_org_id());

CREATE POLICY "Users can update org listings"
  ON public.listings FOR UPDATE
  USING (organization_id = public.get_user_org_id());

CREATE POLICY "Users can delete org listings"
  ON public.listings FOR DELETE
  USING (organization_id = public.get_user_org_id());

-- LEADS: org isolation
CREATE POLICY "Users can view org leads"
  ON public.leads FOR SELECT
  USING (organization_id = public.get_user_org_id());

CREATE POLICY "Users can create org leads"
  ON public.leads FOR INSERT
  WITH CHECK (organization_id = public.get_user_org_id());

CREATE POLICY "Users can update org leads"
  ON public.leads FOR UPDATE
  USING (organization_id = public.get_user_org_id());

CREATE POLICY "Users can delete org leads"
  ON public.leads FOR DELETE
  USING (organization_id = public.get_user_org_id());

-- LEAD ACTIVITIES: via lead's org
CREATE POLICY "Users can view org lead activities"
  ON public.lead_activities FOR SELECT
  USING (lead_id IN (SELECT id FROM public.leads WHERE organization_id = public.get_user_org_id()));

CREATE POLICY "Users can create lead activities"
  ON public.lead_activities FOR INSERT
  WITH CHECK (lead_id IN (SELECT id FROM public.leads WHERE organization_id = public.get_user_org_id()));

-- WHATSAPP MESSAGES: org isolation
CREATE POLICY "Users can view org messages"
  ON public.whatsapp_messages FOR SELECT
  USING (organization_id = public.get_user_org_id());

CREATE POLICY "Users can create org messages"
  ON public.whatsapp_messages FOR INSERT
  WITH CHECK (organization_id = public.get_user_org_id());

-- SUBSCRIPTIONS: org isolation
CREATE POLICY "Users can view org subscriptions"
  ON public.subscriptions FOR SELECT
  USING (organization_id = public.get_user_org_id());

CREATE POLICY "Users can create org subscriptions"
  ON public.subscriptions FOR INSERT
  WITH CHECK (organization_id = public.get_user_org_id());

CREATE POLICY "Users can update org subscriptions"
  ON public.subscriptions FOR UPDATE
  USING (organization_id = public.get_user_org_id());

-- =====================================================
-- AUTO-CREATE ORG + PROFILE ON SIGNUP (TRIGGER)
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  org_id uuid := gen_random_uuid();
  org_name text := COALESCE(NEW.raw_user_meta_data->>'organization_name', 'My Organization');
  org_slug text := lower(regexp_replace(org_name, '[^a-zA-Z0-9]+', '-', 'g'));
BEGIN
  INSERT INTO public.organizations (id, name, slug, plan, max_listings, max_leads, max_agents)
  VALUES (org_id, org_name, org_slug || '-' || substr(org_id::text, 1, 8), 'free', 10, 50, 1);

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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- BACKFILL: Create org + profile for existing users
-- =====================================================
DO $$
DECLARE
  usr RECORD;
  org_id uuid;
  org_name text;
BEGIN
  FOR usr IN
    SELECT id, email, raw_user_meta_data
    FROM auth.users
    WHERE id NOT IN (SELECT id FROM public.profiles)
  LOOP
    org_id := gen_random_uuid();
    org_name := COALESCE(usr.raw_user_meta_data->>'organization_name', 'My Organization');

    INSERT INTO public.organizations (id, name, slug, plan, max_listings, max_leads, max_agents)
    VALUES (org_id, org_name,
      lower(regexp_replace(org_name, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || substr(org_id::text, 1, 8),
      'free', 10, 50, 1);

    INSERT INTO public.profiles (id, organization_id, full_name, email, role, monthly_listing_count, is_active)
    VALUES (usr.id, org_id,
      COALESCE(usr.raw_user_meta_data->>'full_name', ''),
      usr.email, 'owner', 0, true);
  END LOOP;
END;
$$;

-- =====================================================
-- STORAGE: listing-images bucket (skip if exists)
-- =====================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('listing-images', 'listing-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'listing-images');

CREATE POLICY "Allow public reads"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'listing-images');

CREATE POLICY "Allow owners to delete"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'listing-images');
