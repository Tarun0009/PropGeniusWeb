import React from "react";
import { cn } from "@/lib/utils";
import { Breadcrumb, type BreadcrumbItem } from "./breadcrumb";

export interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  className?: string;
}

function PageHeader({
  title,
  description,
  actions,
  breadcrumbs,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("mb-6 pb-5 border-b border-slate-200/60", className)}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumb items={breadcrumbs} className="mb-3" />
      )}
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-[22px] font-bold tracking-tight text-slate-900 leading-tight">
            {title}
          </h1>
          {description && (
            <p className="mt-0.5 text-[13px] text-slate-500">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex shrink-0 items-center gap-2">{actions}</div>
        )}
      </div>
    </div>
  );
}

export { PageHeader };
