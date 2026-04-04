import { z } from "zod";

// ─── Listing Form Schema (flat, single schema) ─────────────────────

export const listingFormSchema = z.object({
  // Step 1: Basics
  property_type: z.enum(["apartment", "house", "villa", "plot", "commercial", "pg"], {
    message: "Property type is required",
  }),
  transaction_type: z.enum(["sale", "rent", "lease"], {
    message: "Transaction type is required",
  }),
  price: z.number({ message: "Price is required" }).positive("Price must be positive"),
  price_unit: z.enum(["total", "per_sqft", "per_month"]),

  // Step 2: Location
  address: z.string().optional(),
  locality: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  pincode: z.string().optional(),

  // Step 3: Details
  bedrooms: z.number().int().min(0).optional(),
  bathrooms: z.number().int().min(0).optional(),
  area_sqft: z.number().positive("Area must be positive").optional(),
  carpet_area_sqft: z.number().positive().optional(),
  floor_number: z.number().int().min(0).optional(),
  total_floors: z.number().int().min(0).optional(),
  furnishing: z.enum(["unfurnished", "semi", "fully"]).optional(),
  facing: z.string().optional(),
  age_years: z.number().int().min(0).optional(),
  parking: z.number().int().min(0).optional(),
  amenities: z.array(z.string()).optional(),

  // Step 4: Images
  images: z.array(z.string()).optional(),
  floor_plan_url: z.string().optional(),

  // Step 5: AI & Title
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  description: z.string().optional(),
  ai_description: z.string().optional(),
  ai_social_post: z.string().optional(),
  ai_seo_title: z.string().optional(),
  ai_seo_description: z.string().optional(),
  ai_highlights: z.array(z.string()).optional(),
});

export type ListingFormData = z.infer<typeof listingFormSchema>;

// Step schemas for per-step validation
export const STEP_FIELDS: (keyof ListingFormData)[][] = [
  ["property_type", "transaction_type", "price", "price_unit"],
  ["city", "state"],
  [],
  [],
  ["title"],
];

// ─── AI Generation Request Schema ───────────────────────────────────

export const generateListingRequestSchema = z.object({
  property_type: z.enum(["apartment", "house", "villa", "plot", "commercial", "pg"]),
  transaction_type: z.enum(["sale", "rent", "lease"]),
  price: z.number().positive(),
  locality: z.string().optional(),
  city: z.string(),
  state: z.string(),
  bedrooms: z.number().optional(),
  bathrooms: z.number().optional(),
  area_sqft: z.number().optional(),
  carpet_area_sqft: z.number().optional(),
  floor_number: z.number().optional(),
  total_floors: z.number().optional(),
  furnishing: z.string().optional(),
  facing: z.string().optional(),
  amenities: z.array(z.string()).optional(),
});

export type GenerateListingRequest = z.infer<typeof generateListingRequestSchema>;

// ─── AI Generation Response Schema ──────────────────────────────────

export const aiListingContentSchema = z.object({
  title: z.string(),
  description: z.string(),
  highlights: z.array(z.string()),
  social_post: z.string(),
  seo_title: z.string(),
  seo_description: z.string(),
});

export type AIListingContent = z.infer<typeof aiListingContentSchema>;

// ─── Listing Filter Schema ──────────────────────────────────────────

export const listingFilterSchema = z.object({
  status: z.enum(["draft", "active", "sold", "rented", "archived"]).optional(),
  property_type: z.enum(["apartment", "house", "villa", "plot", "commercial", "pg"]).optional(),
  transaction_type: z.enum(["sale", "rent", "lease"]).optional(),
  city: z.string().optional(),
  created_by: z.string().optional(),
  search: z.string().optional(),
});

export type ListingFilters = z.infer<typeof listingFilterSchema>;

// ─── Lead Form Schema ───────────────────────────────────────────────

export const leadFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  whatsapp_number: z.string().optional(),
  source: z.enum([
    "website", "whatsapp", "phone", "walkin",
    "referral", "99acres", "magicbricks", "housing", "other",
  ]),
  interested_in: z.string().optional(),
  budget_min: z.number().min(0).optional(),
  budget_max: z.number().min(0).optional(),
  preferred_location: z.string().optional(),
  preferred_property_type: z.string().optional(),
  status: z.enum([
    "new", "contacted", "interested", "site_visit",
    "negotiation", "converted", "lost",
  ]),
  assigned_to: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  next_followup_at: z.string().optional(),
  followup_notes: z.string().optional(),
  lost_reason: z.string().optional(),
});

export type LeadFormData = z.infer<typeof leadFormSchema>;

// ─── Lead Filter Schema ─────────────────────────────────────────────

export const leadFilterSchema = z.object({
  status: z.enum([
    "new", "contacted", "interested", "site_visit",
    "negotiation", "converted", "lost",
  ]).optional(),
  source: z.enum([
    "website", "whatsapp", "phone", "walkin",
    "referral", "99acres", "magicbricks", "housing", "other",
  ]).optional(),
  assigned_to: z.string().optional(),
  search: z.string().optional(),
});

export type LeadFilters = z.infer<typeof leadFilterSchema>;

// ─── AI Lead Scoring Schemas ────────────────────────────────────────

export const scoreLeadRequestSchema = z.object({
  name: z.string(),
  source: z.string(),
  budget_min: z.number().optional(),
  budget_max: z.number().optional(),
  listing_title: z.string().optional(),
  listing_price: z.number().optional(),
  preferred_location: z.string().optional(),
  days_ago: z.number(),
  contact_count: z.number(),
  days_since_response: z.number().optional(),
  current_status: z.string(),
});

