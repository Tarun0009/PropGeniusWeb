"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import type { LeadFunnelData } from "@/types/analytics";

const FUNNEL_COLORS = [
  "bg-primary-500",
  "bg-purple-500",
  "bg-warning-500",
  "bg-cyan-500",
  "bg-orange-500",
  "bg-success-500",
  "bg-danger-500",
];

interface ConversionFunnelProps {
  data: LeadFunnelData[];
  isLoading: boolean;
}

function ConversionFunnel({ data, isLoading }: ConversionFunnelProps) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Lead Conversion Funnel</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Spinner />
          </div>
        ) : data.every((d) => d.count === 0) ? (
          <div className="flex h-64 items-center justify-center">
            <p className="text-sm text-slate-400">No data yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.map((item, index) => (
              <div key={item.status} className="flex items-center gap-3">
                <div className="w-24 shrink-0 text-right">
                  <p className="text-xs font-medium text-slate-700">{item.status}</p>
                </div>
                <div className="flex-1">
                  <div className="h-7 overflow-hidden rounded-md bg-slate-100">
                    <div
                      className={`h-full rounded-md ${FUNNEL_COLORS[index % FUNNEL_COLORS.length]} transition-all`}
                      style={{ width: `${Math.max((item.count / maxCount) * 100, 2)}%` }}
                    />
                  </div>
                </div>
                <div className="w-16 shrink-0">
                  <span className="text-sm font-semibold text-slate-900">{item.count}</span>
                  <span className="ml-1 text-xs text-slate-400">({item.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export { ConversionFunnel };
