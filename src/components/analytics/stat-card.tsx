"use client";

import { ArrowUpRight, ArrowDownRight, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
}

function StatCard({ title, value, change, changeType = "neutral", icon: Icon, iconBg, iconColor }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-slate-500">{title}</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
            {change && (
              <div className="mt-2 flex items-center gap-1">
                {changeType === "positive" ? (
                  <ArrowUpRight className="h-3.5 w-3.5 text-success-500" />
                ) : changeType === "negative" ? (
                  <ArrowDownRight className="h-3.5 w-3.5 text-danger-500" />
                ) : null}
                <span
                  className={`text-xs font-medium ${
                    changeType === "positive"
                      ? "text-success-500"
                      : changeType === "negative"
                        ? "text-danger-500"
                        : "text-slate-500"
                  }`}
                >
                  {change}
                </span>
              </div>
            )}
          </div>
          <div className={`rounded-lg p-2.5 ${iconBg}`}>
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export { StatCard };
