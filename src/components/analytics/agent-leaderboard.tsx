"use client";

import { Trophy, Landmark, Contact, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useTeamMembers } from "@/hooks/use-team";
import { useTeamMemberStats } from "@/hooks/use-team-stats";

const medalColors = ["text-amber-500", "text-slate-400", "text-orange-400"];
const medalLabels = ["🥇", "🥈", "🥉"];

export function AgentLeaderboard() {
  const { data: members = [], isLoading: membersLoading } = useTeamMembers();
  const { data: statsMap, isLoading: statsLoading } = useTeamMemberStats();

  const isLoading = membersLoading || statsLoading;

  const ranked = [...members]
    .map((m) => ({
      ...m,
      stats: statsMap?.get(m.id) ?? { listingsCreated: 0, leadsAssigned: 0, leadsConverted: 0 },
    }))
    .sort((a, b) => {
      const scoreA = a.stats.leadsConverted * 3 + a.stats.leadsAssigned + a.stats.listingsCreated;
      const scoreB = b.stats.leadsConverted * 3 + b.stats.leadsAssigned + b.stats.listingsCreated;
      return scoreB - scoreA;
    });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-amber-500" />
          <CardTitle className="text-[15px]">Agent Leaderboard</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="divide-y divide-slate-100">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton variant="circular" className="h-9 w-9 shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            ))}
          </div>
        ) : ranked.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-slate-400">
            No team members yet
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {ranked.map((member, idx) => {
              const convRate = member.stats.leadsAssigned > 0
                ? Math.round((member.stats.leadsConverted / member.stats.leadsAssigned) * 100)
                : 0;

              return (
                <div key={member.id} className="flex items-center gap-4 px-5 py-4">
                  {/* Rank */}
                  <div className="w-6 shrink-0 text-center">
                    {idx < 3 ? (
                      <span className="text-base">{medalLabels[idx]}</span>
                    ) : (
                      <span className="text-sm font-semibold text-slate-400">#{idx + 1}</span>
                    )}
                  </div>

                  <Avatar name={member.full_name} size="sm" className="shrink-0" />

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">{member.full_name}</p>
                    <div className="mt-1 flex items-center gap-3 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Landmark className="h-3 w-3" />
                        {member.stats.listingsCreated} listings
                      </span>
                      <span className="flex items-center gap-1">
                        <Contact className="h-3 w-3" />
                        {member.stats.leadsAssigned} leads
                      </span>
                      <span className="flex items-center gap-1 text-success-600 font-medium">
                        <TrendingUp className="h-3 w-3" />
                        {member.stats.leadsConverted} converted
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <Badge
                      variant={convRate >= 20 ? "success" : convRate >= 10 ? "warning" : "default"}
                      size="sm"
                    >
                      {convRate}% rate
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
