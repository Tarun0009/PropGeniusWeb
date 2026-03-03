import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { PublicListingView } from "./public-listing-view";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getListing(id: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("listings")
    .select("id, title, description, ai_description, property_type, transaction_type, price, price_unit, city, state, locality, address, pincode, bedrooms, bathrooms, area_sqft, carpet_area_sqft, floor_number, total_floors, furnishing, facing, parking, amenities, images, ai_highlights, ai_seo_title, ai_seo_description, status, organization_id")
    .eq("id", id)
    .eq("status", "active")
    .single();

  if (error || !data) return null;

  // Get org name for branding
  const { data: org } = await supabase
    .from("organizations")
    .select("name")
    .eq("id", data.organization_id)
    .single();

  // Increment view count — try RPC, fall back silently
  try {
    await supabase.rpc("increment_views", { listing_id: id });
  } catch {
    // RPC may not exist — silently ignore
  }

  return { ...data, org_name: org?.name || "PropGenius" };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const listing = await getListing(id);
  if (!listing) return { title: "Listing Not Found" };

  return {
    title: listing.ai_seo_title || listing.title,
    description: listing.ai_seo_description || listing.ai_description?.slice(0, 160) || listing.description?.slice(0, 160) || undefined,
    openGraph: {
      title: listing.title,
      description: listing.ai_seo_description || undefined,
      images: listing.images.length > 0 ? [listing.images[0]] : undefined,
    },
  };
}

export default async function PublicListingPage({ params }: PageProps) {
  const { id } = await params;
  const listing = await getListing(id);
  if (!listing) notFound();

  return <PublicListingView listing={listing} />;
}
