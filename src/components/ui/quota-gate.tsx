"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuotaGateProps {
  canCreate: boolean;
  current: number;
  max: number;
  entityName: string;
  children: React.ReactNode;
}

function QuotaGate({ canCreate, current, max, entityName, children }: QuotaGateProps) {
  if (canCreate) return <>{children}</>;

  return (
    <div className="relative">
      <div className="pointer-events-none opacity-50">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="rounded-lg border border-warning-200 bg-warning-50 px-4 py-2 shadow-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning-600" />
            <span className="text-xs font-medium text-warning-800">
              {max === -1 ? `${entityName} limit reached` : `${current}/${max} ${entityName} used`}
            </span>
            <Link href="/settings?tab=billing">
              <Button size="sm" className="ml-2 h-6 text-[10px]">Upgrade</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export { QuotaGate };
