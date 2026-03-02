"use client";

import { useState } from "react";
import Link from "next/link";
import { Users, Upload } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { Spinner } from "@/components/ui/spinner";
import { LeadTable } from "@/components/leads/lead-table";
import { LeadKanban } from "@/components/leads/lead-kanban";
import { CSVImportModal } from "@/components/leads/csv-import-modal";
import { useLeads } from "@/hooks/use-leads";
import type { LeadFilters } from "@/lib/validations";

const VIEW_TABS = [
  { value: "table", label: "Table" },
  { value: "kanban", label: "Kanban" },
];

export default function LeadsPage() {
  const [view, setView] = useState("table");
  const [filters, setFilters] = useState<LeadFilters>({});
  const [showImport, setShowImport] = useState(false);

  const { data: leads, isLoading } = useLeads(filters);

  return (
    <div>
      <PageHeader
        title="Leads"
        description="Manage and track your leads"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowImport(true)}>
              <Upload className="mr-1.5 h-3.5 w-3.5" />
              Import CSV
            </Button>
            <Link href="/leads/new">
              <Button size="sm">+ Add Lead</Button>
            </Link>
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
              icon={Users}
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
          <LeadTable data={leads} filters={filters} onFiltersChange={setFilters} />
        ) : (
          <LeadKanban leads={leads} />
        )}
      </div>

      {/* CSV Import Modal */}
      <CSVImportModal isOpen={showImport} onClose={() => setShowImport(false)} />
    </div>
  );
}
