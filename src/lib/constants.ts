export const APP_NAME = "PropGenius AI";
export const APP_DESCRIPTION =
  "AI-Powered Real Estate Listing Generator + CRM";

export const PROPERTY_TYPES = [
  { value: "apartment", label: "Apartment" },
  { value: "house", label: "House" },
  { value: "villa", label: "Villa" },
  { value: "plot", label: "Plot" },
  { value: "commercial", label: "Commercial" },
  { value: "pg", label: "PG / Hostel" },
] as const;

export const TRANSACTION_TYPES = [
  { value: "sale", label: "Sale" },
  { value: "rent", label: "Rent" },
  { value: "lease", label: "Lease" },
] as const;

export const FURNISHING_OPTIONS = [
  { value: "unfurnished", label: "Unfurnished" },
  { value: "semi", label: "Semi-Furnished" },
  { value: "fully", label: "Fully Furnished" },
] as const;

export const LISTING_STATUSES = [
  { value: "draft", label: "Draft" },
  { value: "active", label: "Active" },
  { value: "sold", label: "Sold" },
  { value: "rented", label: "Rented" },
  { value: "archived", label: "Archived" },
] as const;

export const LEAD_STATUSES = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "interested", label: "Interested" },
  { value: "site_visit", label: "Site Visit" },
  { value: "negotiation", label: "Negotiation" },
  { value: "converted", label: "Converted" },
  { value: "lost", label: "Lost" },
] as const;

export const LEAD_SOURCES = [
  { value: "website", label: "Website" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "phone", label: "Phone" },
  { value: "walkin", label: "Walk-in" },
  { value: "referral", label: "Referral" },
  { value: "99acres", label: "99acres" },
  { value: "magicbricks", label: "MagicBricks" },
  { value: "housing", label: "Housing.com" },
  { value: "other", label: "Other" },
] as const;

export const USER_ROLES = [
  { value: "owner", label: "Owner" },
  { value: "admin", label: "Admin" },
  { value: "agent", label: "Agent" },
] as const;

export const PLAN_LIMITS = {
  free: { maxListings: 5, maxLeads: 50, maxAgents: 1 },
  pro: { maxListings: -1, maxLeads: 500, maxAgents: 1 },
  business: { maxListings: -1, maxLeads: -1, maxAgents: 5 },
  enterprise: { maxListings: -1, maxLeads: -1, maxAgents: -1 },
} as const;

export const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { label: "Listings", href: "/listings", icon: "Building2" },
  { label: "Leads", href: "/leads", icon: "Users" },
  { label: "Messages", href: "/messages", icon: "MessageSquare" },
  { label: "Analytics", href: "/analytics", icon: "BarChart3" },
  { label: "Settings", href: "/settings", icon: "Settings" },
] as const;

export const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
  "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim",
  "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand",
  "West Bengal", "Delhi", "Chandigarh",
] as const;

// ─── WhatsApp Templates ────────────────────────────────────────────

export const WHATSAPP_TEMPLATES = [
  {
    name: "greeting",
    label: "Greeting",
    content: "Hello {{name}}! Thank you for your interest. I'm from {{org}}, how can I help you today?",
    variables: ["name", "org"],
  },
  {
    name: "site_visit",
    label: "Site Visit Invitation",
    content: "Hi {{name}}, we'd love to show you {{property}}. Would you be available for a site visit this week? Please let us know your preferred time.",
    variables: ["name", "property"],
  },
  {
    name: "follow_up",
    label: "Follow Up",
    content: "Hi {{name}}, just checking in regarding your interest in {{property}}. Do you have any questions or would you like to schedule a visit?",
    variables: ["name", "property"],
  },
  {
    name: "price_update",
    label: "Price Update",
    content: "Hi {{name}}, great news! The price for {{property}} has been updated to {{price}}. Would you like to discuss further?",
    variables: ["name", "property", "price"],
  },
  {
    name: "thank_you",
    label: "Thank You",
    content: "Thank you {{name}} for visiting {{property}}. We hope you liked it! Please don't hesitate to reach out if you have any questions.",
    variables: ["name", "property"],
  },
] as const;

export type WhatsAppTemplate = (typeof WHATSAPP_TEMPLATES)[number];

// ─── Subscription Plans ────────────────────────────────────────────

export const SUBSCRIPTION_PLANS = [
  {
    id: "free",
    name: "Free",
    description: "Get started with basic features",
    price_monthly: 0,
    price_annual: 0,
    features: [
      "5 AI listings/month",
      "50 leads",
      "Basic CRM",
      "Email support",
    ],
    limits: { maxListings: 5, maxLeads: 50, maxAgents: 1 },
  },
  {
    id: "pro",
    name: "Pro",
    description: "For growing real estate businesses",
    price_monthly: 999,
    price_annual: 9588,
    popular: true,
    features: [
      "Unlimited AI listings",
      "500 leads",
      "WhatsApp integration",
      "AI lead scoring",
      "Priority support",
    ],
    limits: { maxListings: -1, maxLeads: 500, maxAgents: 1 },
  },
  {
    id: "business",
    name: "Business",
    description: "For teams and agencies",
    price_monthly: 2499,
    price_annual: 23988,
    features: [
      "Everything in Pro",
      "Team support (5 agents)",
      "Analytics dashboard",
      "Bulk operations",
      "Custom templates",
    ],
    limits: { maxListings: -1, maxLeads: -1, maxAgents: 5 },
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Custom solutions for large teams",
    price_monthly: -1,
    price_annual: -1,
    features: [
      "Everything in Business",
      "Unlimited agents",
      "API access",
      "Custom branding",
      "Dedicated account manager",
    ],
    limits: { maxListings: -1, maxLeads: -1, maxAgents: -1 },
  },
] as const;

export type SubscriptionPlanId = (typeof SUBSCRIPTION_PLANS)[number]["id"];
