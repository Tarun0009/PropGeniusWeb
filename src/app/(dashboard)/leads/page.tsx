"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Contact, Upload, Download, Wand2, Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { Spinner } from "@/components/ui/spinner";
import { LeadTable } from "@/components/leads/lead-table";
import { CSVImportModal } from "@/components/leads/csv-import-modal";
import { useLeads, useScoreLead, useUpdateLead } from "@/hooks/use-leads";
import { useQuota } from "@/hooks/use-quota";
import { useTeamMemberLookup } from "@/hooks/use-team-lookup";
import { useNotificationStore } from "@/stores/notification-store";
import { exportToCSV } from "@/lib/export-csv";
import type { LeadFilters } from "@/lib/validations";
import type { Lead } from "@/types/lead";

const LeadKanban = dynamic(
  () => import("@/components/leads/lead-kanban").then((m) => ({ default: m.LeadKanban })),
  {
    loading: () => (
      <div className="flex min-h-75 items-center justify-center">
        <Spinner size="lg" />
      </div>
    ),
  }
);

const VIEW_TABS = [
  { value: "table", label: "Table" },
  { value: "kanban", label: "Pipeline" },
];

export default function LeadsPage() {
  const [view, setView] = useState("table");
  const [filters, setFilters] = useState<LeadFilters>({});
  const [showImport, setShowImport] = useState(false);
  const [scoringProgress, setScoringProgress] = useState<{ current: number; total: number } | null>(null);

  const { data: leads, isLoading } = useLeads(filters);
  const { data: quota } = useQuota();
  const memberLookup = useTeamMemberLookup();
  const scoreMutation = useScoreLead();
  const updateMutation = useUpdateLead();
  const addToast = useNotificationStore((s) => s.addToast);

  const unscoredLeads = leads?.filter((l) => l.ai_score === 0) || [];

  const handleBulkScore = async () => {
    if (unscoredLeads.length === 0) return;
    setScoringProgress({ current: 0, total: unscoredLeads.length });

    let scored = 0;
    for (const lead of unscoredLeads) {
      try {
        const daysAgo = Math.floor((Date.now() - new Date(lead.created_at).getTime()) / (1000 * 60 * 60 * 24));
        const result = await scoreMutation.mutateAsync({
          name: lead.name,
          source: lead.source,
          budget_min: lead.budget_min ?? undefined,
          budget_max: lead.budget_max ?? undefined,
          preferred_location: lead.preferred_location ?? undefined,
          days_ago: daysAgo,
          contact_count: 0,
          current_status: lead.status,
        });

        await updateMutation.mutateAsync({
          id: lead.id,
          data: {
            ai_score: result.score,
            ai_score_reason: result.reason,
            ai_recommended_action: result.recommended_action,
          } as Record<string, unknown>,
        });
        scored++;
      } catch {
        // Continue scoring remaining leads
      }
      setScoringProgress({ current: scored, total: unscoredLeads.length });
    }

    setScoringProgress(null);
    addToast({ type: "success", title: `Scored ${scored} of ${unscoredLeads.length} leads` });
  };

  return (
    <div>
      <PageHeader
        title="Leads"
        description="Manage and track your leads"
        actions={
          <div className="flex items-center gap-2">
            {leads && leads.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  exportToCSV<Lead>(
                    leads,
                    [
                      { key: "name", header: "Name" },
                      { key: "email", header: "Email" },
                      { key: "phone", header: "Phone" },
                      { key: "whatsapp_number", header: "WhatsApp Number" },
                      { key: "source", header: "Source" },
                      { key: "status", header: "Status" },
                      { key: "budget_min", header: "Budget Min" },
                      { key: "budget_max", header: "Budget Max" },
                      { key: "preferred_location", header: "Preferred Location" },
                      { key: "ai_score", header: "AI Score" },
                      { key: "created_at", header: "Created At" },
                    ],
                    "leads-export"
                  )
                }
              >
                <Download className="mr-1.5 h-3.5 w-3.5" />
                Export CSV
              </Button>
            )}
            {unscoredLeads.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkScore}
                disabled={scoringProgress !== null}
              >
                <Wand2 className="mr-1.5 h-3.5 w-3.5" />
                {scoringProgress
                  ? `Scoring ${scoringProgress.current}/${scoringProgress.total}...`
                  : `AI Score (${unscoredLeads.length})`}
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => setShowImport(true)}>
              <Upload className="mr-1.5 h-3.5 w-3.5" />
              Import CSV
            </Button>
            {quota && !quota.leads.canCreate ? (
              <Link href="/settings">
                <Button size="sm" variant="outline">
                  {quota.leads.current}/{quota.leads.max} Leads — Upgrade
                </Button>
              </Link>
            ) : (
              <Link href="/leads/new">
                <Button size="sm"><Plus className="mr-1.5 h-3.5 w-3.5" />Add Lead</Button>
              </Link>
            )}
          </div>
        }
      />

      {/* View Tabs */}
      <div className="mt-4">
        <Tabs tabs={VIEW_TABS} activeTab={view} onTabChange={setView} />
      </div>

      {/* Content */}
      <div className="mt-4">
        {isLoading ? (
          <div className="flex min-h-75 items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : !leads || leads.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              icon={Contact}
              title="No leads yet"
              description="Add your first lead manually or import from a CSV file."
              action={
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => setShowImport(true)}>
                    Import CSV
                  </Button>
                  <Link href="/leads/new">
                    <Button>Add Lead</Button>
                  </Link>
                </div>
              }
            />
          </div>
        ) : view === "table" ? (
          <LeadTable data={leads} filters={filters} onFiltersChange={setFilters} memberLookup={memberLookup} />
        ) : (
          <LeadKanban leads={leads} />
        )}
      </div>

      {/* CSV Import Modal */}
      <CSVImportModal isOpen={showImport} onClose={() => setShowImport(false)} />
    </div>
  );
}
