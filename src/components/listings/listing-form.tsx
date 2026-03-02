"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AmenityPicker } from "./amenity-picker";
import { ImageUploader } from "./image-uploader";
import { AIGenerator } from "./ai-generator";
import { useCreateListing, useUpdateListing } from "@/hooks/use-listings";
import {
  listingFormSchema,
  type ListingFormData,
  type AIListingContent,
  type GenerateListingRequest,
} from "@/lib/validations";
import {
  PROPERTY_TYPES,
  TRANSACTION_TYPES,
  FURNISHING_OPTIONS,
  INDIAN_STATES,
} from "@/lib/constants";
import type { Listing } from "@/types/listing";

const STEPS = [
  { label: "Basics", description: "Property type & pricing" },
  { label: "Location", description: "Address details" },
  { label: "Details", description: "Specifications" },
  { label: "Images", description: "Photos & media" },
  { label: "AI & Save", description: "Generate & publish" },
];

const PRICE_UNITS = [
  { value: "total", label: "Total Price" },
  { value: "per_sqft", label: "Per Sq.ft." },
  { value: "per_month", label: "Per Month" },
];

const FACING_OPTIONS = [
  { value: "", label: "Select Facing" },
  { value: "North", label: "North" },
  { value: "South", label: "South" },
  { value: "East", label: "East" },
  { value: "West", label: "West" },
  { value: "North-East", label: "North-East" },
  { value: "North-West", label: "North-West" },
  { value: "South-East", label: "South-East" },
  { value: "South-West", label: "South-West" },
];

const STATE_OPTIONS = INDIAN_STATES.map((s) => ({ value: s, label: s }));

interface ListingFormProps {
  listing?: Listing;
}

