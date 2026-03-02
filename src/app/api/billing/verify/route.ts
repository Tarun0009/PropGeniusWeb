import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifyPaymentSchema } from "@/lib/validations";
import { verifyRazorpayPayment } from "@/lib/razorpay";
import { SUBSCRIPTION_PLANS } from "@/lib/constants";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = verifyPaymentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Verify payment signature
    const isValid = verifyRazorpayPayment(parsed.data);

    if (!isValid) {
      return NextResponse.json(
        { error: "Payment verification failed" },
        { status: 400 }
      );
    }

    // Get user's profile and org
    const { data: profile } = await supabase
      .from("profiles")
      .select("organization_id")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 400 });
    }

    // Determine the plan from the subscription (we'll read it from the request body or lookup)
    // For now, we look at existing pending subscription
    const { data: pendingSub } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("organization_id", profile.organization_id)
      .eq("razorpay_subscription_id", parsed.data.razorpay_subscription_id)
      .single();

    const plan = pendingSub?.plan || "pro";
    const planConfig = SUBSCRIPTION_PLANS.find((p) => p.id === plan);

    // Update subscription record
    const now = new Date();
    const periodEnd = new Date();
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    const { error: subError } = await supabase
      .from("subscriptions")
      .upsert({
        id: pendingSub?.id || undefined,
        organization_id: profile.organization_id,
        razorpay_subscription_id: parsed.data.razorpay_subscription_id,
        razorpay_payment_id: parsed.data.razorpay_payment_id,
        plan,
        status: "active",
        amount: planConfig?.price_monthly || 0,
        currency: "INR",
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString(),
        updated_at: now.toISOString(),
      });

    if (subError) throw subError;

    // Update organization plan
    const { error: orgError } = await supabase
      .from("organizations")
      .update({
        plan,
        razorpay_subscription_id: parsed.data.razorpay_subscription_id,
        max_listings: planConfig?.limits.maxListings ?? 5,
        max_leads: planConfig?.limits.maxLeads ?? 50,
        max_agents: planConfig?.limits.maxAgents ?? 1,
        updated_at: now.toISOString(),
      })
      .eq("id", profile.organization_id);

    if (orgError) throw orgError;

    return NextResponse.json({ success: true, plan });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    );
  }
}
