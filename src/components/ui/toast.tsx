"use client";

import React from "react";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useNotificationStore,
  type ToastType,
} from "@/stores/notification-store";

const typeStyles: Record<ToastType, string> = {
  success: "border-success-500 bg-success-50",
  error: "border-danger-500 bg-danger-50",
  warning: "border-warning-500 bg-warning-50",
  info: "border-info-500 bg-info-50",
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
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((toast) => {
        const Icon = typeIcons[toast.type];
        return (
          <div
            key={toast.id}
            className={cn(
              "flex w-80 items-start gap-3 rounded-lg border-l-4 bg-white p-4 shadow-lg",
              typeStyles[toast.type]
            )}
            role="alert"
          >
            <Icon
              className={cn("mt-0.5 h-5 w-5 shrink-0", typeIconStyles[toast.type])}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900">
                {toast.title}
              </p>
              {toast.description && (
                <p className="mt-1 text-sm text-slate-500">
                  {toast.description}
                </p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 rounded-md p-0.5 text-slate-400 hover:text-slate-600 transition-colors"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export { ToastContainer };
