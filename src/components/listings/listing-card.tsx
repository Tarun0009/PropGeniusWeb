"use client";

import Link from "next/link";
import { MapPin, BedDouble, Maximize, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { Listing } from "@/types/listing";

const statusVariant: Record<string, "default" | "success" | "primary" | "purple" | "warning"> = {
  draft: "default",
  active: "success",
  sold: "primary",
  rented: "purple",
  archived: "default",
};

interface ListingCardProps {
  listing: Listing;
  className?: string;
}

function ListingCard({ listing, className }: ListingCardProps) {
  return (
    <Link href={`/listings/${listing.id}`}>
      <div
        className={cn(
          "group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md",
          className
        )}
      >
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
          {listing.images.length > 0 ? (
            <img
              src={listing.images[0]}
              alt={listing.title}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Building2 className="h-10 w-10 text-slate-300" />
            </div>
          )}
          <div className="absolute right-2 top-2">
            <Badge variant={statusVariant[listing.status] || "default"} size="sm">
              {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-lg font-bold text-primary-600">
            {formatPrice(listing.price)}
            {listing.price_unit === "per_month" && (
              <span className="text-sm font-normal text-slate-400">/mo</span>
            )}
            {listing.price_unit === "per_sqft" && (
              <span className="text-sm font-normal text-slate-400">/sqft</span>
            )}
          </p>
          <h3 className="mt-1 truncate text-sm font-semibold text-slate-900">
            {listing.title}
          </h3>
          <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
            <MapPin className="h-3 w-3" />
            <span className="truncate">
              {[listing.locality, listing.city].filter(Boolean).join(", ")}
            </span>
          </div>

          {/* Specs */}
          <div className="mt-3 flex items-center gap-3 text-xs text-slate-600">
            {listing.bedrooms != null && (
              <span className="flex items-center gap-1">
                <BedDouble className="h-3.5 w-3.5" />
                {listing.bedrooms} BHK
              </span>
            )}
            {listing.area_sqft && (
              <span className="flex items-center gap-1">
                <Maximize className="h-3.5 w-3.5" />
                {listing.area_sqft} sqft
              </span>
            )}
            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs capitalize">
              {listing.property_type}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export { ListingCard };
