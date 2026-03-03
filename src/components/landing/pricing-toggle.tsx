"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SUBSCRIPTION_PLANS } from "@/lib/constants";

function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <div>
      {/* Toggle */}
      <div className="flex items-center justify-center gap-3">
        <div className="inline-flex items-center rounded-full bg-slate-100 p-1">
          <button
            onClick={() => setIsAnnual(false)}
            className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
              !isAnnual ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setIsAnnual(true)}
            className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
              isAnnual ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
            }`}
          >
            Annual
          </button>
        </div>
        {isAnnual && (
          <Badge variant="success" size="sm">Save 20%</Badge>
        )}
      </div>

      {/* Plan Cards */}
      <div className="mx-auto mt-12 grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {SUBSCRIPTION_PLANS.map((plan) => {
          const isPopular = "popular" in plan && plan.popular;
          const isEnterprise = plan.price_monthly === -1;
          const monthlyPrice = isAnnual
            ? Math.round(plan.price_annual / 12)
            : plan.price_monthly;

          return (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-2xl border bg-white p-8 transition-shadow ${
                isPopular
                  ? "border-2 border-primary-500 shadow-xl shadow-primary-500/10 scale-[1.02] z-10"
                  : "border-slate-200 hover:shadow-lg"
              }`}
            >
              {isPopular && (
                <div className="absolute -top-3 right-6">
                  <Badge variant="primary" size="md">
                    <Zap className="mr-1 h-3 w-3" /> Most Popular
                  </Badge>
                </div>
              )}

              <h3 className="text-lg font-semibold text-slate-900">{plan.name}</h3>
              <p className="mt-1 text-sm text-slate-500">{plan.description}</p>

              <div className="mt-6">
                {isEnterprise ? (
                  <p className="text-3xl font-extrabold text-slate-900">Custom</p>
                ) : monthlyPrice === 0 ? (
                  <p className="text-3xl font-extrabold text-slate-900">
                    Free
                  </p>
                ) : (
                  <div>
                    <p className="text-3xl font-extrabold text-slate-900">
                      ₹{monthlyPrice.toLocaleString("en-IN")}
                      <span className="text-base font-normal text-slate-500">/mo</span>
                    </p>
                    {isAnnual && (
                      <p className="mt-1 text-xs text-slate-400">
                        <span className="line-through">₹{plan.price_monthly.toLocaleString("en-IN")}/mo</span>
                        {" "}billed annually
                      </p>
                    )}
                  </div>
                )}
              </div>

              <ul className="mt-8 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-success-500" />
                    <span className="text-sm text-slate-600">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <Link
                  href={isEnterprise ? "#" : "/signup"}
                  className={`block w-full rounded-xl px-4 py-3 text-center text-sm font-semibold transition-colors ${
                    isPopular
                      ? "bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-600/25"
                      : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400"
                  }`}
                >
                  {isEnterprise
                    ? "Contact Sales"
                    : monthlyPrice === 0
                      ? "Get Started Free"
                      : `Start with ${plan.name}`}
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { PricingSection };
