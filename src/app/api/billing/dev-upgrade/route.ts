import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { SubscriptionPlan } from "@/types/subscription";

// DEV-ONLY: Directly set org plan without Razorpay.
// Only works when NODE_ENV !== "production".
export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { plan } = (await request.json()) as { plan: SubscriptionPlan };
  if (!["free", "pro", "business"].includes(plan)) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .single();

  if (!profile?.organization_id) {
    return NextResponse.json({ error: "No organization found" }, { status: 400 });
  }

  const adminClient = createAdminClient();

  // Upsert subscription record
  const now = new Date().toISOString();
  const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const { error: subError } = await adminClient
    .from("subscriptions")
    .upsert(
      {
        organization_id: profile.organization_id,
        plan,
        status: plan === "free" ? "cancelled" : "active",
        razorpay_subscription_id: `dev_test_${plan}_${Date.now()}`,
        razorpay_payment_id: null,
        amount: plan === "free" ? 0 : plan === "pro" ? 99900 : 249900,
        currency: "INR",
        current_period_start: now,
        current_period_end: plan === "free" ? null : periodEnd,
        cancelled_at: null,
        updated_at: now,
      },
      { onConflict: "organization_id" }
    );

  if (subError) {
    return NextResponse.json({ error: subError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, plan, organization_id: profile.organization_id });
}
