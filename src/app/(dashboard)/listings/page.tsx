"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, Download } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ListingTable } from "@/components/listings/listing-table";
import { useListings } from "@/hooks/use-listings";
import { useQuota } from "@/hooks/use-quota";
import { exportToCSV } from "@/lib/export-csv";
import type { ListingFilters } from "@/lib/validations";
import type { Listing } from "@/types/listing";

export default function ListingsPage() {
  const [filters, setFilters] = useState<ListingFilters>({});
  const { data: listings, isLoading } = useListings(filters);
  const { data: quota } = useQuota();

  return (
    <div>
      <PageHeader
        title="Listings"
        description="Manage your property listings"
        actions={
          <div className="flex items-center gap-2">
            {listings && listings.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  exportToCSV<Listing>(
                    listings,
                    [
                      { key: "title", header: "Title" },
                      { key: "property_type", header: "Property Type" },
                      { key: "transaction_type", header: "Transaction Type" },
                      { key: "price", header: "Price" },
                      { key: "city", header: "City" },
                      { key: "state", header: "State" },
                      { key: "status", header: "Status" },
                      { key: "bedrooms", header: "Bedrooms" },
                      { key: "bathrooms", header: "Bathrooms" },
                      { key: "area_sqft", header: "Area (sqft)" },
                      { key: "created_at", header: "Created At" },
                    ],
                    "listings-export"
                  )
                }
              >
                <Download className="mr-1.5 h-3.5 w-3.5" />
                Export CSV
              </Button>
            )}
            {quota && !quota.listings.canCreate ? (
              <Link href="/settings">
                <Button size="sm" variant="outline">
                  {quota.listings.current}/{quota.listings.max} Listings — Upgrade
                </Button>
              </Link>
            ) : (
              <Link href="/listings/new">
                <Button size="sm">+ New Listing</Button>
              </Link>
            )}
          </div>
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
