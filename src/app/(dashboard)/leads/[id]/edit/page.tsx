"use client";

import { useParams } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Spinner } from "@/components/ui/spinner";
import { LeadForm } from "@/components/leads/lead-form";
import { useLead } from "@/hooks/use-leads";

export default function EditLeadPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: lead, isLoading } = useLead(id);

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

  return (
    <div>
      <PageHeader
        title={`Edit: ${lead.name}`}
        breadcrumbs={[
          { label: "Leads", href: "/leads" },
          { label: lead.name, href: `/leads/${lead.id}` },
          { label: "Edit" },
        ]}
      />
      <div className="mt-6">
        <LeadForm lead={lead} />
      </div>
    </div>
  );
}
