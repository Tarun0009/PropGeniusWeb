"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Phone,
  Mail,
  MessageSquare,
  MapPin,
  IndianRupee,
  Calendar,
  Sparkles,
  Pencil,
  Trash2,
  ArrowRight,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { LeadScoreBadge } from "@/components/leads/lead-score-badge";
import { LeadTimeline } from "@/components/leads/lead-timeline";
import {
  useLead,
  useDeleteLead,
  useUpdateLeadStatus,
  useScoreLead,
  useLeadActivities,
  useCreateActivity,
  useUpdateLead,
} from "@/hooks/use-leads";
import { LEAD_STATUSES, LEAD_SOURCES } from "@/lib/constants";
import { formatPrice, formatDate, formatRelativeTime } from "@/lib/utils";
import type { ActivityType } from "@/types/lead";

const statusVariant: Record<string, "primary" | "purple" | "warning" | "cyan" | "orange" | "success" | "danger"> = {
  new: "primary",
  contacted: "purple",
  interested: "warning",
  site_visit: "cyan",
  negotiation: "orange",
  converted: "success",
  lost: "danger",
};

const ACTIVITY_TYPES: { value: ActivityType; label: string }[] = [
  { value: "call", label: "Phone Call" },
  { value: "email", label: "Email" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "site_visit", label: "Site Visit" },
  { value: "note", label: "Note" },
];

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: lead, isLoading } = useLead(id);
  const { data: activities = [] } = useLeadActivities(id);
  const deleteMutation = useDeleteLead();
  const updateStatusMutation = useUpdateLeadStatus();
  const scoreMutation = useScoreLead();
  const updateMutation = useUpdateLead();
  const createActivityMutation = useCreateActivity();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [activityType, setActivityType] = useState<ActivityType>("call");
  const [activityDescription, setActivityDescription] = useState("");

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="py-20 text-center text-slate-500">
        Lead not found
      </div>
    );
  }

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(lead.id);
    router.push("/leads");
  };

  const handleStatusChange = (newStatus: string) => {
    if (newStatus !== lead.status) {
      updateStatusMutation.mutate({ id: lead.id, status: newStatus });
    }
  };

  const handleScoreLead = async () => {
    const daysAgo = Math.floor(
      (Date.now() - new Date(lead.created_at).getTime()) / (1000 * 60 * 60 * 24)
    );

    const result = await scoreMutation.mutateAsync({
      name: lead.name,
      source: lead.source,
      budget_min: lead.budget_min ?? undefined,
      budget_max: lead.budget_max ?? undefined,
      preferred_location: lead.preferred_location ?? undefined,
      days_ago: daysAgo,
      contact_count: activities.filter((a) => ["call", "email", "whatsapp"].includes(a.type)).length,
      days_since_response: lead.last_contacted_at
        ? Math.floor((Date.now() - new Date(lead.last_contacted_at).getTime()) / (1000 * 60 * 60 * 24))
        : undefined,
      current_status: lead.status,
    });

    // Save score to lead
    await updateMutation.mutateAsync({
      id: lead.id,
      data: {
        ai_score: result.score,
        ai_score_reason: result.reason,
        ai_recommended_action: result.recommended_action,
      } as Record<string, unknown>,
    });
  };

  const handleAddActivity = async () => {
    if (!activityDescription.trim()) return;

    await createActivityMutation.mutateAsync({
      lead_id: lead.id,
      type: activityType,
      description: activityDescription.trim(),
    });

    setActivityDescription("");
    setShowActivityModal(false);
  };

  const sourceLabel = LEAD_SOURCES.find((s) => s.value === lead.source)?.label || lead.source;
  const statusLabel = LEAD_STATUSES.find((s) => s.value === lead.status)?.label || lead.status;

  return (
    <div>
      <PageHeader
        title={lead.name}
        description={`${sourceLabel} lead · Added ${formatRelativeTime(lead.created_at)}`}
        breadcrumbs={[
          { label: "Leads", href: "/leads" },
          { label: lead.name },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/leads/${lead.id}/edit`)}
            >
              <Pencil className="mr-1.5 h-3.5 w-3.5" />
              Edit
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setShowDeleteModal(true)}
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              Delete
            </Button>
          </div>
        }
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Main Content — Left 2 cols */}
        <div className="space-y-6 lg:col-span-2">
          {/* Contact Info */}
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Contact Information</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {lead.phone && (
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
                    <Phone className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Phone</p>
                    <p className="text-sm font-medium text-slate-900">{lead.phone}</p>
                  </div>
                </div>
              )}
              {lead.email && (
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50">
                    <Mail className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Email</p>
                    <p className="text-sm font-medium text-slate-900">{lead.email}</p>
                  </div>
                </div>
              )}
              {lead.whatsapp_number && (
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50">
                    <MessageSquare className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">WhatsApp</p>
                    <p className="text-sm font-medium text-slate-900">{lead.whatsapp_number}</p>
                  </div>
                </div>
              )}
              {lead.preferred_location && (
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50">
                    <MapPin className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Preferred Location</p>
                    <p className="text-sm font-medium text-slate-900">{lead.preferred_location}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Budget & Preferences */}
          {(lead.budget_min || lead.budget_max || lead.preferred_property_type || lead.interested_in) && (
            <div className="rounded-lg border border-slate-200 bg-white p-6">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">Preferences</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {(lead.budget_min || lead.budget_max) && (
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50">
                      <IndianRupee className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Budget Range</p>
                      <p className="text-sm font-medium text-slate-900">
                        {lead.budget_min ? formatPrice(lead.budget_min) : "Any"} – {lead.budget_max ? formatPrice(lead.budget_max) : "Any"}
                      </p>
                    </div>
                  </div>
                )}
                {lead.preferred_property_type && (
                  <div>
                    <p className="text-xs text-slate-500">Property Type</p>
                    <p className="text-sm font-medium capitalize text-slate-900">{lead.preferred_property_type}</p>
                  </div>
                )}
                {lead.interested_in && (
                  <div className="sm:col-span-2">
                    <p className="text-xs text-slate-500">Interested In</p>
                    <p className="text-sm text-slate-900">{lead.interested_in}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {lead.notes && (
            <div className="rounded-lg border border-slate-200 bg-white p-6">
              <h2 className="mb-2 text-lg font-semibold text-slate-900">Notes</h2>
              <p className="whitespace-pre-wrap text-sm text-slate-600">{lead.notes}</p>
            </div>
          )}

          {/* Activity Timeline */}
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Activity Timeline</h2>
              <Button size="sm" variant="outline" onClick={() => setShowActivityModal(true)}>
                + Log Activity
              </Button>
            </div>
            <LeadTimeline activities={activities} />
          </div>
        </div>

        {/* Sidebar — Right col */}
        <div className="space-y-6">
          {/* Status */}
          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <h3 className="mb-3 text-sm font-semibold text-slate-900">Status</h3>
            <div className="mb-3">
              <Badge variant={statusVariant[lead.status] || "default"} size="sm">
                {statusLabel}
              </Badge>
            </div>
            <Select
              options={LEAD_STATUSES.map((s) => ({ value: s.value, label: s.label }))}
              value={lead.status}
              onChange={(e) => handleStatusChange(e.target.value)}
            />
            {lead.lost_reason && (
              <p className="mt-2 text-xs text-danger-600">
                Lost reason: {lead.lost_reason}
              </p>
            )}
          </div>

          {/* AI Score */}
          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">AI Score</h3>
              <Button
                size="sm"
                variant="outline"
                onClick={handleScoreLead}
                isLoading={scoreMutation.isPending || updateMutation.isPending}
                disabled={scoreMutation.isPending || updateMutation.isPending}
              >
                <Sparkles className="mr-1 h-3.5 w-3.5" />
                {lead.ai_score > 0 ? "Re-score" : "Score"}
              </Button>
            </div>
            {lead.ai_score > 0 ? (
              <div className="space-y-2">
                <LeadScoreBadge score={lead.ai_score} size="lg" showLabel />
                {lead.ai_score_reason && (
                  <p className="text-xs text-slate-500">{lead.ai_score_reason}</p>
                )}
                {lead.ai_recommended_action && (
                  <div className="mt-2 rounded-md bg-primary-50 px-3 py-2">
                    <p className="flex items-center gap-1.5 text-xs font-medium text-primary-700">
                      <ArrowRight className="h-3 w-3" />
                      {lead.ai_recommended_action}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-400">Not scored yet</p>
            )}
          </div>

          {/* Follow-up */}
          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <h3 className="mb-3 text-sm font-semibold text-slate-900">Follow-up</h3>
            {lead.next_followup_at ? (
              <div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-700">
                    {formatDate(lead.next_followup_at)}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {formatRelativeTime(lead.next_followup_at)}
                </p>
                {lead.followup_notes && (
                  <p className="mt-2 text-xs text-slate-600">{lead.followup_notes}</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-400">No follow-up scheduled</p>
            )}
          </div>

          {/* Tags */}
          {lead.tags && lead.tags.length > 0 && (
            <div className="rounded-lg border border-slate-200 bg-white p-5">
              <h3 className="mb-3 text-sm font-semibold text-slate-900">Tags</h3>
              <div className="flex flex-wrap gap-1.5">
                {lead.tags.map((tag) => (
                  <Badge key={tag} variant="default" size="sm">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Lead">
        <p className="text-sm text-slate-600">
          Are you sure you want to delete <strong>{lead.name}</strong>? This action cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" size="sm" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleDelete}
            isLoading={deleteMutation.isPending}
          >
            Delete Lead
          </Button>
        </div>
      </Modal>

      {/* Add Activity Modal */}
      <Modal
        isOpen={showActivityModal}
        onClose={() => setShowActivityModal(false)}
        title="Log Activity"
      >
        <div className="space-y-4">
          <Select
            label="Activity Type"
            options={ACTIVITY_TYPES.map((t) => ({ value: t.value, label: t.label }))}
            value={activityType}
            onChange={(e) => setActivityType(e.target.value as ActivityType)}
          />
          <Textarea
            label="Description"
            placeholder="What happened?"
            rows={3}
            value={activityDescription}
            onChange={(e) => setActivityDescription(e.target.value)}
          />
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowActivityModal(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleAddActivity}
              disabled={!activityDescription.trim() || createActivityMutation.isPending}
              isLoading={createActivityMutation.isPending}
            >
              Log Activity
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
