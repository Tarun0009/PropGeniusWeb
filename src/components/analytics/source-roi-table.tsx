"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import type { SourceROI } from "@/types/analytics";

interface SourceROITableProps {
  data: SourceROI[];
  isLoading: boolean;
}

function SourceROITable({ data, isLoading }: SourceROITableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Source ROI</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Spinner />
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-64 items-center justify-center">
            <p className="text-sm text-slate-400">No data yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="pb-2 text-left font-medium text-slate-500">Source</th>
                  <th className="pb-2 text-right font-medium text-slate-500">Leads</th>
                  <th className="pb-2 text-right font-medium text-slate-500">Converted</th>
                  <th className="pb-2 text-right font-medium text-slate-500">Rate</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item) => (
                  <tr key={item.source} className="border-b border-slate-100 last:border-0">
                    <td className="py-2.5 font-medium text-slate-900">{item.source}</td>
                    <td className="py-2.5 text-right text-slate-600">{item.totalLeads}</td>
                    <td className="py-2.5 text-right text-slate-600">{item.convertedLeads}</td>
                    <td className="py-2.5 text-right">
                      <Badge
                        variant={
                          item.conversionRate >= 30
                            ? "success"
                            : item.conversionRate >= 15
                              ? "warning"
                              : "default"
                        }
                      >
                        {item.conversionRate}%
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export { SourceROITable };
