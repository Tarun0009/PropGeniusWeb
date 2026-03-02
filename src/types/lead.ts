export type LeadSource =
  | "website" | "whatsapp" | "phone" | "walkin"
  | "referral" | "99acres" | "magicbricks" | "housing" | "other";

export type LeadStatus =
  | "new" | "contacted" | "interested" | "site_visit"
  | "negotiation" | "converted" | "lost";

export type ActivityType =
  | "call" | "email" | "whatsapp" | "site_visit"
  | "note" | "status_change" | "score_update";

export interface Lead {
  id: string;
  organization_id: string;
  assigned_to: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  whatsapp_number: string | null;
  source: LeadSource;
  interested_in: string | null;
  budget_min: number | null;
  budget_max: number | null;
  preferred_location: string | null;
  preferred_property_type: string | null;
  ai_score: number;
  ai_score_reason: string | null;
  ai_recommended_action: string | null;
  status: LeadStatus;
  lost_reason: string | null;
  last_contacted_at: string | null;
  next_followup_at: string | null;
  followup_notes: string | null;
  notes: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface LeadActivity {
  id: string;
  lead_id: string;
  performed_by: string | null;
  type: ActivityType;
  description: string;
  old_value: string | null;
  new_value: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}
