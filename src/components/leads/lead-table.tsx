"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { Avatar } from "@/components/ui/avatar";
import { LeadScoreBadge } from "./lead-score-badge";
import { useDeleteLead, useUpdateLeadStatus } from "@/hooks/use-leads";
import { useNotificationStore } from "@/stores/notification-store";
import { formatRelativeTime } from "@/lib/utils";
import { LEAD_STATUSES, LEAD_SOURCES } from "@/lib/constants";
import type { Lead } from "@/types/lead";
import type { LeadFilters } from "@/lib/validations";
import type { MemberLookup } from "@/hooks/use-team-lookup";

const statusVariant: Record<string, "primary" | "purple" | "warning" | "cyan" | "orange" | "success" | "danger"> = {
  new: "primary",
  contacted: "purple",
  interested: "warning",
  site_visit: "cyan",
  negotiation: "orange",
  converted: "success",
  lost: "danger",
};

interface LeadTableProps {
  data: Lead[];
  filters: LeadFilters;
  onFiltersChange: (filters: LeadFilters) => void;
  memberLookup?: MemberLookup;
}

function LeadTable({ data, filters, onFiltersChange, memberLookup }: LeadTableProps) {
  const router = useRouter();
  const [search, setSearch] = useState(filters.search || "");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [bulkStatus, setBulkStatus] = useState("contacted");
  const [isProcessing, setIsProcessing] = useState(false);

  const deleteMutation = useDeleteLead();
  const updateStatusMutation = useUpdateLeadStatus();
  const addToast = useNotificationStore((s) => s.addToast);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFiltersChange({ ...filters, search: search || undefined });
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === data.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(data.map((l) => l.id)));
    }
  };

  const handleBulkDelete = async () => {
    setIsProcessing(true);
    let deleted = 0;
    for (const id of selectedIds) {
      try {
        await deleteMutation.mutateAsync(id);
        deleted++;
      } catch {
        // Continue with remaining
      }
    }
    setIsProcessing(false);
    setShowDeleteModal(false);
    setSelectedIds(new Set());
    addToast({ type: "success", title: `Deleted ${deleted} leads` });
  };

  const handleBulkStatusChange = async () => {
    setIsProcessing(true);
    let updated = 0;
    for (const id of selectedIds) {
      try {
        await updateStatusMutation.mutateAsync({ id, status: bulkStatus });
        updated++;
      } catch {
        // Continue with remaining
      }
    }
    setIsProcessing(false);
    setShowStatusModal(false);
    setSelectedIds(new Set());
    addToast({ type: "success", title: `Updated ${updated} leads to ${bulkStatus}` });
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
        {memberLookup && memberLookup.size > 1 && (
          <div className="w-40">
            <Select
              options={[
                { value: "", label: "All Agents" },
                ...Array.from(memberLookup.entries()).map(([id, m]) => ({
                  value: id,
                  label: m.name,
                })),
              ]}
              value={filters.assigned_to || ""}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  assigned_to: e.target.value || undefined,
                })
              }
            />
          </div>
        )}
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-primary-200 bg-primary-50 px-4 py-2">
          <span className="text-sm font-medium text-primary-700">
            {selectedIds.size} selected
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowStatusModal(true)}
          >
            <ArrowRight className="mr-1 h-3.5 w-3.5" />
            Change Status
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setShowDeleteModal(true)}
          >
            <Trash2 className="mr-1 h-3.5 w-3.5" />
            Delete
          </Button>
          <button
            className="ml-auto text-xs text-primary-600 hover:underline"
            onClick={() => setSelectedIds(new Set())}
          >
            Clear selection
          </button>
        </div>
      )}

      {/* Select All Checkbox */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={data.length > 0 && selectedIds.size === data.length}
          onChange={toggleSelectAll}
          className="h-4 w-4 rounded border-slate-300"
        />
        <span className="text-xs text-slate-500">Select all ({data.length})</span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="w-10 px-4 py-3" />
              <th className="px-4 py-3 text-left font-medium text-slate-600">Name</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Source</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">AI Score</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Status</th>
              {memberLookup && memberLookup.size > 1 && (
                <th className="px-4 py-3 text-left font-medium text-slate-600">Assigned To</th>
              )}
              <th className="px-4 py-3 text-left font-medium text-slate-600">Next Follow-up</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Created</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={memberLookup && memberLookup.size > 1 ? 8 : 7} className="px-4 py-8 text-center text-slate-500">No results found</td>
              </tr>
            ) : (
              data.map((lead) => {
                const sourceLabel = LEAD_SOURCES.find((s) => s.value === lead.source)?.label || lead.source;
                const statusLabel = LEAD_STATUSES.find((s) => s.value === lead.status)?.label || lead.status;
                const isPastFollowup = lead.next_followup_at && new Date(lead.next_followup_at) < new Date();
                return (
                  <tr
                    key={lead.id}
                    className="border-b border-slate-100 transition-colors hover:bg-slate-50 cursor-pointer"
                  >
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(lead.id)}
                        onChange={() => toggleSelect(lead.id)}
                        className="h-4 w-4 rounded border-slate-300"
                      />
                    </td>
                    <td className="px-4 py-3" onClick={() => router.push(`/leads/${lead.id}`)}>
                      <p className="font-medium text-slate-900">{lead.name}</p>
                      {lead.phone && <p className="text-xs text-slate-500">{lead.phone}</p>}
                    </td>
                    <td className="px-4 py-3 text-sm capitalize text-slate-600" onClick={() => router.push(`/leads/${lead.id}`)}>
                      {sourceLabel}
                    </td>
                    <td className="px-4 py-3" onClick={() => router.push(`/leads/${lead.id}`)}>
                      {lead.ai_score > 0 ? (
                        <LeadScoreBadge score={lead.ai_score} size="sm" />
                      ) : (
                        <span className="text-xs text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3" onClick={() => router.push(`/leads/${lead.id}`)}>
                      <Badge variant={statusVariant[lead.status] || "default"} size="sm">
                        {statusLabel}
                      </Badge>
                    </td>
                    {memberLookup && memberLookup.size > 1 && (
                      <td className="px-4 py-3" onClick={() => router.push(`/leads/${lead.id}`)}>
                        {lead.assigned_to && memberLookup.get(lead.assigned_to) ? (
                          <div className="flex items-center gap-2">
                            <Avatar
                              name={memberLookup.get(lead.assigned_to)!.name}
                              src={memberLookup.get(lead.assigned_to)!.avatar_url}
                              size="sm"
                              className="h-6 w-6 text-[10px]"
                            />
                            <span className="text-sm text-slate-600 truncate max-w-[120px]">
                              {memberLookup.get(lead.assigned_to)!.name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">Unassigned</span>
                        )}
                      </td>
                    )}
                    <td className="px-4 py-3" onClick={() => router.push(`/leads/${lead.id}`)}>
                      {lead.next_followup_at ? (
                        <span className={isPastFollowup ? "text-sm font-medium text-danger-600" : "text-sm text-slate-600"}>
                          {formatRelativeTime(lead.next_followup_at)}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500" onClick={() => router.push(`/leads/${lead.id}`)}>
                      {formatRelativeTime(lead.created_at)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Bulk Delete Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Leads" size="sm">
        <p className="text-sm text-slate-600">
          Are you sure you want to delete <strong>{selectedIds.size}</strong> leads? This action cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" size="sm" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
          <Button variant="danger" size="sm" onClick={handleBulkDelete} isLoading={isProcessing}>
            Delete {selectedIds.size} Leads
          </Button>
        </div>
      </Modal>

      {/* Bulk Status Change Modal */}
      <Modal isOpen={showStatusModal} onClose={() => setShowStatusModal(false)} title="Change Status" size="sm">
        <Select
          label="New Status"
          options={LEAD_STATUSES.map((s) => ({ value: s.value, label: s.label }))}
          value={bulkStatus}
          onChange={(e) => setBulkStatus(e.target.value)}
        />
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" size="sm" onClick={() => setShowStatusModal(false)}>Cancel</Button>
          <Button size="sm" onClick={handleBulkStatusChange} isLoading={isProcessing}>
            Update {selectedIds.size} Leads
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export { LeadTable };
