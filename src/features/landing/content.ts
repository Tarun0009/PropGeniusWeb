import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Building2,
  CalendarClock,
  FileText,
  KanbanSquare,
  MapPinned,
  MessageCircle,
  UserCheck,
  Users,
} from "lucide-react";

export interface LandingStep {
  number: string;
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface LandingFeature {
  icon: LucideIcon;
  title: string;
  description: string;
  accent: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export const WORKFLOW_STEPS: LandingStep[] = [
  {
    number: "01",
    icon: FileText,
    title: "Publish clearer listings",
    description:
      "Turn property details into complete listing copy, highlights, portal-ready fields, and follow-up notes without jumping between tools.",
  },
  {
    number: "02",
    icon: UserCheck,
    title: "Work the right leads first",
    description:
      "Import leads, spot budget and location fit, assign owners, and keep every conversation tied to the same buyer profile.",
  },
  {
    number: "03",
    icon: MessageCircle,
    title: "Follow up from one inbox",
    description:
      "Send WhatsApp messages, log activity, schedule next steps, and keep managers clear on what is moving toward a visit or close.",
  },
];

export const FEATURE_CARDS: LandingFeature[] = [
  {
    icon: Building2,
    title: "Listing workspace",
    description:
      "Create polished property pages with prices, photos, amenities, highlights, SEO fields, and shareable public links.",
    accent: "bg-primary-50 text-primary-600",
  },
  {
    icon: KanbanSquare,
    title: "Lead pipeline",
    description:
      "Move buyers through new, contacted, interested, site visit, negotiation, converted, and lost stages with full history.",
    accent: "bg-sky-50 text-sky-600",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp follow-up",
    description:
      "Use message templates, reply suggestions, read status, and activity logs from the same place your team manages leads.",
    accent: "bg-emerald-50 text-emerald-600",
  },
  {
    icon: MapPinned,
    title: "Listing matches",
    description:
      "Shortlist the best-fit properties for each buyer based on budget, city, property type, and stated preferences.",
    accent: "bg-amber-50 text-amber-600",
  },
  {
    icon: CalendarClock,
    title: "Follow-up planner",
    description:
      "Track next follow-up dates, notes, reminders, and lost reasons so active opportunities do not go quiet.",
    accent: "bg-violet-50 text-violet-600",
  },
  {
    icon: BarChart3,
    title: "Performance reporting",
    description:
      "Review listing views, inquiries, lead sources, conversion rate, pipeline value, and team performance from one dashboard.",
    accent: "bg-cyan-50 text-cyan-600",
  },
];

export const PIPELINE_FEATURES = [
  "Drag-and-drop lead stages",
  "Owner assignment for every buyer",
  "Timeline notes, calls, and WhatsApp history",
  "CSV import from real estate portals",
  "Budget, source, and status filters",
];

export const MESSAGING_FEATURES = [
  "Two-way WhatsApp messaging",
  "Reusable templates for common replies",
  "Conversation history on each lead",
  "Browser and email notifications",
  "Follow-up notes after every exchange",
];

export const OPERATIONS = [
  { label: "Listings", value: "Active inventory", icon: Building2 },
  { label: "Leads", value: "Prioritized follow-ups", icon: Users },
  { label: "Visits", value: "Next actions scheduled", icon: CalendarClock },
  { label: "Revenue", value: "Pipeline value visible", icon: BarChart3 },
];

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: "What is PropGenius?",
    answer:
      "PropGenius is a real estate CRM for Indian agents and agencies. It brings listings, leads, WhatsApp conversations, team work, billing, and reporting into one workspace.",
  },
  {
    question: "Can I create listing copy inside the app?",
    answer:
      "Yes. Add the property basics once and PropGenius helps you prepare titles, descriptions, highlights, and shareable listing pages that your team can edit before publishing.",
  },
  {
    question: "Is there a free plan?",
    answer:
      "Yes. The Starter plan includes listing creation, lead management, and core CRM features. You can upgrade when your inventory, team, or WhatsApp workflow grows.",
  },
  {
    question: "Can I import leads from property portals?",
    answer:
      "Yes. You can import CSV leads from portals such as 99acres, MagicBricks, Housing.com, and NoBroker, then deduplicate and manage them in the pipeline.",
  },
  {
    question: "How does WhatsApp work?",
    answer:
      "PropGenius connects to WhatsApp Business through Twilio. Your team can send and receive messages, use templates, and keep the conversation attached to each lead record.",
  },
  {
    question: "Can I use PropGenius with my team?",
    answer:
      "Yes. Owners and admins can invite agents, assign leads, manage roles, and review each team member's activity and performance from the settings and analytics areas.",
  },
  {
    question: "Is client data protected?",
    answer:
      "Yes. The app uses Supabase with row-level security policies for organization isolation, encrypted transport, and role-based access for team members.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes. Subscriptions can be cancelled from settings. Your account stays active until the end of the billing period, and your data remains available in your workspace.",
  },
];