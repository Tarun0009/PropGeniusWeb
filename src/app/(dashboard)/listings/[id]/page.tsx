"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  BedDouble,
  Bath,
  Maximize,
  Building2,
  Calendar,
  Eye,
  MessageSquare,
  Edit,
  Trash2,
  Car,
  Compass,
  Clock,
  Sparkles,
  Share2,
  Search,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { Spinner } from "@/components/ui/spinner";
import { Select } from "@/components/ui/select";
import { useListing, useDeleteListing, useUpdateListing } from "@/hooks/use-listings";
import { formatPrice, formatDate, formatRelativeTime } from "@/lib/utils";
import { LISTING_STATUSES } from "@/lib/constants";
import type { ListingStatus } from "@/types/listing";

const statusVariant: Record<string, "default" | "success" | "primary" | "purple" | "warning"> = {
  draft: "default",
  active: "success",
  sold: "primary",
  rented: "purple",
  archived: "default",
};

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: listing, isLoading } = useListing(id);
  const deleteMutation = useDeleteListing();
  const updateMutation = useUpdateListing();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState<ListingStatus>("active");

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

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(id);
    router.push("/listings");
  };

  const handleStatusChange = async () => {
    await updateMutation.mutateAsync({ id, data: { status: newStatus } as Record<string, unknown> });
    setShowStatusModal(false);
  };

  return (
    <div>
      <PageHeader
        title={listing.title}
        breadcrumbs={[
          { label: "Listings", href: "/listings" },
          { label: listing.title },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setNewStatus(listing.status);
                setShowStatusModal(true);
              }}
            >
              Change Status
            </Button>
            <Link href={`/listings/${id}/edit`}>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4" /> Edit
              </Button>
            </Link>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setShowDeleteModal(true)}
            >
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          </div>
        }
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Images */}
          {listing.images.length > 0 && (
            <div className="overflow-hidden rounded-lg border border-slate-200">
              <img
                src={listing.images[0]}
                alt={listing.title}
                className="aspect-video w-full object-cover"
              />
              {listing.images.length > 1 && (
                <div className="grid grid-cols-4 gap-1 p-1">
                  {listing.images.slice(1, 5).map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt={`Photo ${i + 2}`}
                      className="aspect-square w-full rounded object-cover"
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                {listing.ai_description || listing.description || "No description provided."}
              </p>
            </CardContent>
          </Card>

          {/* AI Highlights */}
          {listing.ai_highlights.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-info-500" /> Key Highlights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {listing.ai_highlights.map((h, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-slate-700"
                    >
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500" />
                      {h}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Social Post */}
          {listing.ai_social_post && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="h-4 w-4 text-info-500" /> Social Media Post
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
                  {listing.ai_social_post}
                </p>
              </CardContent>
            </Card>
          )}

          {/* SEO */}
          {(listing.ai_seo_title || listing.ai_seo_description) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-info-500" /> SEO Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-slate-200 p-4">
                  <p className="text-lg font-medium text-primary-700">
                    {listing.ai_seo_title || listing.title}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {listing.ai_seo_description}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Amenities */}
          {listing.amenities.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Amenities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {listing.amenities.map((a) => (
                    <Badge key={a} variant="default" size="md">
                      {a}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Price & Status */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold text-primary-600">
                  {formatPrice(listing.price)}
                </p>
                <Badge
                  variant={statusVariant[listing.status] || "default"}
                  size="md"
                >
                  {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                </Badge>
              </div>
              <p className="mt-1 text-sm capitalize text-slate-500">
                {listing.property_type} for {listing.transaction_type}
              </p>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardContent className="pt-6">
              <h4 className="mb-3 text-sm font-semibold text-slate-900">
                Location
              </h4>
              <div className="flex items-start gap-2 text-sm text-slate-600">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <span>
                  {[listing.address, listing.locality, listing.city, listing.state]
                    .filter(Boolean)
                    .join(", ")}
                  {listing.pincode && ` - ${listing.pincode}`}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Specifications */}
          <Card>
            <CardContent className="pt-6">
              <h4 className="mb-3 text-sm font-semibold text-slate-900">
                Specifications
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {listing.bedrooms != null && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <BedDouble className="h-4 w-4 text-slate-400" />
                    {listing.bedrooms} BHK
                  </div>
                )}
                {listing.bathrooms != null && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Bath className="h-4 w-4 text-slate-400" />
                    {listing.bathrooms} Bath
                  </div>
                )}
                {listing.area_sqft && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Maximize className="h-4 w-4 text-slate-400" />
                    {listing.area_sqft} sqft
                  </div>
                )}
                {listing.floor_number != null && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Building2 className="h-4 w-4 text-slate-400" />
                    Floor {listing.floor_number}
                    {listing.total_floors ? `/${listing.total_floors}` : ""}
                  </div>
                )}
                {listing.furnishing && (
                  <div className="flex items-center gap-2 text-sm text-slate-600 capitalize">
                    <Maximize className="h-4 w-4 text-slate-400" />
                    {listing.furnishing === "semi"
                      ? "Semi-Furnished"
                      : listing.furnishing === "fully"
                        ? "Fully Furnished"
                        : "Unfurnished"}
                  </div>
                )}
                {listing.facing && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Compass className="h-4 w-4 text-slate-400" />
                    {listing.facing}
                  </div>
                )}
                {listing.parking > 0 && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Car className="h-4 w-4 text-slate-400" />
                    {listing.parking} Parking
                  </div>
                )}
                {listing.age_years != null && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Clock className="h-4 w-4 text-slate-400" />
                    {listing.age_years} yr old
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardContent className="pt-6">
              <h4 className="mb-3 text-sm font-semibold text-slate-900">
                Performance
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-slate-500">
                    <Eye className="h-4 w-4" /> Views
                  </span>
                  <span className="font-medium text-slate-900">
                    {listing.views_count}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-slate-500">
                    <MessageSquare className="h-4 w-4" /> Inquiries
                  </span>
                  <span className="font-medium text-slate-900">
                    {listing.inquiries_count}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-slate-500">
                    <Calendar className="h-4 w-4" /> Created
                  </span>
                  <span className="text-slate-600">
                    {formatDate(listing.created_at)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-slate-500">
                    <Calendar className="h-4 w-4" /> Updated
                  </span>
                  <span className="text-slate-600">
                    {formatRelativeTime(listing.updated_at)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Listing"
        size="sm"
      >
        <p className="text-sm text-slate-600">
          Are you sure you want to delete &quot;{listing.title}&quot;? This
          action cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDeleteModal(false)}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleDelete}
            isLoading={deleteMutation.isPending}
          >
            Delete
          </Button>
        </div>
      </Modal>

      {/* Status Change Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title="Change Status"
        size="sm"
      >
        <Select
          label="New Status"
          options={LISTING_STATUSES.map((s) => ({ value: s.value, label: s.label }))}
          value={newStatus}
          onChange={(e) => setNewStatus(e.target.value as ListingStatus)}
        />
        <div className="mt-6 flex justify-end gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowStatusModal(false)}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleStatusChange}
            isLoading={updateMutation.isPending}
          >
            Update Status
          </Button>
        </div>
      </Modal>
    </div>
  );
}
