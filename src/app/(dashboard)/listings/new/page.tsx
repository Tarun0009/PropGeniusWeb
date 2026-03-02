"use client";

import { PageHeader } from "@/components/ui/page-header";
import { ListingForm } from "@/components/listings/listing-form";

export default function NewListingPage() {
  return (
    <div>
      <PageHeader
        title="Create New Listing"
        description="Fill in the property details and let AI generate compelling content"
        breadcrumbs={[
          { label: "Listings", href: "/listings" },
          { label: "New Listing" },
        ]}
      />
      <div className="mt-6">
        <ListingForm />
      </div>
    </div>
  );
}
