"use client";

import { useState } from "react";
import { PlanCard } from "./plan-card";
import { CheckoutButton } from "./checkout-button";
import { SUBSCRIPTION_PLANS } from "@/lib/constants";
import type { SubscriptionPlan } from "@/types/subscription";

interface PlanSelectorProps {
  currentPlan: SubscriptionPlan;
}

function PlanSelector({ currentPlan }: PlanSelectorProps) {
  const [isAnnual, setIsAnnual] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  return (
    <div>
      {/* Billing Toggle */}
      <div className="mb-6 flex items-center justify-center gap-3">
        <span className={`text-sm font-medium ${!isAnnual ? "text-slate-900" : "text-slate-500"}`}>
          Monthly
        </span>
        <button
          onClick={() => setIsAnnual(!isAnnual)}
          className={`relative h-6 w-11 rounded-full transition-colors ${
            isAnnual ? "bg-primary-500" : "bg-slate-300"
          }`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
              isAnnual ? "translate-x-5.5" : "translate-x-0.5"
            }`}
          />
        </button>
        <span className={`text-sm font-medium ${isAnnual ? "text-slate-900" : "text-slate-500"}`}>
          Annual
          <span className="ml-1 text-xs text-success-500">(Save 20%)</span>
        </span>
      </div>

      {/* Plan Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SUBSCRIPTION_PLANS.map((plan) => (
          <PlanCard
            key={plan.id}
            name={plan.name}
            description={plan.description}
            priceMonthly={plan.price_monthly}
            priceAnnual={plan.price_annual}
            features={plan.features}
            isCurrentPlan={currentPlan === plan.id}
            isPopular={"popular" in plan && !!plan.popular}
            isAnnual={isAnnual}
            onSelect={() => setSelectedPlan(plan.id)}
          />
        ))}
      </div>

      {/* Checkout Button (hidden, triggered by plan selection) */}
      {selectedPlan && selectedPlan !== "free" && selectedPlan !== "enterprise" && (
        <CheckoutButton
          plan={selectedPlan as "pro" | "business"}
          billingCycle={isAnnual ? "annual" : "monthly"}
          onClose={() => setSelectedPlan(null)}
        />
      )}
    </div>
  );
}

export { PlanSelector };
