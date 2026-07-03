"use client";

import React, { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-") || generatedId;
    const isPassword = props.type === "password";
    const [showPassword, setShowPassword] = useState(false);
    const inputType = isPassword && showPassword ? "text" : props.type;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "flex h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm transition-all duration-150",
              "placeholder:text-slate-400",
              "focus:outline-none focus:ring-2 focus:ring-offset-0",
              "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-60",
              isPassword && "pr-10",
              error
                ? "border-danger-500 bg-danger-50/50 focus:border-danger-500 focus:ring-danger-500/30"
                : "border-slate-300 focus:border-primary-500 focus:ring-primary-500/25",
              className
            )}
            aria-invalid={error ? "true" : undefined}
            aria-describedby={error ? `${inputId}-error` : undefined}
            {...props}
            type={inputType}
          />
          {isPassword && (
            <button
              type="button"
              className={cn(
                "absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 transition-colors",
                "hover:bg-slate-100 hover:text-slate-700",
                "focus:outline-none focus:ring-2 focus:ring-primary-500/30",
                props.disabled && "pointer-events-none opacity-50"
              )}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-controls={inputId}
              aria-pressed={showPassword}
              disabled={props.disabled}
              onClick={() => setShowPassword((current) => !current)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          )}
        </div>
        {error && (
          <p
            id={`${inputId}-error`}
            className="mt-1.5 text-sm text-danger-600"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
