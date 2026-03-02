export type SubscriptionPlan = "free" | "pro" | "business" | "enterprise";
export type SubscriptionStatus = "created" | "active" | "paused" | "cancelled" | "expired";

export interface Subscription {
  id: string;
  organization_id: string;
  razorpay_subscription_id: string | null;
  razorpay_payment_id: string | null;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  amount: number | null;
  currency: string;
  current_period_start: string | null;
  current_period_end: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
}
