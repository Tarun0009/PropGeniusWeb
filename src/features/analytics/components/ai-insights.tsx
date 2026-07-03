"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Sparkles, Lightbulb } from "lucide-react";

interface AIInsightsProps {
  stats:
    | {
        totalListings: number;
        activeListings: number;
        totalLeads: number;
        hotLeads: number;
        conversionRate: number;
        listingsThisMonth: number;
      }
    | undefined;
  sourceData: { name: string; value: number }[];
  funnelData: { status: string; count: number; percentage: number }[];
  isLoading: boolean;
}

function generateInsights(
  stats: NonNullable<AIInsightsProps["stats"]>,
  sourceData: AIInsightsProps["sourceData"],
  funnelData: AIInsightsProps["funnelData"]
): string[] {
  const insights: string[] = [];

  // 1. Top lead source insight
  if (sourceData.length > 0) {
    const totalSourceLeads = sourceData.reduce((sum, s) => sum + s.value, 0);
    const topSource = [...sourceData].sort((a, b) => b.value - a.value)[0];
    if (totalSourceLeads > 0) {
      const pct = Math.round((topSource.value / totalSourceLeads) * 100);
      insights.push(
        `${topSource.name} brings in ${pct}% of your leads — your best-performing channel.`
      );
    }
  }

  // 2. Conversion rate insight
  if (stats.totalLeads > 0) {
    const rate = stats.conversionRate;
    if (rate >= 15) {
      insights.push(
        `Your ${rate}% conversion rate is excellent! Keep doing what you're doing.`
      );
    } else if (rate >= 8) {
      insights.push(
        `Your ${rate}% conversion rate is solid. Focus on moving Interested leads to Site Visits.`
      );
    } else if (rate > 0) {
      insights.push(
        `Your ${rate}% conversion rate has room for improvement. Try faster follow-ups with new leads.`
      );
    } else {
      insights.push(
        "No conversions yet. Prioritize following up with your hottest leads to close your first deal."
      );
    }
  }

  // 3. Hot leads insight
  if (stats.hotLeads > 0) {
    insights.push(
      `You have ${stats.hotLeads} hot lead${stats.hotLeads === 1 ? "" : "s"} right now. Prioritize following up with them today.`
    );
  }

  // 4. Funnel bottleneck insight
  if (funnelData.length >= 2) {
    let biggestDropIdx = -1;
    let biggestDrop = 0;

    for (let i = 0; i < funnelData.length - 1; i++) {
      const current = funnelData[i].count;
      const next = funnelData[i + 1].count;
      if (current > 0) {
        const dropPct = Math.round(((current - next) / current) * 100);
        if (dropPct > biggestDrop) {
          biggestDrop = dropPct;
          biggestDropIdx = i;
        }
      }
    }

    if (biggestDropIdx >= 0 && biggestDrop > 20) {
      const from = funnelData[biggestDropIdx].status;
      const to = funnelData[biggestDropIdx + 1].status;
      insights.push(
        `${biggestDrop}% of leads drop off between ${from} and ${to}. Consider improving your follow-up at this stage.`
      );
    }
  }

  // 5. Listing activity insight
  if (stats.listingsThisMonth > 0) {
    insights.push(
      `You created ${stats.listingsThisMonth} listing${stats.listingsThisMonth === 1 ? "" : "s"} this month. Keep it up!`
    );
  } else if (stats.totalListings > 0) {
    insights.push(
      "You haven't created any listings this month. Adding fresh listings helps attract new leads."
    );
  }

  return insights;
}

export function AIInsights({
  stats,
  sourceData,
  funnelData,
  isLoading,
}: AIInsightsProps) {
  const insights = useMemo(() => {
    if (!stats) return [];
    return generateInsights(stats, sourceData, funnelData);
  }, [stats, sourceData, funnelData]);

  const hasEnoughData =
    stats !== undefined &&
    (stats.totalListings > 0 || stats.totalLeads > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-5 w-5 text-amber-500" />
          AI Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <Spinner />
          </div>
        ) : !hasEnoughData ? (
          <div className="flex h-48 items-center justify-center">
            <p className="text-sm text-slate-400">
              Add more data to unlock insights
            </p>
          </div>
        ) : insights.length === 0 ? (
          <div className="flex h-48 items-center justify-center">
            <p className="text-sm text-slate-400">
              Add more data to unlock insights
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {insights.map((insight, index) => (
              <li
                key={index}
                className="flex items-start gap-3 rounded-lg bg-slate-50 p-3"
              >
                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                <span className="text-sm leading-relaxed text-slate-700">
                  {insight}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
