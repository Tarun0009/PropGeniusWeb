"use client";

import { useState } from "react";
import { Check, Pencil, Shield, UserX, UserCheck, Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { BillingInfo } from "@/components/billing/billing-info";
import { PlanSelector } from "@/components/billing/plan-selector";
import { useAuthStore } from "@/stores/auth-store";
import { useNotificationStore } from "@/stores/notification-store";
import { useTeamMembers, useUpdateMemberRole, useToggleMemberStatus } from "@/hooks/use-team";
import { createClient } from "@/lib/supabase/client";
import { USER_ROLES, PLAN_LIMITS } from "@/lib/constants";
import type { Plan } from "@/types/user";
import { formatRelativeTime } from "@/lib/utils";

const SETTINGS_TABS = [
  { value: "general", label: "General" },
  { value: "team", label: "Team" },
  { value: "billing", label: "Billing" },
];

const roleVariant: Record<string, "primary" | "purple" | "default"> = {
  owner: "primary",
  admin: "purple",
  agent: "default",
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const profile = useAuthStore((s) => s.profile);
  const setProfile = useAuthStore((s) => s.setProfile);
  const addToast = useNotificationStore((s) => s.addToast);
  const currentPlan = (profile?.organization?.plan || "free") as Plan;

  // General tab state
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [orgName, setOrgName] = useState(profile?.organization?.name || "");

  // Team tab state
  const { data: teamMembers = [], isLoading: teamLoading } = useTeamMembers();
  const updateRoleMutation = useUpdateMemberRole();
  const toggleStatusMutation = useToggleMemberStatus();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("agent");

  const planLimits = PLAN_LIMITS[currentPlan];
  const activeMembers = teamMembers.filter((m) => m.is_active).length;
  const canAddMore = planLimits.maxAgents === -1 || activeMembers < planLimits.maxAgents;
  const isOwnerOrAdmin = profile?.role === "owner" || profile?.role === "admin";

  const handleSave = async () => {
    if (!profile) return;
    setIsSaving(true);

    try {
      const supabase = createClient();

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ full_name: fullName, phone: phone || null, updated_at: new Date().toISOString() })
        .eq("id", profile.id);

      if (profileError) throw profileError;

      if (orgName && orgName !== profile.organization?.name) {
        const { error: orgError } = await supabase
          .from("organizations")
          .update({ name: orgName, updated_at: new Date().toISOString() })
          .eq("id", profile.organization_id);

        if (orgError) throw orgError;
      }

      setProfile({
        ...profile,
        full_name: fullName,
        phone: phone || null,
        organization: profile.organization
          ? { ...profile.organization, name: orgName || profile.organization.name }
          : undefined,
      });

      setIsEditing(false);
      addToast({ type: "success", title: "Profile updated successfully" });
    } catch (error) {
      addToast({ type: "error", title: "Failed to update profile", description: (error as Error).message });
    } finally {
      setIsSaving(false);
    }
  };

  const startEditing = () => {
    setFullName(profile?.full_name || "");
    setPhone(profile?.phone || "");
    setOrgName(profile?.organization?.name || "");
    setIsEditing(true);
  };

  const handleInvite = () => {
    if (!inviteEmail.trim()) return;
    addToast({
      type: "info",
      title: "Invite link ready",
      description: `Share the signup URL with ${inviteEmail}. They will join as ${inviteRole}.`,
    });
    setShowInviteModal(false);
    setInviteEmail("");
  };

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
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Organization</CardTitle>
                  {profile && !isEditing && (
                    <Button variant="outline" size="sm" onClick={startEditing}>
                      <Pencil className="mr-1.5 h-3.5 w-3.5" />
                      Edit
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {profile ? (
                  isEditing ? (
                    <div className="space-y-4">
                      <Input label="Organization Name" value={orgName} onChange={(e) => setOrgName(e.target.value)} />
                      <Input label="Your Name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                      <div>
                        <p className="mb-1.5 text-sm font-medium text-slate-700">Email</p>
                        <p className="text-sm text-slate-500">{profile.email}</p>
                        <p className="mt-0.5 text-xs text-slate-400">Email cannot be changed</p>
                      </div>
                      <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. +91 98765 43210" />
                      <div>
                        <p className="mb-1.5 text-sm font-medium text-slate-700">Role</p>
                        <p className="text-sm capitalize text-slate-500">{profile.role}</p>
                      </div>
                      <div className="flex items-center gap-3 pt-2">
                        <Button size="sm" onClick={handleSave} isLoading={isSaving} disabled={isSaving}>
                          <Check className="mr-1.5 h-3.5 w-3.5" /> Save Changes
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setIsEditing(false)} disabled={isSaving}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-slate-500">Organization Name</p>
                        <p className="text-sm font-medium text-slate-900">{profile.organization?.name || "—"}</p>
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
                        <p className="text-xs text-slate-500">Phone</p>
                        <p className="text-sm font-medium text-slate-900">{profile.phone || "—"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Role</p>
                        <p className="text-sm font-medium capitalize text-slate-900">{profile.role}</p>
                      </div>
                    </div>
                  )
                ) : (
                  <Spinner />
                )}
              </CardContent>
            </Card>
          </div>
        ) : activeTab === "team" ? (
          <div className="space-y-6">
            {/* Team Header */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Team Members</CardTitle>
                    <p className="mt-1 text-xs text-slate-500">
                      {activeMembers} of {planLimits.maxAgents === -1 ? "unlimited" : planLimits.maxAgents} seats used
                      <span className="ml-1 capitalize">({currentPlan} plan)</span>
                    </p>
                  </div>
                  {isOwnerOrAdmin && (
                    <Button
                      size="sm"
                      onClick={() => setShowInviteModal(true)}
                      disabled={!canAddMore}
                    >
                      <Plus className="mr-1.5 h-3.5 w-3.5" />
                      {canAddMore ? "Invite Member" : "Upgrade Plan"}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {teamLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Spinner />
                  </div>
                ) : teamMembers.length === 0 ? (
                  <p className="px-5 py-8 text-center text-sm text-slate-400">No team members yet</p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {teamMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between px-5 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar name={member.full_name} size="sm" />
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-slate-900">
                                {member.full_name}
                                {member.id === profile?.id && (
                                  <span className="ml-1 text-xs text-slate-400">(you)</span>
                                )}
                              </p>
                              {!member.is_active && (
                                <Badge variant="danger" size="sm">Inactive</Badge>
                              )}
                            </div>
                            <p className="text-xs text-slate-500">{member.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={roleVariant[member.role] || "default"} size="sm">
                            <Shield className="mr-1 h-3 w-3" />
                            {USER_ROLES.find((r) => r.value === member.role)?.label || member.role}
                          </Badge>
                          {isOwnerOrAdmin && member.id !== profile?.id && (
                            <div className="flex items-center gap-1">
                              <Select
                                options={USER_ROLES.filter((r) => r.value !== "owner").map((r) => ({ value: r.value, label: r.label }))}
                                value={member.role}
                                onChange={(e) => updateRoleMutation.mutate({ memberId: member.id, role: e.target.value })}
                                className="w-24 text-xs"
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleStatusMutation.mutate({ memberId: member.id, isActive: !member.is_active })}
                                title={member.is_active ? "Deactivate" : "Activate"}
                              >
                                {member.is_active ? (
                                  <UserX className="h-4 w-4 text-slate-400" />
                                ) : (
                                  <UserCheck className="h-4 w-4 text-green-500" />
                                )}
                              </Button>
                            </div>
                          )}
                          <span className="text-[10px] text-slate-400">
                            Joined {formatRelativeTime(member.created_at)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Plan Limits Info */}
            {!canAddMore && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 rounded-lg border border-warning-200 bg-warning-50 p-4">
                    <Shield className="h-5 w-5 text-warning-600" />
                    <div>
                      <p className="text-sm font-medium text-warning-800">Team limit reached</p>
                      <p className="text-xs text-warning-700">
                        Your {currentPlan} plan supports up to {planLimits.maxAgents} team member(s).
                        Upgrade to add more agents.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
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

      {/* Invite Modal */}
      <Modal isOpen={showInviteModal} onClose={() => setShowInviteModal(false)} title="Invite Team Member" size="sm">
        <div className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="agent@company.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
          />
          <Select
            label="Role"
            options={USER_ROLES.filter((r) => r.value !== "owner").map((r) => ({ value: r.value, label: r.label }))}
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value)}
          />
          <div className="flex justify-end gap-3">
            <Button variant="outline" size="sm" onClick={() => setShowInviteModal(false)}>Cancel</Button>
            <Button size="sm" onClick={handleInvite} disabled={!inviteEmail.trim()}>
              Send Invite
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
