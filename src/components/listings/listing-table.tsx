"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { Building2, Home, Building, Landmark, Store, Users, Link2, Check } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Avatar } from "@/components/ui/avatar";
import { formatPrice, formatRelativeTime } from "@/lib/utils";
import { PROPERTY_TYPES, LISTING_STATUSES } from "@/lib/constants";
import type { Listing } from "@/types/listing";
import type { ListingFilters } from "@/lib/validations";

function CopyLinkButton({ listingId }: { listingId: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(`${window.location.origin}/p/${listingId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="rounded-lg p-1.5 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-700"
      title="Copy public link"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-success-600" /> : <Link2 className="h-3.5 w-3.5" />}
    </button>
  );
}
import type { MemberLookup } from "@/hooks/use-team-lookup";

const statusVariant: Record<string, "default" | "success" | "primary" | "purple" | "warning"> = {
  draft: "default",
  active: "success",
  sold: "primary",
  rented: "purple",
  archived: "default",
};

const propertyIcons: Record<string, React.ElementType> = {
  apartment: Building2,
  house: Home,
  villa: Building,
  plot: Landmark,
  commercial: Store,
  pg: Users,
};

const columnHelper = createColumnHelper<Listing>();

function getColumns(memberLookup?: MemberLookup) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cols: ColumnDef<Listing, any>[] = [
    columnHelper.accessor("title", {
      header: "Property",
      cell: (info) => {
        const listing = info.row.original;
        const Icon = propertyIcons[listing.property_type] || Building2;
        return (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
              <Icon className="h-4 w-4 text-slate-500" />
            </div>
            <div className="min-w-0">
              <p className="truncate font-medium text-slate-900">{info.getValue()}</p>
              <p className="truncate text-xs text-slate-500 capitalize">{listing.property_type} &middot; {listing.transaction_type}</p>
            </div>
          </div>
        );
      },
    }),
    columnHelper.accessor("price", {
      header: "Price",
      cell: (info) => (
        <span className="font-medium text-slate-900">{formatPrice(info.getValue())}</span>
      ),
    }),
    columnHelper.accessor("city", {
      header: "Location",
      cell: (info) => (
        <span className="text-slate-600">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: (info) => {
        const status = info.getValue();
        return (
          <Badge variant={statusVariant[status] || "default"} size="sm">
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        );
      },
    }),
    columnHelper.accessor("views_count", {
      header: "Views",
      cell: (info) => <span className="text-slate-600">{info.getValue()}</span>,
    }),
    columnHelper.accessor("inquiries_count", {
      header: "Inquiries",
      cell: (info) => <span className="text-slate-600">{info.getValue()}</span>,
    }),
  ];

  // "Created By" column for multi-member orgs
  if (memberLookup && memberLookup.size > 1) {
    cols.push(
      columnHelper.accessor("created_by", {
        header: "Created By",
        cell: (info) => {
          const member = memberLookup.get(info.getValue());
          if (!member) return <span className="text-xs text-slate-400">-</span>;
          return (
            <div className="flex items-center gap-2">
              <Avatar name={member.name} src={member.avatar_url} size="sm" className="h-6 w-6 text-[10px]" />
              <span className="text-sm text-slate-600 truncate max-w-30">{member.name}</span>
            </div>
          );
        },
      })
    );
  }

  cols.push(
    columnHelper.accessor("created_at", {
      header: "Created",
      cell: (info) => (
        <span className="text-slate-500">{formatRelativeTime(info.getValue())}</span>
      ),
    }),
    columnHelper.accessor("id", {
      header: "",
      id: "actions",
      cell: (info) => {
        const listing = info.row.original;
        if (listing.status !== "active") return null;
        return <CopyLinkButton listingId={info.getValue()} />;
      },
    })
  );

  return cols;
}

interface ListingTableProps {
  data: Listing[];
  filters: ListingFilters;
  onFiltersChange: (filters: ListingFilters) => void;
  memberLookup?: MemberLookup;
}

function ListingTable({ data, filters, onFiltersChange, memberLookup }: ListingTableProps) {
  const router = useRouter();
  const [search, setSearch] = useState(filters.search || "");
  const showAgentFilter = memberLookup && memberLookup.size > 1;
  const columns = useMemo(() => getColumns(memberLookup), [memberLookup]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFiltersChange({ ...filters, search: search || undefined });
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <form onSubmit={handleSearchSubmit} className="w-64">
          <Input
            placeholder="Search listings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoComplete="off"
          />
        </form>
        <div className="w-40">
          <Select
            options={[{ value: "", label: "All Statuses" }, ...LISTING_STATUSES.map((s) => ({ value: s.value, label: s.label }))]}
            value={filters.status || ""}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                status: (e.target.value || undefined) as ListingFilters["status"],
              })
            }
          />
        </div>
        <div className="w-40">
          <Select
            options={[{ value: "", label: "All Types" }, ...PROPERTY_TYPES.map((t) => ({ value: t.value, label: t.label }))]}
            value={filters.property_type || ""}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                property_type: (e.target.value || undefined) as ListingFilters["property_type"],
              })
            }
          />
        </div>
        {showAgentFilter && (
          <div className="w-40">
            <Select
              options={[
                { value: "", label: "All Agents" },
                ...Array.from(memberLookup.entries()).map(([id, m]) => ({
                  value: id,
                  label: m.name,
                })),
              ]}
              value={filters.created_by || ""}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  created_by: e.target.value || undefined,
                })
              }
            />
          </div>
        )}
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={data}
        onRowClick={(listing) => router.push(`/listings/${listing.id}`)}
      />
    </div>
  );
}

export { ListingTable };
