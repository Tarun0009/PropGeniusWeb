"use client";

import { PageHeader } from "@/components/ui/page-header";
import { LeadForm } from "@/components/leads/lead-form";

export default function NewLeadPage() {
  return (
    <div>
      <PageHeader
        title="Add New Lead"
        description="Enter lead contact details and preferences"
        breadcrumbs={[
          { label: "Leads", href: "/leads" },
          { label: "New Lead" },
        ]}
      />
      <div className="mt-6">
        <LeadForm />
      </div>
    </div>
  );
}
