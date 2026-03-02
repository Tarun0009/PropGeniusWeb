import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkoutSchema } from "@/lib/validations";
import { createRazorpaySubscription } from "@/lib/razorpay";
import { SUBSCRIPTION_PLANS } from "@/lib/constants";

// Razorpay plan IDs — set these in env after creating plans in Razorpay dashboard
const RAZORPAY_PLAN_IDS: Record<string, Record<string, string>> = {
  pro: {
    monthly: process.env.RAZORPAY_PLAN_PRO_MONTHLY || "",
    annual: process.env.RAZORPAY_PLAN_PRO_ANNUAL || "",
  },
  business: {
    monthly: process.env.RAZORPAY_PLAN_BUSINESS_MONTHLY || "",
    annual: process.env.RAZORPAY_PLAN_BUSINESS_ANNUAL || "",
  },
};

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { plan, billing_cycle } = parsed.data;
    const razorpayPlanId = RAZORPAY_PLAN_IDS[plan]?.[billing_cycle];

    if (!razorpayPlanId) {
      return NextResponse.json(
        { error: "Razorpay plan not configured. Please set up Razorpay plans." },
        { status: 400 }
      );
    }

    const planDetails = SUBSCRIPTION_PLANS.find((p) => p.id === plan);
    const amount = billing_cycle === "annual" ? planDetails?.price_annual : planDetails?.price_monthly;

    const subscription = await createRazorpaySubscription({
      planId: razorpayPlanId,
      totalCount: billing_cycle === "annual" ? 1 : 12,
      customerEmail: user.email || "",
    });

    return NextResponse.json({
      subscription_id: subscription.id,
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: (amount || 0) * 100, // Razorpay expects paise
      currency: "INR",
      name: "PropGenius",
      description: `${planDetails?.name} Plan - ${billing_cycle === "annual" ? "Annual" : "Monthly"}`,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
