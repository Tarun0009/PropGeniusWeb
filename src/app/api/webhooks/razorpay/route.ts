import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { PLAN_LIMITS } from "@/lib/constants";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-razorpay-signature") || "";

    // Verify webhook signature
    if (!verifyWebhookSignature(body, signature)) {
      console.error("Invalid Razorpay webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }

    const event = JSON.parse(body);
    const supabase = createAdminClient();

    switch (event.event) {
      case "subscription.activated": {
        const subscription = event.payload.subscription.entity;
        await supabase
          .from("subscriptions")
          .update({
            status: "active",
            current_period_start: new Date(subscription.current_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_end * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("razorpay_subscription_id", subscription.id);
        break;
      }

      case "subscription.cancelled": {
        const subscription = event.payload.subscription.entity;
        const now = new Date().toISOString();

        await supabase
          .from("subscriptions")
          .update({
            status: "cancelled",
            cancelled_at: now,
            updated_at: now,
          })
          .eq("razorpay_subscription_id", subscription.id);

        // Find the org and downgrade to free
        const { data: sub } = await supabase
          .from("subscriptions")
          .select("organization_id")
          .eq("razorpay_subscription_id", subscription.id)
          .single();

        if (sub) {
          await supabase
            .from("organizations")
            .update({
              plan: "free",
              razorpay_subscription_id: null,
              max_listings: PLAN_LIMITS.free.maxListings,
              max_leads: PLAN_LIMITS.free.maxLeads,
              max_agents: PLAN_LIMITS.free.maxAgents,
              updated_at: now,
            })
            .eq("id", sub.organization_id);
        }
        break;
      }

      case "payment.captured": {
        const payment = event.payload.payment.entity;
        if (payment.method === "subscription") {
          await supabase
            .from("subscriptions")
            .update({
              razorpay_payment_id: payment.id,
              updated_at: new Date().toISOString(),
            })
            .eq("razorpay_subscription_id", payment.subscription_id);
        }
        break;
      }

      case "payment.failed": {
        const payment = event.payload.payment.entity;
        console.error("Payment failed:", payment.id, payment.error_description);
        break;
      }

      default:
        console.log("Unhandled Razorpay event:", event.event);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Razorpay webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
