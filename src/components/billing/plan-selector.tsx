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
  const [currency, setCurrency] = useState<"INR" | "USD">("INR");
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  return (
    <div>
      {/* Toggles row */}
      <div className="mb-6 flex flex-wrap items-center justify-center gap-4">
        {/* Billing cycle */}
        <div className="flex items-center gap-3">
          <span className={`text-sm font-medium ${!isAnnual ? "text-slate-900" : "text-slate-400"}`}>Monthly</span>
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className={`relative h-6 w-11 rounded-full transition-colors ${isAnnual ? "bg-primary-500" : "bg-slate-300"}`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                isAnnual ? "translate-x-5.5" : "translate-x-0.5"
              }`}
            />
          </button>
          <span className={`text-sm font-medium ${isAnnual ? "text-slate-900" : "text-slate-400"}`}>
            Annual <span className="text-xs text-success-500">(Save 20%)</span>
          </span>
        </div>

        {/* Currency */}
        <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-sm">
          {(["INR", "USD"] as const).map((c) => (
            <button
              key={c}
              onClick={() => setCurrency(c)}
              className={`rounded-md px-3 py-1 font-medium transition-colors ${
                currency === c ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-700"
              }`}
            >
              {c === "INR" ? "₹ INR" : "$ USD"}
            </button>
          ))}
        </div>
      </div>

      {/* Plan Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SUBSCRIPTION_PLANS.map((plan) => (
          <PlanCard
            key={plan.id}
            name={plan.name}
            description={plan.description}
            priceMonthly={currency === "USD" && "price_usd_monthly" in plan ? plan.price_usd_monthly : plan.price_monthly}
            priceAnnual={currency === "USD" && "price_usd_annual" in plan ? plan.price_usd_annual : plan.price_annual}
            currency={currency}
            features={plan.features}
            isCurrentPlan={currentPlan === plan.id}
            isPopular={"popular" in plan && !!plan.popular}
            isAnnual={isAnnual}
            onSelect={() => setSelectedPlan(plan.id)}
          />
        ))}
      </div>

      {/* Checkout Button (hidden, triggered by plan selection) */}
      {selectedPlan && selectedPlan !== "free" && (
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
