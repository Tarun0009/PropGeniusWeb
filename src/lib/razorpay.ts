import Razorpay from "razorpay";
import crypto from "crypto";

function getRazorpayClient() {
  return new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });
}

export async function createRazorpaySubscription(params: {
  planId: string;
  totalCount: number;
  customerEmail: string;
  customerPhone?: string;
}) {
  const razorpay = getRazorpayClient();

  const subscription = await razorpay.subscriptions.create({
    plan_id: params.planId,
    total_count: params.totalCount,
    customer_notify: 1,
    notes: {
      email: params.customerEmail,
    },
  });

  return subscription;
}

export async function cancelRazorpaySubscription(subscriptionId: string) {
  const razorpay = getRazorpayClient();
  return razorpay.subscriptions.cancel(subscriptionId);
}

export function verifyRazorpayPayment(params: {
  razorpay_payment_id: string;
  razorpay_subscription_id: string;
  razorpay_signature: string;
}): boolean {
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(`${params.razorpay_payment_id}|${params.razorpay_subscription_id}`)
    .digest("hex");

  return expectedSignature === params.razorpay_signature;
}

export function verifyWebhookSignature(
  body: string,
  signature: string
): boolean {
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(body)
    .digest("hex");

  return expectedSignature === signature;
}
