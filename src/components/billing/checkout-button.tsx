"use client";

import { useEffect, useCallback } from "react";
import { useCreateCheckout, useVerifyPayment } from "@/hooks/use-billing";
import { useNotificationStore } from "@/stores/notification-store";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, callback: () => void) => void;
    };
  }
}

interface CheckoutButtonProps {
  plan: "pro" | "business";
  billingCycle: "monthly" | "annual";
  onClose: () => void;
}

function CheckoutButton({ plan, billingCycle, onClose }: CheckoutButtonProps) {
  const checkoutMutation = useCreateCheckout();
  const verifyMutation = useVerifyPayment();
  const addToast = useNotificationStore((s) => s.addToast);

  const initiateCheckout = useCallback(async () => {
    try {
      const data = await checkoutMutation.mutateAsync({
        plan,
        billing_cycle: billingCycle,
      });

      if (!window.Razorpay) {
        addToast({ type: "error", title: "Razorpay not loaded" });
        onClose();
        return;
      }

      const razorpay = new window.Razorpay({
        key: data.key_id,
        subscription_id: data.subscription_id,
        name: data.name,
        description: data.description,
        currency: data.currency,
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_subscription_id: string;
          razorpay_signature: string;
        }) => {
          await verifyMutation.mutateAsync({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_subscription_id: response.razorpay_subscription_id,
            razorpay_signature: response.razorpay_signature,
          });
          onClose();
        },
        modal: {
          ondismiss: () => {
            onClose();
          },
        },
        theme: {
          color: "#2563eb",
        },
      });

      razorpay.open();
    } catch {
      onClose();
    }
  }, [plan, billingCycle, onClose, addToast, checkoutMutation, verifyMutation]);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      initiateCheckout();
    };

    return () => {
      document.body.removeChild(script);
    };
  }, [initiateCheckout]);

  return null;
}

export { CheckoutButton };
