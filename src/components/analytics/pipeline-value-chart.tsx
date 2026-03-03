"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { formatPrice } from "@/lib/utils";
import type { PipelineValue } from "@/types/analytics";

const STAGE_COLORS = [
  "bg-blue-500",
  "bg-purple-500",
  "bg-yellow-500",
  "bg-cyan-500",
  "bg-orange-500",
  "bg-green-500",
];

interface PipelineValueChartProps {
  data: PipelineValue[];
  isLoading: boolean;
}

function PipelineValueChart({ data, isLoading }: PipelineValueChartProps) {
  const maxValue = Math.max(...data.map((d) => d.totalValue), 1);
  const grandTotal = data.reduce((sum, d) => sum + d.totalValue, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Pipeline Value</CardTitle>
          <span className="text-sm font-semibold text-slate-700">
            Total: {formatPrice(grandTotal)}
          </span>
        </div>
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
                  <p className="text-xs font-medium text-slate-700">{item.label}</p>
                  <p className="text-xs text-slate-400">{item.count} leads</p>
                </div>
                <div className="flex-1">
                  <div className="h-7 overflow-hidden rounded-md bg-slate-100">
                    <div
                      className={`h-full rounded-md ${STAGE_COLORS[index % STAGE_COLORS.length]} transition-all`}
                      style={{ width: `${Math.max((item.totalValue / maxValue) * 100, 2)}%` }}
                    />
                  </div>
                </div>
                <div className="w-20 shrink-0 text-right">
                  <span className="text-sm font-semibold text-slate-900">
                    {formatPrice(item.totalValue)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export { PipelineValueChart };
