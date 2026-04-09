"use client";

import { useState } from "react";
import { Clock, X } from "lucide-react";
import { PlanCard } from "./plan-card";
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

      {/* Coming Soon notice when plan is selected */}
      {selectedPlan && selectedPlan !== "free" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl text-center">
            <button
              onClick={() => setSelectedPlan(null)}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50">
              <Clock className="h-7 w-7 text-amber-500" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-slate-900">Payment Coming Soon</h3>
            <p className="mb-6 text-sm text-slate-500 leading-relaxed">
              Our payment system is currently being set up. You'll be able to upgrade to{" "}
              <span className="font-semibold text-primary-600 capitalize">{selectedPlan}</span>{" "}
              very soon.
            </p>
            <p className="text-xs text-slate-400">
              In the meantime, use the dev upgrade tool in browser console to test Pro features.
            </p>
            <button
              onClick={() => setSelectedPlan(null)}
              className="mt-6 w-full rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-200 transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export { PlanSelector };
