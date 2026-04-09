"use client";

import { useState } from "react";
import Link from "next/link";
import { Landmark, Download, Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ListingTable } from "@/components/listings/listing-table";
import { useListings } from "@/hooks/use-listings";
import { useQuota } from "@/hooks/use-quota";
import { useTeamMemberLookup } from "@/hooks/use-team-lookup";
import { exportToCSV } from "@/lib/export-csv";
import type { ListingFilters } from "@/lib/validations";
import type { Listing } from "@/types/listing";

export default function ListingsPage() {
  const [filters, setFilters] = useState<ListingFilters>({});
  const { data: listings, isLoading, isError } = useListings(filters);
  const { data: quota } = useQuota();
  const memberLookup = useTeamMemberLookup();

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
                <Button size="sm"><Plus className="mr-1.5 h-3.5 w-3.5" />New Listing</Button>
              </Link>
            )}
          </div>
        }
      />

      <div className="mt-6">
        {isLoading ? (
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="border-b border-slate-100 px-5 py-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-8 w-32" />
                <Skeleton className="ml-auto h-8 w-24" />
              </div>
            </div>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 border-b border-slate-50 px-5 py-4 last:border-0">
                <Skeleton className="h-14 w-14 rounded-lg shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-xl border border-danger-200 bg-danger-50 p-8 text-center">
            <p className="text-sm font-medium text-danger-700">Failed to load listings</p>
            <p className="mt-1 text-xs text-danger-500">Please refresh the page to try again.</p>
          </div>
        ) : listings && listings.length > 0 ? (
          <ListingTable
            data={listings}
            filters={filters}
            onFiltersChange={setFilters}
            memberLookup={memberLookup}
          />
        ) : (
          <div className="mt-6">
            <EmptyState
              icon={Landmark}
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
