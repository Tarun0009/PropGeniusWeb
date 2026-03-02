"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div>
      <PageHeader
        title="Something went wrong"
        description="An error occurred while loading this page"
      />
      <div className="mt-6">
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-danger-50">
              <AlertTriangle className="h-7 w-7 text-danger-500" />
            </div>
            <p className="max-w-md text-center text-sm text-slate-500">
              {error.message || "An unexpected error occurred. Please try again."}
            </p>
            <div className="mt-6 flex items-center gap-3">
              <Button variant="outline" onClick={reset}>
                Try again
              </Button>
              <Link href="/dashboard">
                <Button>Back to Dashboard</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
