"use client";

import React, { useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
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
  Copy,
  Check,
  Link as LinkIcon,
  ExternalLink,
  Plus,
  X,
  Globe,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { Spinner } from "@/components/ui/spinner";
import { Select } from "@/components/ui/select";
import { useListing, useDeleteListing, useUpdateListing, useOptimizeListing } from "@/hooks/use-listings";
import { formatPrice, formatDate, formatRelativeTime } from "@/lib/utils";
import { LISTING_STATUSES, LISTING_PLATFORMS } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import type { ListingStatus } from "@/types/listing";
import type { OptimizeListingResponse } from "@/lib/validations";

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
  const optimizeMutation = useOptimizeListing();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState<ListingStatus>("active");
  const [optimizeData, setOptimizeData] = useState<OptimizeListingResponse | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showAddPlatform, setShowAddPlatform] = useState(false);
  const [newPlatform, setNewPlatform] = useState("");
  const [newPlatformUrl, setNewPlatformUrl] = useState("");

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

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

  const handleOptimize = async () => {
    if (!listing) return;
    const daysActive = Math.floor((Date.now() - new Date(listing.created_at).getTime()) / (1000 * 60 * 60 * 24));

    const result = await optimizeMutation.mutateAsync({
      title: listing.title,
      description: listing.ai_description || listing.description || undefined,
      price: listing.price,
      property_type: listing.property_type,
      city: listing.city,
      bedrooms: listing.bedrooms ?? undefined,
      area_sqft: listing.area_sqft ?? undefined,
      views_count: listing.views_count,
      inquiries_count: listing.inquiries_count,
      days_active: daysActive,
      amenities: listing.amenities.length > 0 ? listing.amenities : undefined,
    });

    setOptimizeData(result);
  };

  const handleStatusChange = async () => {
    await updateMutation.mutateAsync({ id, data: { status: newStatus } as Record<string, unknown> });
    setShowStatusModal(false);
  };

  const handleAddPlatform = useCallback(async () => {
    if (!newPlatform || !listing) return;
    const platforms = [...(listing.published_platforms || [])];
    if (!platforms.includes(newPlatform)) platforms.push(newPlatform);
    const urls = { ...(listing.external_urls || {}) };
    if (newPlatformUrl.trim()) urls[newPlatform] = newPlatformUrl.trim();
    await updateMutation.mutateAsync({
      id,
      data: { published_platforms: platforms, external_urls: urls } as Record<string, unknown>,
    });
    setNewPlatform("");
    setNewPlatformUrl("");
    setShowAddPlatform(false);
  }, [newPlatform, newPlatformUrl, listing, updateMutation, id]);

  const handleRemovePlatform = useCallback(async (platform: string) => {
    if (!listing) return;
    const platforms = (listing.published_platforms || []).filter((p) => p !== platform);
    const urls = { ...(listing.external_urls || {}) };
    delete urls[platform];
    await updateMutation.mutateAsync({
      id,
      data: { published_platforms: platforms, external_urls: urls } as Record<string, unknown>,
    });
  }, [listing, updateMutation, id]);

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
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Share2 className="h-4 w-4 text-info-500" /> Social Media Post
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(listing.ai_social_post!, "social")}
                  >
                    {copiedField === "social" ? (
                      <><Check className="mr-1 h-3.5 w-3.5" /> Copied</>
                    ) : (
                      <><Copy className="mr-1 h-3.5 w-3.5" /> Copy</>
                    )}
                  </Button>
                </div>
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
          {/* Share */}
          <Card>
            <CardContent className="pt-6">
              <h4 className="mb-3 text-sm font-semibold text-slate-900">Share</h4>
              <div className="space-y-2">
                {listing.status === "active" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => copyToClipboard(
                      `${window.location.origin}/p/${listing.id}`,
                      "public_link"
                    )}
                  >
                    {copiedField === "public_link" ? (
                      <><Check className="mr-2 h-4 w-4" /> Copied!</>
                    ) : (
                      <><Globe className="mr-2 h-4 w-4" /> Copy Public Link</>
                    )}
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => copyToClipboard(
                    `${listing.title} - ${formatPrice(listing.price)}\n${[listing.locality, listing.city].filter(Boolean).join(", ")}\n${listing.ai_description?.slice(0, 150) || listing.description?.slice(0, 150) || ""}...\n\n${window.location.origin}/p/${listing.id}`,
                    "whatsapp"
                  )}
                >
                  {copiedField === "whatsapp" ? (
                    <><Check className="mr-2 h-4 w-4" /> Copied!</>
                  ) : (
                    <><MessageSquare className="mr-2 h-4 w-4" /> Copy for WhatsApp</>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => copyToClipboard(window.location.href, "link")}
                >
                  {copiedField === "link" ? (
                    <><Check className="mr-2 h-4 w-4" /> Copied!</>
                  ) : (
                    <><LinkIcon className="mr-2 h-4 w-4" /> Copy Link</>
                  )}
                </Button>
                {listing.ai_social_post && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => copyToClipboard(listing.ai_social_post!, "social_sidebar")}
                  >
                    {copiedField === "social_sidebar" ? (
                      <><Check className="mr-2 h-4 w-4" /> Copied!</>
                    ) : (
                      <><Share2 className="mr-2 h-4 w-4" /> Copy Social Post</>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* External Platforms */}
          <Card>
            <CardContent className="pt-6">
              <div className="mb-3 flex items-center justify-between">
                <h4 className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                  <Globe className="h-4 w-4 text-slate-400" />
                  Published Platforms
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddPlatform(!showAddPlatform)}
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>

              {showAddPlatform && (
                <div className="mb-3 space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <Select
                    label="Platform"
                    value={newPlatform}
                    onChange={(e) => setNewPlatform(e.target.value)}
                    options={[
                      { value: "", label: "Select platform..." },
                      ...LISTING_PLATFORMS.filter(
                        (p) => !(listing.published_platforms || []).includes(p.value)
                      ).map((p) => ({ value: p.value, label: p.label })),
                    ]}
                  />
                  <Input
                    label="URL (optional)"
                    value={newPlatformUrl}
                    onChange={(e) => setNewPlatformUrl(e.target.value)}
                    placeholder="https://..."
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleAddPlatform}
                      disabled={!newPlatform || updateMutation.isPending}
                    >
                      Add
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowAddPlatform(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {listing.published_platforms && listing.published_platforms.length > 0 ? (
                <div className="space-y-2">
                  {listing.published_platforms.map((platform) => {
                    const info = LISTING_PLATFORMS.find((p) => p.value === platform);
                    const url = listing.external_urls?.[platform];
                    return (
                      <div
                        key={platform}
                        className="flex items-center justify-between rounded-md border border-slate-100 bg-slate-50 px-3 py-2"
                      >
                        <div className="flex items-center gap-2">
                          <Badge size="sm" variant="primary">
                            {info?.label || platform}
                          </Badge>
                          {url && (
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary-500 hover:text-primary-700"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          )}
                        </div>
                        <button
                          onClick={() => handleRemovePlatform(platform)}
                          className="rounded p-0.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-400">
                  Track where this listing is published
                </p>
              )}
            </CardContent>
          </Card>

          {/* AI Optimizer — Only for active listings */}
          {listing.status === "active" && (
            <Card>
              <CardContent className="pt-6">
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                    <Sparkles className="h-4 w-4 text-primary-500" />
                    AI Optimizer
                  </h4>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleOptimize}
                    isLoading={optimizeMutation.isPending}
                    disabled={optimizeMutation.isPending}
                  >
                    {optimizeData ? "Re-analyze" : "Optimize"}
                  </Button>
                </div>

                {optimizeData ? (
                  <div className="space-y-3">
                    {/* Score */}
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white ${
                        optimizeData.score >= 8 ? "bg-green-500" :
                        optimizeData.score >= 5 ? "bg-yellow-500" :
                        "bg-red-500"
                      }`}>
                        {optimizeData.score}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-700">Listing Score</p>
                        <p className="text-xs text-slate-500">
                          {optimizeData.score >= 8 ? "Great listing!" :
                           optimizeData.score >= 5 ? "Room for improvement" :
                           "Needs optimization"}
                        </p>
                      </div>
                    </div>

                    {/* Suggestions */}
                    <div className="space-y-2">
                      {optimizeData.suggestions.map((s, i) => (
                        <div key={i} className="rounded-md border border-slate-100 bg-slate-50 p-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-700">{s.area}</span>
                            <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                              s.impact === "high" ? "bg-red-100 text-red-700" :
                              s.impact === "medium" ? "bg-yellow-100 text-yellow-700" :
                              "bg-green-100 text-green-700"
                            }`}>
                              {s.impact}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-slate-500">{s.suggested}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">
                    Get AI suggestions to improve views and inquiries
                  </p>
                )}
              </CardContent>
            </Card>
          )}
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
