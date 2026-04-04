"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/utils";

interface PlanCardProps {
  name: string;
  description: string;
  priceMonthly: number;
  priceAnnual: number;
  currency?: "INR" | "USD";
  features: readonly string[];
  isCurrentPlan: boolean;
  isPopular?: boolean;
  isAnnual: boolean;
  onSelect: () => void;
  isLoading?: boolean;
}

function PlanCard({
  name,
  description,
  priceMonthly,
  priceAnnual,
  currency = "INR",
  features,
  isCurrentPlan,
  isPopular,
  isAnnual,
  onSelect,
  isLoading,
}: PlanCardProps) {
  const isEnterprise = priceMonthly === -1;
  const isFree = priceMonthly === 0;

  function displayPrice(amount: number) {
    if (currency === "USD") return `$${amount}`;
    return formatPrice(amount);
  }

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-xl border-2 bg-white p-6 transition-all",
        isPopular ? "border-primary-500 shadow-lg shadow-primary-500/10" : "border-slate-200",
        isCurrentPlan && "border-success-400 bg-success-50/30"
      )}
    >
      {isPopular && !isCurrentPlan && (
        <Badge variant="primary" size="sm" className="absolute -top-2.5 right-4">
          Popular
        </Badge>
      )}
      {isCurrentPlan && (
        <Badge variant="success" size="sm" className="absolute -top-2.5 right-4">
          Current Plan
        </Badge>
      )}

      <h3 className="text-lg font-bold text-slate-900">{name}</h3>
      <p className="mt-1 text-sm text-slate-500">{description}</p>

      <div className="mt-4">
        {isEnterprise ? (
          <p className="text-2xl font-bold text-slate-900">Custom</p>
        ) : isFree ? (
          <p className="text-2xl font-bold text-slate-900">Free</p>
        ) : (
          <div>
            <span className="text-3xl font-bold text-slate-900 tabular-nums">
              {displayPrice(isAnnual ? Math.round(priceAnnual / 12) : priceMonthly)}
            </span>
            <span className="text-sm text-slate-500">/month</span>
            {isAnnual && priceAnnual > 0 && (
              <p className="mt-0.5 text-xs text-slate-400">
                {displayPrice(priceAnnual)}/year (save 20%)
              </p>
            )}
          </div>
        )}
      </div>

      <ul className="mt-6 flex-1 space-y-2.5">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-success-500" />
            <span className="text-sm text-slate-600">{feature}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6">
        {isCurrentPlan ? (
          <Button variant="outline" className="w-full" disabled>
            Current Plan
          </Button>
        ) : isEnterprise ? (
          <Button variant="outline" className="w-full" onClick={onSelect}>
            Contact Sales
          </Button>
        ) : isFree ? (
          <Button variant="outline" className="w-full" disabled>
            Free Forever
          </Button>
        ) : (
          <Button
            className="w-full"
            onClick={onSelect}
            isLoading={isLoading}
            disabled={isLoading}
          >
            Upgrade to {name}
          </Button>
        )}
      </div>
    </div>
  );
}

export { PlanCard };
