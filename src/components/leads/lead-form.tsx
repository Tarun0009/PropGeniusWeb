"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateLead, useUpdateLead } from "@/hooks/use-leads";
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

  const onSubmit = async (data: LeadFormData) => {
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
