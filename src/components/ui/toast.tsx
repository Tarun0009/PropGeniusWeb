"use client";

import React from "react";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useNotificationStore,
  type ToastType,
} from "@/stores/notification-store";

const typeStyles: Record<ToastType, string> = {
  success: "border-success-200 bg-white",
  error:   "border-danger-200 bg-white",
  warning: "border-warning-200 bg-white",
  info:    "border-info-200 bg-white",
};

const typeIconBg: Record<ToastType, string> = {
  success: "bg-success-50 text-success-600",
  error:   "bg-danger-50 text-danger-600",
  warning: "bg-warning-50 text-warning-600",
  info:    "bg-info-50 text-info-600",
};

const typeIconStyles: Record<ToastType, string> = {
  success: "text-success-600",
  error: "text-danger-600",
  warning: "text-warning-600",
  info: "text-info-600",
};

const typeIcons: Record<ToastType, React.ElementType> = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

function ToastContainer() {
  const { toasts, removeToast } = useNotificationStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2.5">
      {toasts.map((toast) => {
        const Icon = typeIcons[toast.type];
        return (
          <div
            key={toast.id}
            className={cn(
              "flex w-85 items-start gap-3 rounded-xl border bg-white p-4 shadow-[0_8px_30px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.06)]",
              typeStyles[toast.type]
            )}
            role="alert"
          >
            <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", typeIconBg[toast.type])}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <p className="text-[13px] font-semibold text-slate-900">
                {toast.title}
              </p>
              {toast.description && (
                <p className="mt-0.5 text-[12px] text-slate-500 leading-relaxed">
                  {toast.description}
                </p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 rounded-md p-1 text-slate-300 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              aria-label="Dismiss"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export { ToastContainer };
