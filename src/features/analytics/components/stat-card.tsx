"use client";

import { ArrowUpRight, ArrowDownRight, Minus, type LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  accent?: "violet" | "emerald" | "amber" | "sky";
  // legacy props — kept for backward compat, ignored visually
  iconBg?: string;
  iconColor?: string;
}

const accents = {
  violet: { bar: "bg-primary-500",  icon: "bg-primary-50 text-primary-600" },
  emerald: { bar: "bg-success-500", icon: "bg-success-50 text-success-600" },
  amber:   { bar: "bg-warning-500", icon: "bg-warning-50 text-warning-600" },
  sky:     { bar: "bg-info-500",    icon: "bg-info-50 text-info-600" },
} as const;

function StatCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  accent = "violet",
}: StatCardProps) {
  const a = accents[accent];

  return (
    <div className="relative overflow-hidden rounded-xl bg-white border border-slate-200/80 shadow-[0_1px_4px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]">
      {/* top accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-[3px] ${a.bar}`} />

      <div className="p-5 pt-6">
        {/* label + icon row */}
        <div className="flex items-start justify-between mb-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
            {title}
          </p>
          <div className={`rounded-lg p-2 ${a.icon}`}>
            <Icon className="h-4 w-4" />
          </div>
        </div>

        {/* value */}
        <p className="text-[2rem] font-bold tracking-tight text-slate-900 tabular-nums leading-none">
          {value}
        </p>

        {/* trend */}
        {change && (
          <div className="mt-2.5 flex items-center gap-1.5">
            {changeType === "positive" && (
              <ArrowUpRight className="h-3.5 w-3.5 text-success-500 shrink-0" />
            )}
            {changeType === "negative" && (
              <ArrowDownRight className="h-3.5 w-3.5 text-danger-500 shrink-0" />
            )}
            {changeType === "neutral" && (
              <Minus className="h-3 w-3 text-slate-300 shrink-0" />
            )}
            <span
              className={`text-xs font-medium ${
                changeType === "positive"
                  ? "text-success-600"
                  : changeType === "negative"
                    ? "text-danger-600"
                    : "text-slate-400"
              }`}
            >
              {change}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export { StatCard };
