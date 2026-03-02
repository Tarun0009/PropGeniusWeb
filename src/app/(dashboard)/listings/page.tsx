"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2 } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ListingTable } from "@/components/listings/listing-table";
import { useListings } from "@/hooks/use-listings";
import type { ListingFilters } from "@/lib/validations";

export default function ListingsPage() {
  const [filters, setFilters] = useState<ListingFilters>({});
  const { data: listings, isLoading } = useListings(filters);

  return (
    <div>
      <PageHeader
        title="Listings"
        description="Manage your property listings"
        actions={
          <Link href="/listings/new">
            <Button>+ New Listing</Button>
          </Link>
        }
      />

      <div className="mt-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Spinner size="lg" />
          </div>
        ) : listings && listings.length > 0 ? (
          <ListingTable
            data={listings}
            filters={filters}
            onFiltersChange={setFilters}
          />
        ) : (
          <div className="mt-6">
            <EmptyState
              icon={Building2}
              title="No listings yet"
              description="Create your first AI-powered property listing to get started."
              action={
                <Link href="/listings/new">
                  <Button>Create Listing</Button>
                </Link>
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}
