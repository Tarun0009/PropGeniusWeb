"use client";

import { Eye, MessageCircle, Clock, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import type { ListingPerformance } from "@/types/analytics";

interface ListingPerformanceCardProps {
  data: ListingPerformance | undefined;
  isLoading: boolean;
}

function ListingPerformanceCard({ data, isLoading }: ListingPerformanceCardProps) {
  const metrics = data
    ? [
        {
          label: "Avg. Days on Market",
          value: data.avgDaysOnMarket,
          suffix: "days",
          icon: Clock,
          color: "text-blue-600 bg-blue-50",
        },
        {
          label: "Avg. Views / Listing",
          value: data.avgViewsPerListing,
          suffix: "",
          icon: Eye,
          color: "text-purple-600 bg-purple-50",
        },
        {
          label: "Avg. Inquiries / Listing",
          value: data.avgInquiriesPerListing,
          suffix: "",
          icon: MessageCircle,
          color: "text-green-600 bg-green-50",
        },
        {
          label: "Total Views",
          value: data.totalViews,
          suffix: "",
          icon: BarChart3,
          color: "text-orange-600 bg-orange-50",
        },
      ]
    : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Listing Performance</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Spinner />
          </div>
        ) : !data ? (
          <div className="flex h-40 items-center justify-center">
            <p className="text-sm text-slate-400">No data yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {metrics.map((m) => (
              <div key={m.label} className="flex items-center gap-3">
                <div className={`rounded-lg p-2 ${m.color}`}>
                  <m.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-900">
                    {m.value}
                    {m.suffix && <span className="ml-1 text-xs font-normal text-slate-500">{m.suffix}</span>}
                  </p>
                  <p className="text-xs text-slate-500">{m.label}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export { ListingPerformanceCard };
