import React from "react";
import Image from "next/image";
import { cn, getInitials } from "@/lib/utils";

const sizeStyles = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
} as const;

const sizePx = { sm: 32, md: 40, lg: 48 } as const;

export interface AvatarProps {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

function Avatar({ src, alt, name, size = "md", className }: AvatarProps) {
  const initials = name ? getInitials(name) : "?";

  return (
    <div
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-100 font-medium text-primary-700",
        sizeStyles[size],
        className
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={alt || name || "Avatar"}
          width={sizePx[size]}
          height={sizePx[size]}
          className="h-full w-full object-cover"
          unoptimized
        />
      ) : (
        <span aria-label={name || "Avatar"}>{initials}</span>
      )}
    </div>
  );
}

export { Avatar };
