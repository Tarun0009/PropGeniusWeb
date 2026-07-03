"use client";

import React, { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { Upload, X, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Spinner } from "@/components/ui/spinner";

const MAX_IMAGES = 20;

interface ImageUploaderProps {
  value: string[];
  onChange: (urls: string[]) => void;
  floorPlanUrl?: string;
  onFloorPlanChange?: (url: string | undefined) => void;
}

function ImageUploader({ value, onChange, floorPlanUrl, onFloorPlanChange }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const floorPlanInputRef = useRef<HTMLInputElement>(null);

  const uploadFiles = useCallback(
    async (files: FileList, isFloorPlan = false) => {
      if (!isFloorPlan && value.length + files.length > MAX_IMAGES) {
        alert(`Maximum ${MAX_IMAGES} images allowed`);
        return;
      }

      setUploading(true);
      const supabase = createClient();
      const uploadedUrls: string[] = [];

      try {
        for (const file of Array.from(files)) {
          const ext = file.name.split(".").pop();
          const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

          const { error } = await supabase.storage
            .from("listing-images")
            .upload(path, file);

          if (error) throw error;

          const { data: urlData } = supabase.storage
            .from("listing-images")
            .getPublicUrl(path);

          uploadedUrls.push(urlData.publicUrl);
        }

        if (isFloorPlan) {
          onFloorPlanChange?.(uploadedUrls[0]);
        } else {
          onChange([...value, ...uploadedUrls]);
        }
      } catch (err) {
        console.error("Upload error:", err);
        alert("Failed to upload image. Please try again.");
      } finally {
        setUploading(false);
      }
    },
    [value, onChange, onFloorPlanChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer.files.length > 0) {
        uploadFiles(e.dataTransfer.files);
      }
    },
    [uploadFiles]
  );

  const removeImage = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="w-full space-y-4">
      {/* Property Images */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Property Images ({value.length}/{MAX_IMAGES})
        </label>

        {/* Drop Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors",
            "border-slate-300 hover:border-primary-400 hover:bg-primary-50/50",
            uploading && "pointer-events-none opacity-60"
          )}
        >
          {uploading ? (
            <>
              <Spinner size="md" />
              <p className="mt-2 text-sm text-slate-500">Uploading...</p>
            </>
          ) : (
            <>
              <Upload className="h-8 w-8 text-slate-400" />
              <p className="mt-2 text-sm font-medium text-slate-600">
                Drop images here or click to browse
              </p>
              <p className="mt-1 text-xs text-slate-400">
                JPG, PNG, WebP up to 5MB each
              </p>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.length) uploadFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </div>

        {/* Thumbnails */}
        {value.length > 0 && (
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
            {value.map((url, index) => (
              <div
                key={url}
                className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200"
              >
                <Image
                  src={url}
                  alt={`Property image ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 33vw, 16vw"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floor Plan */}
      {onFloorPlanChange && (
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Floor Plan (optional)
          </label>
          {floorPlanUrl ? (
            <div className="group relative inline-block overflow-hidden rounded-lg border border-slate-200">
              <Image
                src={floorPlanUrl}
                alt="Floor plan"
                width={200}
                height={128}
                className="h-32 w-auto object-contain"
              />
              <button
                type="button"
                onClick={() => onFloorPlanChange(undefined)}
                className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => floorPlanInputRef.current?.click()}
              className="flex w-48 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 p-4 transition-colors hover:border-primary-400"
            >
              <ImageIcon className="h-6 w-6 text-slate-400" />
              <p className="mt-1 text-xs text-slate-500">Upload floor plan</p>
              <input
                ref={floorPlanInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.length) uploadFiles(e.target.files, true);
                  e.target.value = "";
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export { ImageUploader };
