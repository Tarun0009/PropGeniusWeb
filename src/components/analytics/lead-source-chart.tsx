"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import type { ChartDataPoint } from "@/types/analytics";

const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#6366f1", "#06b6d4", "#f97316", "#8b5cf6", "#ec4899"];

interface LeadSourceChartProps {
  data: ChartDataPoint[];
  isLoading: boolean;
}

function LeadSourceChart({ data, isLoading }: LeadSourceChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Leads by Source</CardTitle>
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
          <ResponsiveContainer width="100%" height={264}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
              >
                {data.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: 11 }}
                iconSize={8}
                iconType="circle"
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

export { LeadSourceChart };
