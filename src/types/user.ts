export type Plan = "free" | "pro" | "business";
export type UserRole = "owner" | "admin" | "agent";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  address: string | null;
  city: string | null;
  phone: string | null;
  email: string | null;
  plan: Plan;
  razorpay_customer_id: string | null;
  razorpay_subscription_id: string | null;
  max_listings: number;
  max_leads: number;
  max_agents: number;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  organization_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  monthly_listing_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  organization?: Organization;
}