export type ScoreLeadRequest = z.infer<typeof scoreLeadRequestSchema>;

export const aiLeadScoreSchema = z.object({
  score: z.number().min(0).max(100),
  reason: z.string(),
  recommended_action: z.string(),
});

export type AILeadScore = z.infer<typeof aiLeadScoreSchema>;

// ─── Lead Activity Schema ───────────────────────────────────────────

export const leadActivitySchema = z.object({
  lead_id: z.string(),
  type: z.enum([
    "call", "email", "whatsapp", "site_visit",
    "note", "status_change", "score_update",
  ]),
  description: z.string().min(1, "Description is required"),
  old_value: z.string().optional(),
  new_value: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type LeadActivityFormData = z.infer<typeof leadActivitySchema>;

// ─── WhatsApp Message Schemas ──────────────────────────────────────

export const sendMessageSchema = z.object({
  lead_id: z.string().min(1, "Lead is required"),
  content: z.string().min(1, "Message cannot be empty"),
  message_type: z.enum(["text", "template", "image", "document"]),
  template_name: z.string().optional(),
  media_url: z.string().url("Invalid media URL").optional(),
});

export type SendMessageFormData = z.infer<typeof sendMessageSchema>;

export const messageFilterSchema = z.object({
  search: z.string().optional(),
  direction: z.enum(["inbound", "outbound"]).optional(),
});

export type MessageFilters = z.infer<typeof messageFilterSchema>;

// ─── Billing Schemas ───────────────────────────────────────────────

export const checkoutSchema = z.object({
  plan: z.enum(["pro", "business"]),
  billing_cycle: z.enum(["monthly", "annual"]),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;

export const cancelSubscriptionSchema = z.object({
  reason: z.string().optional(),
});

export type CancelSubscriptionData = z.infer<typeof cancelSubscriptionSchema>;

export const verifyPaymentSchema = z.object({
  razorpay_payment_id: z.string(),
  razorpay_subscription_id: z.string(),
  razorpay_signature: z.string(),
});

export type VerifyPaymentData = z.infer<typeof verifyPaymentSchema>;

// ─── Analytics Schemas ─────────────────────────────────────────────

export const analyticsFilterSchema = z.object({
  period: z.enum(["7d", "30d", "60d", "90d"]),
});

export type AnalyticsFilters = z.infer<typeof analyticsFilterSchema>;

// ─── AI Smart Reply Schemas ──────────────────────────────────────

export const smartReplyRequestSchema = z.object({
  lead_name: z.string(),
  lead_status: z.string(),
  lead_budget: z.string().optional(),
  lead_preferences: z.string().optional(),
  recent_messages: z.array(z.object({
    direction: z.enum(["inbound", "outbound"]),
    content: z.string(),
  })),
});

export type SmartReplyRequest = z.infer<typeof smartReplyRequestSchema>;

export const smartReplyResponseSchema = z.object({
  suggestions: z.array(z.string()).min(1).max(3),
});

export type SmartReplyResponse = z.infer<typeof smartReplyResponseSchema>;

// ─── AI Property Matcher Schemas ─────────────────────────────────

export const matchListingsRequestSchema = z.object({
  lead_budget_min: z.number().optional(),
  lead_budget_max: z.number().optional(),
  lead_location: z.string().optional(),
  lead_property_type: z.string().optional(),
  lead_notes: z.string().optional(),
  listings: z.array(z.object({
    id: z.string(),
    title: z.string(),
    price: z.number(),
    city: z.string(),
    property_type: z.string(),
    bedrooms: z.number().nullable(),
    area_sqft: z.number().nullable(),
    transaction_type: z.string(),
  })),
});

export type MatchListingsRequest = z.infer<typeof matchListingsRequestSchema>;

export const matchListingsResponseSchema = z.object({
  matches: z.array(z.object({
    listing_id: z.string(),
    match_score: z.number().min(0).max(100),
    reason: z.string(),
  })),
});

export type MatchListingsResponse = z.infer<typeof matchListingsResponseSchema>;

// ─── AI Follow-Up Suggestions Schemas ────────────────────────────

export const followUpRequestSchema = z.object({
  lead_name: z.string(),
  status: z.string(),
  days_since_creation: z.number(),
  last_contacted_days_ago: z.number().optional(),
  contact_count: z.number(),
  has_whatsapp: z.boolean(),
  budget_range: z.string().optional(),
  ai_score: z.number().optional(),
  notes: z.string().optional(),
});

export type FollowUpRequest = z.infer<typeof followUpRequestSchema>;

export const followUpResponseSchema = z.object({
  best_time: z.string(),
  channel: z.string(),
  talking_points: z.array(z.string()),
  urgency: z.enum(["high", "medium", "low"]),
});

export type FollowUpResponse = z.infer<typeof followUpResponseSchema>;

// ─── AI Listing Optimizer Schemas ────────────────────────────────

export const optimizeListingRequestSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  price: z.number(),
  property_type: z.string(),
  city: z.string(),
  bedrooms: z.number().optional(),
  area_sqft: z.number().optional(),
  views_count: z.number(),
  inquiries_count: z.number(),
  days_active: z.number(),
  amenities: z.array(z.string()).optional(),
});

export type OptimizeListingRequest = z.infer<typeof optimizeListingRequestSchema>;

export const optimizeListingResponseSchema = z.object({
  score: z.number().min(1).max(10),
  suggestions: z.array(z.object({
    area: z.string(),
    current: z.string(),
    suggested: z.string(),
    impact: z.enum(["high", "medium", "low"]),
  })),
});

export type OptimizeListingResponse = z.infer<typeof optimizeListingResponseSchema>;
