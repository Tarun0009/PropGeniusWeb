"use client";

import { cn } from "@/lib/utils";

const AMENITIES = [
  "Gym",
  "Swimming Pool",
  "Garden",
  "Clubhouse",
  "Power Backup",
  "Lift",
  "Security",
  "Parking",
  "Children's Play Area",
  "Jogging Track",
  "Indoor Games",
  "Intercom",
  "Rain Water Harvesting",
  "Fire Safety",
  "CCTV",
  "Visitor Parking",
  "Gas Pipeline",
  "Wi-Fi",
  "Servant Room",
  "Vastu Compliant",
];

interface AmenityPickerProps {
  value: string[];
  onChange: (amenities: string[]) => void;
}

function AmenityPicker({ value, onChange }: AmenityPickerProps) {
  const toggle = (amenity: string) => {
    if (value.includes(amenity)) {
      onChange(value.filter((a) => a !== amenity));
    } else {
      onChange([...value, amenity]);
    }
  };

  return (
    <div className="w-full">
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        Amenities
      </label>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {AMENITIES.map((amenity) => {
          const selected = value.includes(amenity);
          return (
            <button
              key={amenity}
              type="button"
              onClick={() => toggle(amenity)}
              className={cn(
                "rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                selected
                  ? "border-primary-500 bg-primary-50 text-primary-700"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              )}
            >
              <span className="flex items-center gap-2">
                <span
                  className={cn(
                    "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                    selected
                      ? "border-primary-500 bg-primary-500 text-white"
                      : "border-slate-300"
                  )}
                >
                  {selected && (
                    <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M10 3L4.5 8.5L2 6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </span>
                {amenity}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { AmenityPicker };
