"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createColumnHelper } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { LeadScoreBadge } from "./lead-score-badge";
import { formatRelativeTime } from "@/lib/utils";
import { LEAD_STATUSES, LEAD_SOURCES } from "@/lib/constants";
import type { Lead } from "@/types/lead";
import type { LeadFilters } from "@/lib/validations";

const statusVariant: Record<string, "primary" | "purple" | "warning" | "cyan" | "orange" | "success" | "danger"> = {
  new: "primary",
  contacted: "purple",
  interested: "warning",
  site_visit: "cyan",
  negotiation: "orange",
  converted: "success",
  lost: "danger",
};

const columnHelper = createColumnHelper<Lead>();

const columns = [
  columnHelper.accessor("name", {
    header: "Name",
    cell: (info) => {
      const lead = info.row.original;
      return (
        <div>
          <p className="font-medium text-slate-900">{info.getValue()}</p>
          {lead.phone && (
            <p className="text-xs text-slate-500">{lead.phone}</p>
          )}
        </div>
      );
    },
  }),
  columnHelper.accessor("source", {
    header: "Source",
    cell: (info) => (
      <span className="text-sm capitalize text-slate-600">
        {LEAD_SOURCES.find((s) => s.value === info.getValue())?.label || info.getValue()}
      </span>
    ),
  }),
  columnHelper.accessor("ai_score", {
    header: "AI Score",
    cell: (info) => {
      const score = info.getValue();
      return score > 0 ? (
        <LeadScoreBadge score={score} size="sm" />
      ) : (
        <span className="text-xs text-slate-400">-</span>
      );
    },
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: (info) => {
      const status = info.getValue();
      const label = LEAD_STATUSES.find((s) => s.value === status)?.label || status;
      return (
        <Badge variant={statusVariant[status] || "default"} size="sm">
          {label}
        </Badge>
      );
    },
  }),
  columnHelper.accessor("next_followup_at", {
    header: "Next Follow-up",
    cell: (info) => {
      const date = info.getValue();
      if (!date) return <span className="text-xs text-slate-400">-</span>;
      const isPast = new Date(date) < new Date();
      return (
        <span className={isPast ? "text-sm text-danger-600 font-medium" : "text-sm text-slate-600"}>
          {formatRelativeTime(date)}
        </span>
      );
    },
  }),
  columnHelper.accessor("created_at", {
    header: "Created",
    cell: (info) => (
      <span className="text-sm text-slate-500">{formatRelativeTime(info.getValue())}</span>
    ),
  }),
];

interface LeadTableProps {
  data: Lead[];
  filters: LeadFilters;
  onFiltersChange: (filters: LeadFilters) => void;
}

function LeadTable({ data, filters, onFiltersChange }: LeadTableProps) {
  const router = useRouter();
  const [search, setSearch] = useState(filters.search || "");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFiltersChange({ ...filters, search: search || undefined });
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <form onSubmit={handleSearchSubmit} className="w-64">
          <Input
            placeholder="Search leads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>
        <div className="w-40">
          <Select
            options={[{ value: "", label: "All Statuses" }, ...LEAD_STATUSES.map((s) => ({ value: s.value, label: s.label }))]}
            value={filters.status || ""}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                status: (e.target.value || undefined) as LeadFilters["status"],
              })
            }
          />
        </div>
        <div className="w-40">
          <Select
            options={[{ value: "", label: "All Sources" }, ...LEAD_SOURCES.map((s) => ({ value: s.value, label: s.label }))]}
            value={filters.source || ""}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                source: (e.target.value || undefined) as LeadFilters["source"],
              })
            }
          />
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={data}
        onRowClick={(lead) => router.push(`/leads/${lead.id}`)}
      />
    </div>
  );
}

export { LeadTable };
