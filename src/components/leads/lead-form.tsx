"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateLead, useUpdateLead } from "@/hooks/use-leads";
import { createClient } from "@/lib/supabase/client";
import { leadFormSchema, type LeadFormData } from "@/lib/validations";
import { LEAD_STATUSES, LEAD_SOURCES, PROPERTY_TYPES } from "@/lib/constants";
import type { Lead } from "@/types/lead";

interface LeadFormProps {
  lead?: Lead;
}

function LeadForm({ lead }: LeadFormProps) {
  const router = useRouter();
  const createMutation = useCreateLead();
  const updateMutation = useUpdateLead();
  const isEditing = !!lead;
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [skipDuplicateCheck, setSkipDuplicateCheck] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      name: lead?.name || "",
      email: lead?.email || "",
      phone: lead?.phone || "",
      whatsapp_number: lead?.whatsapp_number || "",
      source: lead?.source || "website",
      interested_in: lead?.interested_in || "",
      budget_min: lead?.budget_min ?? undefined,
      budget_max: lead?.budget_max ?? undefined,
      preferred_location: lead?.preferred_location || "",
      preferred_property_type: lead?.preferred_property_type || "",
      status: lead?.status || "new",
      notes: lead?.notes || "",
      tags: lead?.tags || [],
      next_followup_at: lead?.next_followup_at?.slice(0, 16) || "",
      followup_notes: lead?.followup_notes || "",
      lost_reason: lead?.lost_reason || "",
    },
  });

  const checkDuplicate = async (data: LeadFormData): Promise<string | null> => {
    const supabase = createClient();
    const conditions: string[] = [];
    if (data.phone) conditions.push(`phone.eq.${data.phone}`);
    if (data.email) conditions.push(`email.eq.${data.email}`);
    if (data.whatsapp_number) conditions.push(`whatsapp_number.eq.${data.whatsapp_number}`);

    if (conditions.length === 0) return null;

    let query = supabase.from("leads").select("id, name, phone, email").or(conditions.join(",")).limit(1);
    if (isEditing) query = query.neq("id", lead.id);

    const { data: duplicates } = await query;
    if (duplicates && duplicates.length > 0) {
      const dup = duplicates[0];
      return `A lead "${dup.name}" already exists with matching ${dup.phone === data.phone ? "phone" : dup.email === data.email ? "email" : "WhatsApp number"}`;
    }
    return null;
  };

  const onSubmit = async (data: LeadFormData) => {
    // Check for duplicates (only on create or if not skipped)
    if (!isEditing && !skipDuplicateCheck) {
      const warning = await checkDuplicate(data);
      if (warning) {
        setDuplicateWarning(warning);
        return;
      }
    }

    setDuplicateWarning(null);
    setSkipDuplicateCheck(false);

    // Clean empty strings to null for optional fields
    const cleaned = {
      ...data,
      email: data.email || undefined,
      phone: data.phone || undefined,
      whatsapp_number: data.whatsapp_number || undefined,
      preferred_location: data.preferred_location || undefined,
      preferred_property_type: data.preferred_property_type || undefined,
      notes: data.notes || undefined,
      next_followup_at: data.next_followup_at || undefined,
      followup_notes: data.followup_notes || undefined,
      lost_reason: data.lost_reason || undefined,
      interested_in: data.interested_in || undefined,
    };

    if (isEditing) {
      await updateMutation.mutateAsync({ id: lead.id, data: cleaned });
      router.push(`/leads/${lead.id}`);
    } else {
      const newLead = await createMutation.mutateAsync(cleaned);
      router.push(`/leads/${newLead.id}`);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Contact Information */}
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          Contact Information
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Full Name"
            placeholder="e.g. Rajesh Kumar"
            error={errors.name?.message}
            {...register("name")}
          />
          <Input
            label="Email"
            type="email"
            placeholder="e.g. rajesh@email.com"
            error={errors.email?.message}
            {...register("email")}
          />
          <Input
            label="Phone"
            placeholder="e.g. +91 98765 43210"
            {...register("phone")}
          />
          <Input
            label="WhatsApp Number"
            placeholder="e.g. +91 98765 43210"
            {...register("whatsapp_number")}
          />
        </div>
      </div>

      {/* Lead Details */}
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          Lead Details
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Source"
            options={LEAD_SOURCES.map((s) => ({ value: s.value, label: s.label }))}
            error={errors.source?.message}
            {...register("source")}
          />
          <Select
            label="Status"
            options={LEAD_STATUSES.map((s) => ({ value: s.value, label: s.label }))}
            error={errors.status?.message}
            {...register("status")}
          />
          <Input
            label="Budget Min (₹)"
            type="number"
            placeholder="e.g. 3000000"
            {...register("budget_min", { valueAsNumber: true })}
          />
          <Input
            label="Budget Max (₹)"
            type="number"
            placeholder="e.g. 5000000"
            {...register("budget_max", { valueAsNumber: true })}
          />
          <Input
            label="Preferred Location"
            placeholder="e.g. Whitefield, Bangalore"
            {...register("preferred_location")}
          />
          <Select
            label="Preferred Property Type"
            options={[
              { value: "", label: "Any" },
              ...PROPERTY_TYPES.map((t) => ({ value: t.value, label: t.label })),
            ]}
            {...register("preferred_property_type")}
          />
        </div>
      </div>

      {/* Follow-up */}
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          Follow-up & Notes
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Next Follow-up"
            type="datetime-local"
            {...register("next_followup_at")}
          />
          <Input
            label="Follow-up Notes"
            placeholder="What to discuss..."
            {...register("followup_notes")}
          />
        </div>
        <div className="mt-4">
          <Textarea
            label="Notes"
            placeholder="Any additional notes about this lead..."
            rows={3}
            {...register("notes")}
          />
        </div>
      </div>

      {/* Duplicate Warning */}
      {duplicateWarning && (
        <div className="flex items-start gap-3 rounded-lg border border-warning-200 bg-warning-50 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning-600" />
          <div className="flex-1">
            <p className="text-sm font-medium text-warning-800">Possible duplicate detected</p>
            <p className="mt-1 text-sm text-warning-700">{duplicateWarning}</p>
            <div className="mt-3 flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  setSkipDuplicateCheck(true);
                  setDuplicateWarning(null);
                  handleSubmit(onSubmit)();
                }}
              >
                Create Anyway
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setDuplicateWarning(null)}
              >
                Go Back & Edit
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button type="submit" isLoading={isSaving} disabled={isSaving}>
          {isEditing ? "Update Lead" : "Add Lead"}
        </Button>
      </div>
    </form>
  );
}

export { LeadForm };
