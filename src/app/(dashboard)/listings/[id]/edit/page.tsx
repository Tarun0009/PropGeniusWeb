"use client";

import { useParams } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Spinner } from "@/components/ui/spinner";
import { ListingForm } from "@/components/listings/listing-form";
import { useListing } from "@/hooks/use-listings";

export default function EditListingPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: listing, isLoading } = useListing(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="py-24 text-center">
        <p className="text-slate-500">Listing not found</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Edit Listing"
        description={listing.title}
        breadcrumbs={[
          { label: "Listings", href: "/listings" },
          { label: listing.title, href: `/listings/${id}` },
          { label: "Edit" },
        ]}
      />
      <div className="mt-6">
        <ListingForm listing={listing} />
      </div>
    </div>
  );
}
