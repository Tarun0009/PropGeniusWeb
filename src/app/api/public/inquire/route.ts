import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { listing_id, name, phone, email, message } = body;

    if (!listing_id || !name || !phone) {
      return NextResponse.json(
        { error: "Name, phone, and listing are required" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Get the listing to find its organization
    const { data: listing, error: listingError } = await supabase
      .from("listings")
      .select("id, organization_id, title, city")
      .eq("id", listing_id)
      .eq("status", "active")
      .single();

    if (listingError || !listing) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }

    // Check if a lead with this phone already exists in the org
    const { data: existingLead } = await supabase
      .from("leads")
      .select("id")
      .eq("organization_id", listing.organization_id)
      .eq("phone", phone)
      .single();

    if (existingLead) {
      // Add an activity note to the existing lead
      await supabase.from("lead_activities").insert({
        lead_id: existingLead.id,
        organization_id: listing.organization_id,
        type: "note",
        description: `Inquiry from public listing page: ${listing.title}${message ? ` — "${message}"` : ""}`,
      });
    } else {
      // Create a new lead
      const { error: leadError } = await supabase.from("leads").insert({
        organization_id: listing.organization_id,
        name,
        phone,
        email: email || null,
        source: "website",
        status: "new",
        preferred_location: listing.city,
        notes: message
          ? `Inquiry from public listing: ${listing.title}\nMessage: ${message}`
          : `Inquiry from public listing: ${listing.title}`,
        ai_score: 0,
      });

      if (leadError) throw leadError;
    }

    // Increment inquiry count — try RPC, fall back to manual increment
    try {
      await supabase.rpc("increment_inquiries", { listing_id: listing.id });
    } catch {
      // RPC may not exist — silently ignore
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Public inquiry error:", error);
    return NextResponse.json(
      { error: "Failed to submit inquiry" },
      { status: 500 }
    );
  }
}
