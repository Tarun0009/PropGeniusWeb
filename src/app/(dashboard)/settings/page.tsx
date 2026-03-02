"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { Spinner } from "@/components/ui/spinner";
import { BillingInfo } from "@/components/billing/billing-info";
import { PlanSelector } from "@/components/billing/plan-selector";
import { useAuthStore } from "@/stores/auth-store";

const SETTINGS_TABS = [
  { value: "general", label: "General" },
  { value: "billing", label: "Billing" },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const profile = useAuthStore((s) => s.profile);
  const currentPlan = profile?.organization?.plan || "free";

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Manage your account and preferences"
      />

      <div className="mt-4">
        <Tabs tabs={SETTINGS_TABS} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      <div className="mt-6">
        {activeTab === "general" ? (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Organization</CardTitle>
              </CardHeader>
              <CardContent>
                {profile ? (
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-slate-500">Organization Name</p>
                      <p className="text-sm font-medium text-slate-900">
                        {profile.organization?.name || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Your Name</p>
                      <p className="text-sm font-medium text-slate-900">{profile.full_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Email</p>
                      <p className="text-sm font-medium text-slate-900">{profile.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Role</p>
                      <p className="text-sm font-medium capitalize text-slate-900">{profile.role}</p>
                    </div>
                  </div>
                ) : (
                  <Spinner />
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-8">
            <BillingInfo currentPlan={currentPlan} />

            <div>
              <h2 className="mb-4 text-lg font-semibold text-slate-900">Change Plan</h2>
              <PlanSelector currentPlan={currentPlan} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
