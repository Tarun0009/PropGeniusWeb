"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, Building2, MapPin, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useListings } from "@/hooks/use-listings";
import { useMatchListings } from "@/hooks/use-leads";
import { formatPrice } from "@/lib/utils";
import type { Lead } from "@/types/lead";
import type { Listing } from "@/types/listing";

interface RecommendedListingsProps {
  lead: Lead;
}

function RecommendedListings({ lead }: RecommendedListingsProps) {
  const { data: allListings = [] } = useListings({ status: "active" });
  const matchMutation = useMatchListings();
  const [matches, setMatches] = useState<{ listing_id: string; match_score: number; reason: string }[]>([]);

  const hasPreferences = !!(lead.budget_min || lead.budget_max || lead.preferred_location || lead.preferred_property_type);

  if (!hasPreferences || allListings.length === 0) return null;

  const handleMatch = async () => {
    const listingSummaries = allListings.map((l) => ({
      id: l.id,
      title: l.title,
      price: l.price,
      city: l.city,
      property_type: l.property_type,
      bedrooms: l.bedrooms,
      area_sqft: l.area_sqft,
      transaction_type: l.transaction_type,
    }));

    const result = await matchMutation.mutateAsync({
      lead_budget_min: lead.budget_min ?? undefined,
      lead_budget_max: lead.budget_max ?? undefined,
      lead_location: lead.preferred_location ?? undefined,
      lead_property_type: lead.preferred_property_type ?? undefined,
      lead_notes: lead.interested_in ?? undefined,
      listings: listingSummaries,
    });

    setMatches(result.matches);
  };

  const matchedListings = matches
    .map((m) => {
      const listing = allListings.find((l) => l.id === m.listing_id);
      return listing ? { ...m, listing } : null;
    })
    .filter(Boolean) as { listing_id: string; match_score: number; reason: string; listing: Listing }[];

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <Sparkles className="h-4 w-4 text-primary-500" />
          Recommended Listings
        </h2>
        <Button
          size="sm"
          variant="outline"
          onClick={handleMatch}
          disabled={matchMutation.isPending}
        >
          {matchMutation.isPending ? (
            <><Spinner size="sm" /> Matching...</>
          ) : matches.length > 0 ? (
            "Re-match"
          ) : (
            "Find Matches"
          )}
        </Button>
      </div>

      {matchedListings.length > 0 ? (
        <div className="space-y-3">
          {matchedListings.map(({ listing, match_score, reason }) => (
            <div
              key={listing.id}
              className="rounded-lg border border-slate-100 p-3 transition-colors hover:bg-slate-50"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/listings/${listing.id}`}
                    className="text-sm font-medium text-slate-900 hover:text-primary-600"
                  >
                    {listing.title}
                  </Link>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="font-semibold text-primary-600">{formatPrice(listing.price)}</span>
                    <span className="flex items-center gap-0.5">
                      <MapPin className="h-3 w-3" />
                      {listing.city}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Building2 className="h-3 w-3" />
                      {listing.property_type}
                    </span>
                  </div>
                </div>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
                  match_score >= 80 ? "bg-green-100 text-green-700" :
                  match_score >= 60 ? "bg-yellow-100 text-yellow-700" :
                  "bg-orange-100 text-orange-700"
                }`}>
                  {match_score}%
                </span>
              </div>
              <p className="mt-1.5 text-xs text-slate-500">{reason}</p>
              <div className="mt-2">
                <Link href={`/messages?lead=${lead.id}`}>
                  <Button variant="ghost" size="sm" className="h-7 text-xs">
                    <MessageSquare className="mr-1 h-3 w-3" />
                    Share via WhatsApp
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : !matchMutation.isPending ? (
        <p className="text-sm text-slate-400">
          Click &quot;Find Matches&quot; to get AI-powered listing recommendations for this lead.
        </p>
      ) : null}
    </div>
  );
}

export { RecommendedListings };