function ListingForm({ listing }: ListingFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [aiContent, setAIContent] = useState<Partial<AIListingContent> | null>(
    listing?.ai_description
      ? {
          title: listing.title,
          description: listing.ai_description,
          highlights: listing.ai_highlights,
          social_post: listing.ai_social_post || "",
          seo_title: listing.ai_seo_title || "",
          seo_description: listing.ai_seo_description || "",
        }
      : null
  );

  const createMutation = useCreateListing();
  const updateMutation = useUpdateListing();
  const isEditing = !!listing;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<ListingFormData>({
    resolver: zodResolver(listingFormSchema),
    defaultValues: {
      property_type: listing?.property_type || undefined,
      transaction_type: listing?.transaction_type || undefined,
      price: listing?.price || undefined,
      price_unit: listing?.price_unit || "total",
      address: listing?.address || "",
      locality: listing?.locality || "",
      city: listing?.city || "",
      state: listing?.state || "",
      pincode: listing?.pincode || "",
      bedrooms: listing?.bedrooms ?? undefined,
      bathrooms: listing?.bathrooms ?? undefined,
      area_sqft: listing?.area_sqft ?? undefined,
      carpet_area_sqft: listing?.carpet_area_sqft ?? undefined,
      floor_number: listing?.floor_number ?? undefined,
      total_floors: listing?.total_floors ?? undefined,
      furnishing: listing?.furnishing || undefined,
      facing: listing?.facing || "",
      age_years: listing?.age_years ?? undefined,
      parking: listing?.parking ?? 0,
      amenities: listing?.amenities || [],
      images: listing?.images || [],
      floor_plan_url: listing?.floor_plan_url || "",
      title: listing?.title || "",
      description: listing?.description || "",
      ai_description: listing?.ai_description || "",
      ai_social_post: listing?.ai_social_post || "",
      ai_seo_title: listing?.ai_seo_title || "",
      ai_seo_description: listing?.ai_seo_description || "",
      ai_highlights: listing?.ai_highlights || [],
    },
  });

  const watchedValues = watch();

  // Validate current step before advancing
  const stepFields: (keyof ListingFormData)[][] = [
    ["property_type", "transaction_type", "price", "price_unit"],
    ["city", "state"],
    [],
    [],
    ["title"],
  ];

  const goNext = async () => {
    const fieldsToValidate = stepFields[step];
    if (fieldsToValidate.length > 0) {
      const valid = await trigger(fieldsToValidate);
      if (!valid) return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const onSubmit = async (data: ListingFormData) => {
    if (aiContent) {
      data.ai_description = (aiContent.description as string) || "";
      data.ai_social_post = (aiContent.social_post as string) || "";
      data.ai_seo_title = (aiContent.seo_title as string) || "";
      data.ai_seo_description = (aiContent.seo_description as string) || "";
      data.ai_highlights = (aiContent.highlights as string[]) || [];
      if (aiContent.title && !data.title) {
        data.title = aiContent.title;
      }
    }

    if (isEditing) {
      await updateMutation.mutateAsync({ id: listing.id, data });
      router.push(`/listings/${listing.id}`);
    } else {
      const newListing = await createMutation.mutateAsync(data);
      router.push(`/listings/${newListing.id}`);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  // Build property data for AI generator
  const propertyDataForAI: GenerateListingRequest = {
    property_type: watchedValues.property_type,
    transaction_type: watchedValues.transaction_type,
    price: watchedValues.price || 0,
    locality: watchedValues.locality,
    city: watchedValues.city || "",
    state: watchedValues.state || "",
    bedrooms: watchedValues.bedrooms,
    bathrooms: watchedValues.bathrooms,
    area_sqft: watchedValues.area_sqft,
    carpet_area_sqft: watchedValues.carpet_area_sqft,
    floor_number: watchedValues.floor_number,
    total_floors: watchedValues.total_floors,
    furnishing: watchedValues.furnishing,
    facing: watchedValues.facing,
    amenities: watchedValues.amenities,
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Step Indicator */}
      <nav className="flex items-center justify-between">
        {STEPS.map((s, i) => (
          <div key={i} className="flex flex-1 items-center">
            <button
              type="button"
              onClick={() => i < step && setStep(i)}
              className={cn(
                "flex items-center gap-2",
                i <= step ? "cursor-pointer" : "cursor-default"
              )}
            >
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium",
                  i < step
                    ? "bg-primary-600 text-white"
                    : i === step
                      ? "border-2 border-primary-600 text-primary-600"
                      : "border-2 border-slate-200 text-slate-400"
                )}
              >
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </span>
              <div className="hidden sm:block">
                <p
                  className={cn(
                    "text-sm font-medium",
                    i <= step ? "text-slate-900" : "text-slate-400"
                  )}
                >
                  {s.label}
                </p>
              </div>
            </button>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "mx-2 h-px flex-1",
                  i < step ? "bg-primary-600" : "bg-slate-200"
                )}
              />
            )}
          </div>
        ))}
      </nav>

      {/* Step Content */}
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        {/* Step 1: Basics */}
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Basic Information
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Property Type"
                options={PROPERTY_TYPES.map((t) => ({ value: t.value, label: t.label }))}
                placeholder="Select type"
                error={errors.property_type?.message}
                {...register("property_type")}
              />
              <Select
                label="Transaction Type"
                options={TRANSACTION_TYPES.map((t) => ({ value: t.value, label: t.label }))}
                placeholder="Select type"
                error={errors.transaction_type?.message}
                {...register("transaction_type")}
              />
              <Input
                label="Price (₹)"
                type="number"
                placeholder="e.g. 5000000"
                error={errors.price?.message}
                {...register("price", { valueAsNumber: true })}
              />
              <Select
                label="Price Unit"
                options={PRICE_UNITS}
                error={errors.price_unit?.message}
                {...register("price_unit")}
              />
            </div>
          </div>
        )}

        {/* Step 2: Location */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Location</h2>
            <Input
              label="Address"
              placeholder="Building name, street"
              {...register("address")}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Locality / Area"
                placeholder="e.g. Whitefield"
                {...register("locality")}
              />
              <Input
                label="City"
                placeholder="e.g. Bangalore"
                error={errors.city?.message}
                {...register("city")}
              />
              <Select
                label="State"
                options={STATE_OPTIONS}
                placeholder="Select state"
                error={errors.state?.message}
                {...register("state")}
              />
              <Input
                label="Pincode"
                placeholder="e.g. 560066"
                maxLength={6}
                {...register("pincode")}
              />
            </div>
          </div>
        )}

        {/* Step 3: Details */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Property Details
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Input
                label="Bedrooms (BHK)"
                type="number"
                placeholder="e.g. 3"
                min={0}
                {...register("bedrooms", { valueAsNumber: true })}
              />
              <Input
                label="Bathrooms"
                type="number"
                placeholder="e.g. 2"
                min={0}
                {...register("bathrooms", { valueAsNumber: true })}
              />
              <Input
                label="Area (sq.ft.)"
                type="number"
                placeholder="e.g. 1200"
                {...register("area_sqft", { valueAsNumber: true })}
              />
              <Input
                label="Carpet Area (sq.ft.)"
                type="number"
                placeholder="e.g. 950"
                {...register("carpet_area_sqft", { valueAsNumber: true })}
              />
              <Input
                label="Floor Number"
                type="number"
                placeholder="e.g. 5"
                min={0}
                {...register("floor_number", { valueAsNumber: true })}
              />
              <Input
                label="Total Floors"
                type="number"
                placeholder="e.g. 15"
                min={0}
                {...register("total_floors", { valueAsNumber: true })}
              />
              <Select
                label="Furnishing"
                options={[{ value: "", label: "Select" }, ...FURNISHING_OPTIONS.map((f) => ({ value: f.value, label: f.label }))]}
                {...register("furnishing")}
              />
              <Select
                label="Facing"
                options={FACING_OPTIONS}
                {...register("facing")}
              />
              <Input
                label="Property Age (years)"
                type="number"
                placeholder="e.g. 2"
                min={0}
                {...register("age_years", { valueAsNumber: true })}
              />
              <Input
                label="Parking Spots"
                type="number"
                placeholder="e.g. 1"
                min={0}
                {...register("parking", { valueAsNumber: true })}
              />
            </div>
            <div className="mt-4">
              <AmenityPicker
                value={watchedValues.amenities || []}
                onChange={(amenities) => setValue("amenities", amenities)}
              />
            </div>
          </div>
        )}

        {/* Step 4: Images */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Images & Media
            </h2>
            <ImageUploader
              value={watchedValues.images || []}
              onChange={(urls) => setValue("images", urls)}
              floorPlanUrl={watchedValues.floor_plan_url}
              onFloorPlanChange={(url) => setValue("floor_plan_url", url || "")}
            />
          </div>
        )}

        {/* Step 5: AI Generation & Save */}
        {step === 4 && (
          <div className="space-y-6">
            <AIGenerator
              propertyData={propertyDataForAI}
              value={aiContent}
              onChange={(content) => {
                setAIContent(content);
                setValue("title", content.title);
                setValue("description", content.description);
              }}
              onFieldChange={(field, value) => {
                setAIContent((prev) => (prev ? { ...prev, [field]: value } : null));
                if (field === "title") setValue("title", value as string);
                if (field === "description") setValue("description", value as string);
              }}
            />

            {/* Manual title/description if no AI */}
            {!aiContent && (
              <div className="space-y-4 rounded-lg border border-slate-200 p-4">
                <p className="text-sm text-slate-500">
                  Or enter title and description manually:
                </p>
                <Input
                  label="Listing Title"
                  placeholder="e.g. Spacious 3BHK in Whitefield"
                  error={errors.title?.message}
                  {...register("title")}
                />
                <Textarea
                  label="Description"
                  placeholder="Describe the property..."
                  rows={4}
                  {...register("description")}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={goBack}
          disabled={step === 0}
        >
          Back
        </Button>
        <div className="flex items-center gap-2">
          {step < STEPS.length - 1 ? (
            <Button type="button" onClick={goNext}>
              Next
            </Button>
          ) : (
            <Button type="submit" isLoading={isSaving} disabled={isSaving}>
              {isEditing ? "Update Listing" : "Save Listing"}
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}

export { ListingForm };
