"use client";

import { useState } from "react";
import Image from "next/image";
import {
  MapPin,
  BedDouble,
  Bath,
  Maximize,
  Building2,
  Car,
  Compass,
  CheckCircle2,
  Phone,
  Mail,
  User,
  MessageSquare,
} from "lucide-react";

interface ListingData {
  id: string;
  title: string;
  description: string | null;
  ai_description: string | null;
  property_type: string;
  transaction_type: string;
  price: number;
  price_unit: string;
  city: string;
  state: string;
  locality: string | null;
  address: string | null;
  pincode: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  area_sqft: number | null;
  carpet_area_sqft: number | null;
  floor_number: number | null;
  total_floors: number | null;
  furnishing: string | null;
  facing: string | null;
  parking: number;
  amenities: string[];
  images: string[];
  ai_highlights: string[];
  org_name: string;
}

function formatPrice(price: number): string {
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(price);
}

export function PublicListingView({ listing }: { listing: ListingData }) {
  const [formData, setFormData] = useState({ name: "", phone: "", email: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) return;

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/public/inquire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listing_id: listing.id, ...formData }),
      });

      if (!res.ok) throw new Error("Failed to submit");
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <span className="text-lg font-bold text-slate-900">{listing.org_name}</span>
          <span className="text-sm text-slate-500">Property Listing</span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Images */}
            {listing.images.length > 0 && (
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <div className="relative aspect-video w-full">
                  <Image
                    src={listing.images[0]}
                    alt={listing.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 66vw"
                  />
                </div>
                {listing.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-1 p-1">
                    {listing.images.slice(1, 5).map((url, i) => (
                      <div key={i} className="relative aspect-square w-full">
                        <Image
                          src={url}
                          alt={`Photo ${i + 2}`}
                          fill
                          className="rounded object-cover"
                          sizes="(max-width: 1024px) 25vw, 16vw"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Title & Price */}
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">{listing.title}</h1>
                  <p className="mt-1 flex items-center gap-1.5 text-slate-500">
                    <MapPin className="h-4 w-4" />
                    {[listing.locality, listing.city, listing.state].filter(Boolean).join(", ")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">{formatPrice(listing.price)}</p>
                  <p className="text-sm capitalize text-slate-500">
                    {listing.property_type} for {listing.transaction_type}
                  </p>
                </div>
              </div>

              {/* Specs */}
              <div className="mt-6 flex flex-wrap gap-4 border-t border-slate-100 pt-4">
                {listing.bedrooms != null && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <BedDouble className="h-4 w-4 text-slate-400" /> {listing.bedrooms} BHK
                  </div>
                )}
                {listing.bathrooms != null && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Bath className="h-4 w-4 text-slate-400" /> {listing.bathrooms} Bath
                  </div>
                )}
                {listing.area_sqft && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Maximize className="h-4 w-4 text-slate-400" /> {listing.area_sqft} sqft
                  </div>
                )}
                {listing.floor_number != null && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Building2 className="h-4 w-4 text-slate-400" />
                    Floor {listing.floor_number}{listing.total_floors ? `/${listing.total_floors}` : ""}
                  </div>
                )}
                {listing.furnishing && (
                  <div className="flex items-center gap-2 text-sm capitalize text-slate-600">
                    <Maximize className="h-4 w-4 text-slate-400" />
                    {listing.furnishing === "semi" ? "Semi-Furnished" : listing.furnishing === "fully" ? "Fully Furnished" : "Unfurnished"}
                  </div>
                )}
                {listing.facing && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Compass className="h-4 w-4 text-slate-400" /> {listing.facing}
                  </div>
                )}
                {listing.parking > 0 && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Car className="h-4 w-4 text-slate-400" /> {listing.parking} Parking
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h2 className="mb-3 text-lg font-semibold text-slate-900">Description</h2>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
                {listing.ai_description || listing.description || "No description available."}
              </p>
            </div>

            {/* Highlights */}
            {listing.ai_highlights.length > 0 && (
              <div className="rounded-xl border border-slate-200 bg-white p-6">
                <h2 className="mb-3 text-lg font-semibold text-slate-900">Key Highlights</h2>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {listing.ai_highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Amenities */}
            {listing.amenities.length > 0 && (
              <div className="rounded-xl border border-slate-200 bg-white p-6">
                <h2 className="mb-3 text-lg font-semibold text-slate-900">Amenities</h2>
                <div className="flex flex-wrap gap-2">
                  {listing.amenities.map((a) => (
                    <span
                      key={a}
                      className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar — Lead Capture Form */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 rounded-xl border border-slate-200 bg-white p-6">
              {submitted ? (
                <div className="py-8 text-center">
                  <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
                  <h3 className="mt-3 text-lg font-semibold text-slate-900">Thank You!</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Your inquiry has been submitted. The agent will contact you shortly.
                  </p>
                </div>
              ) : (
                <>
                  <h3 className="text-lg font-semibold text-slate-900">Interested?</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Fill in your details and the agent will get in touch.
                  </p>

                  <form onSubmit={handleSubmit} className="mt-4 space-y-3">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">
                        Name *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                          placeholder="Your name"
                          className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">
                        Phone *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                          placeholder="+91 98765 43210"
                          className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">
                        Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                          placeholder="you@email.com"
                          className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">
                        Message
                      </label>
                      <div className="relative">
                        <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <textarea
                          value={formData.message}
                          onChange={(e) => setFormData((p) => ({ ...p, message: e.target.value }))}
                          placeholder="I'm interested in this property..."
                          rows={3}
                          className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                        />
                      </div>
                    </div>

                    {error && (
                      <p className="text-sm text-red-500">{error}</p>
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                    >
                      {submitting ? "Submitting..." : "Send Inquiry"}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-200 bg-white py-6">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm text-slate-400">
          Powered by {listing.org_name}
        </div>
      </footer>
    </div>
  );
}
