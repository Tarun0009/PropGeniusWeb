import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cancelSubscriptionSchema } from "@/lib/validations";
import { cancelRazorpaySubscription } from "@/lib/razorpay";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = cancelSubscriptionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("organization_id")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 400 });
    }

    // Get active subscription
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("organization_id", profile.organization_id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!subscription) {
      return NextResponse.json({ error: "No active subscription" }, { status: 400 });
    }

    // Cancel in Razorpay if subscription exists
    if (subscription.razorpay_subscription_id) {
      try {
        await cancelRazorpaySubscription(subscription.razorpay_subscription_id);
      } catch (err) {
        console.error("Razorpay cancellation error:", err);
        // Continue with DB update even if Razorpay fails
      }
    }

    const now = new Date().toISOString();

    // Update subscription status
    await supabase
      .from("subscriptions")
      .update({
        status: "cancelled",
        cancelled_at: now,
        updated_at: now,
      })
      .eq("id", subscription.id);

    // Downgrade organization to free
    await supabase
      .from("organizations")
      .update({
        plan: "free",
        razorpay_subscription_id: null,
        max_listings: 5,
        max_leads: 50,
        max_agents: 1,
        updated_at: now,
      })
      .eq("id", profile.organization_id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cancel subscription error:", error);
    return NextResponse.json(
      { error: "Failed to cancel subscription" },
      { status: 500 }
    );
  }
}
