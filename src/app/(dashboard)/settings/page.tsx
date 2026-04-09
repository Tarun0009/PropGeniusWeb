"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import { Check, Pencil, Shield, UserX, UserCheck, Plus, Camera, Lock, Landmark, KeyRound, AlertTriangle, LogOut, Mail, Trash2, Crown, Clock, X } from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/stores/auth-store";
import { useNotificationStore } from "@/stores/notification-store";
import {
  useTeamMembers, useUpdateMemberRole, useToggleMemberStatus,
  useRemoveMember, useRevokeInvite, usePendingInvites,
  useTransferOwnership, useTeamPermissions,
} from "@/hooks/use-team";
import { useTeamMemberStats } from "@/hooks/use-team-stats";
import { createClient } from "@/lib/supabase/client";
import { USER_ROLES, PLAN_LIMITS } from "@/lib/constants";
import { canManageOrg, canManageTeam, canManageBilling } from "@/lib/permissions";
import { useQuota } from "@/hooks/use-quota";
import type { Plan } from "@/types/user";
import { formatRelativeTime } from "@/lib/utils";
import { useRouter } from "next/navigation";

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

  const userCanManageOrg = canManageOrg(profile?.role || "agent");
  const userCanManageTeam = canManageTeam(profile?.role || "agent");
  const userCanManageBilling = canManageBilling(profile?.role || "agent");

  const router = useRouter();

  // Dynamic tabs based on role
  const visibleTabs = useMemo(() => {
    const tabs = [
      { value: "general", label: "General" },
      { value: "team", label: "Team" },
    ];
    if (userCanManageBilling) {
      tabs.push({ value: "billing", label: "Billing" });
    }
    tabs.push({ value: "security", label: "Security" });
    return tabs;
  }, [userCanManageBilling]);

  // Profile edit state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profileErrors, setProfileErrors] = useState<{ fullName?: string; phone?: string }>({});

  // Organization edit state
  const [isEditingOrg, setIsEditingOrg] = useState(false);
  const [isSavingOrg, setIsSavingOrg] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [orgName, setOrgName] = useState(profile?.organization?.name || "");
  const [orgEmail, setOrgEmail] = useState(profile?.organization?.email || "");
  const [orgPhone, setOrgPhone] = useState(profile?.organization?.phone || "");
  const [orgAddress, setOrgAddress] = useState(profile?.organization?.address || "");
  const [orgCity, setOrgCity] = useState(profile?.organization?.city || "");
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Team tab state
  const { data: teamMembers = [], isLoading: teamLoading } = useTeamMembers();
  const { data: teamStats } = useTeamMemberStats();
  const { data: pendingInvites = [], isLoading: invitesLoading } = usePendingInvites();
  const updateRoleMutation = useUpdateMemberRole();
  const toggleStatusMutation = useToggleMemberStatus();
  const removeMembers = useRemoveMember();
  const revokeInviteMutation = useRevokeInvite();
  const transferOwnership = useTransferOwnership();
  const { isOwner } = useTeamPermissions();

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("agent");
  const [isInviting, setIsInviting] = useState(false);
  const [inviteSent, setInviteSent] = useState(false);

  // Remove member modal state
  const [removeMemberId, setRemoveMemberId] = useState<string | null>(null);
  const [reassignLeadsTo, setReassignLeadsTo] = useState("");
  const [removeMemberLeadCount, setRemoveMemberLeadCount] = useState<number | null>(null);
  const removeMember = removeMemberId ? teamMembers.find((m) => m.id === removeMemberId) : null;

  useEffect(() => {
    if (!removeMemberId) { setRemoveMemberLeadCount(null); return; }
    const supabase = createClient();
    supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("assigned_to", removeMemberId)
      .then(({ count }) => setRemoveMemberLeadCount(count ?? 0));
  }, [removeMemberId]);

  // Ownership transfer modal state
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferToId, setTransferToId] = useState("");
  const [transferConfirmText, setTransferConfirmText] = useState("");

  // Security tab state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  // Quota data for usage display
  const { data: quota } = useQuota();

  const planLimits = PLAN_LIMITS[currentPlan];
  const activeMembers = teamMembers.filter((m) => m.is_active).length;
  const canAddMore = (planLimits.maxAgents as number) === -1 || activeMembers < planLimits.maxAgents;

  // --- Profile Handlers ---

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      addToast({ type: "error", title: "Invalid file type", description: "Use JPEG, PNG, or WebP images." });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      addToast({ type: "error", title: "File too large", description: "Maximum 2MB allowed." });
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const res = await fetch("/api/profile/avatar", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setProfile({ ...profile, avatar_url: data.avatar_url });
      addToast({ type: "success", title: "Avatar updated" });
    } catch (error) {
      addToast({ type: "error", title: "Failed to upload avatar", description: (error as Error).message });
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const validateProfile = () => {
    const errs: { fullName?: string; phone?: string } = {};
    if (!fullName.trim()) errs.fullName = "Name is required";
    if (phone && !/^\+?[\d\s-]{7,15}$/.test(phone)) errs.phone = "Invalid phone number";
    setProfileErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const startEditingProfile = () => {
    setFullName(profile?.full_name || "");
    setPhone(profile?.phone || "");
    setIsEditingProfile(true);
  };

  const handleSaveProfile = async () => {
    if (!profile || !validateProfile()) return;
    setIsSavingProfile(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: fullName, phone: phone || null, updated_at: new Date().toISOString() })
        .eq("id", profile.id);
      if (error) throw error;

      setProfile({ ...profile, full_name: fullName, phone: phone || null });
      setIsEditingProfile(false);
      addToast({ type: "success", title: "Profile updated" });
    } catch (error) {
      addToast({ type: "error", title: "Failed to update profile", description: (error as Error).message });
    } finally {
      setIsSavingProfile(false);
    }
  };

  // --- Organization Handlers ---

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile?.organization) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      addToast({ type: "error", title: "Invalid file type", description: "Use JPEG, PNG, or WebP images." });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      addToast({ type: "error", title: "File too large", description: "Maximum 2MB allowed." });
      return;
    }

    setIsUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append("logo", file);
      const res = await fetch("/api/organization/logo", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setProfile({ ...profile, organization: { ...profile.organization, logo_url: data.logo_url } });
      addToast({ type: "success", title: "Logo updated" });
    } catch (error) {
      addToast({ type: "error", title: "Failed to upload logo", description: (error as Error).message });
    } finally {
      setIsUploadingLogo(false);
      if (logoInputRef.current) logoInputRef.current.value = "";
    }
  };

  const startEditingOrg = () => {
    setOrgName(profile?.organization?.name || "");
    setOrgEmail(profile?.organization?.email || "");
    setOrgPhone(profile?.organization?.phone || "");
    setOrgAddress(profile?.organization?.address || "");
    setOrgCity(profile?.organization?.city || "");
    setIsEditingOrg(true);
  };

  const handleSaveOrg = async () => {
    if (!profile?.organization || !userCanManageOrg) return;
    if (!orgName.trim()) {
      addToast({ type: "error", title: "Organization name is required" });
      return;
    }
    setIsSavingOrg(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("organizations")
        .update({
          name: orgName,
          email: orgEmail || null,
          phone: orgPhone || null,
          address: orgAddress || null,
          city: orgCity || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.organization_id);
      if (error) throw error;

      setProfile({
        ...profile,
        organization: {
          ...profile.organization,
          name: orgName,
          email: orgEmail || null,
          phone: orgPhone || null,
          address: orgAddress || null,
          city: orgCity || null,
        },
      });
      setIsEditingOrg(false);
      addToast({ type: "success", title: "Organization updated" });
    } catch (error) {
      addToast({ type: "error", title: "Failed to update organization", description: (error as Error).message });
    } finally {
      setIsSavingOrg(false);
    }
  };

  // --- Security Handlers ---

  const handleChangePassword = async () => {
    setPasswordError(null);
    if (!currentPassword) {
      setPasswordError("Please enter your current password");
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    if (currentPassword === newPassword) {
      setPasswordError("New password must be different from current password");
      return;
    }

    setIsChangingPassword(true);
    try {
      const supabase = createClient();
      // Verify current password first by re-authenticating
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: profile!.email,
        password: currentPassword,
      });
      if (verifyError) {
        setPasswordError("Current password is incorrect");
        setIsChangingPassword(false);
        return;
      }
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      addToast({ type: "success", title: "Password updated successfully" });
    } catch (error) {
      setPasswordError((error as Error).message);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") return;
    try {
      const supabase = createClient();
      // Deactivate profile instead of actual deletion (safer)
      await supabase
        .from("profiles")
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq("id", profile!.id);
      await supabase.auth.signOut();
      router.push("/login");
    } catch (error) {
      addToast({ type: "error", title: "Failed to delete account", description: (error as Error).message });
    }
  };

  // --- Team Handlers ---

  const handleInvite = async () => {
    if (!inviteEmail.trim() || isInviting) return;
    setIsInviting(true);
    try {
      const res = await fetch("/api/team/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send invite");
      setInviteSent(true);
      addToast({
        type: "success",
        title: "Invite sent!",
        description: `An invitation email was sent to ${inviteEmail}.`,
      });
    } catch (err) {
      addToast({
        type: "error",
        title: "Invite failed",
        description: (err as Error).message,
      });
    } finally {
      setIsInviting(false);
    }
  };

  const handleCloseInviteModal = () => {
    setShowInviteModal(false);
    setInviteEmail("");
    setInviteRole("agent");
    setInviteSent(false);
  };

  return (
    <div>
      <PageHeader title="Settings" description="Manage your account and preferences" />

      <div className="mt-4">
        <Tabs tabs={visibleTabs} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      <div className="mt-6">
        {/* ========== GENERAL TAB ========== */}
        {activeTab === "general" ? (
          <div className="space-y-6">
            {/* --- Your Profile Card --- */}
            {profile && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Your Profile</CardTitle>
                    {!isEditingProfile && (
                      <Button variant="outline" size="sm" onClick={startEditingProfile}>
                        <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Avatar section */}
                  <div className="flex items-center gap-5 mb-6 pb-6 border-b border-slate-100">
                    <div className="relative group">
                      <Avatar name={profile.full_name} src={profile.avatar_url} size="lg" className="h-16 w-16 text-lg" />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingAvatar}
                        className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:cursor-wait"
                      >
                        {isUploadingAvatar ? <Spinner className="h-4 w-4 text-white" /> : <Camera className="h-4 w-4 text-white" />}
                      </button>
                      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleAvatarUpload} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{profile.full_name}</p>
                      <p className="text-xs text-slate-500">{profile.email}</p>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingAvatar}
                        className="mt-1.5 text-xs font-medium text-primary-600 hover:text-primary-700 disabled:opacity-50"
                      >
                        {isUploadingAvatar ? "Uploading..." : "Change photo"}
                      </button>
                    </div>
                  </div>

                  {/* Profile fields */}
                  {isEditingProfile ? (
                    <div className="space-y-4">
                      <div>
                        <Input
                          label="Full Name"
                          value={fullName}
                          onChange={(e) => { setFullName(e.target.value); setProfileErrors((p) => ({ ...p, fullName: undefined })); }}
                        />
                        {profileErrors.fullName && <p className="mt-1 text-xs text-danger-500">{profileErrors.fullName}</p>}
                      </div>
                      <div>
                        <p className="mb-1.5 text-sm font-medium text-slate-700">Email</p>
                        <p className="text-sm text-slate-500">{profile.email}</p>
                        <p className="mt-0.5 text-xs text-slate-400">Email cannot be changed</p>
                      </div>
                      <div>
                        <Input
                          label="Phone"
                          value={phone}
                          onChange={(e) => { setPhone(e.target.value); setProfileErrors((p) => ({ ...p, phone: undefined })); }}
                          placeholder="e.g. +91 98765 43210"
                        />
                        {profileErrors.phone && <p className="mt-1 text-xs text-danger-500">{profileErrors.phone}</p>}
                      </div>
                      <div>
                        <p className="mb-1.5 text-sm font-medium text-slate-700">Role</p>
                        <Badge variant={roleVariant[profile.role] || "default"} size="sm">
                          <Shield className="mr-1 h-3 w-3" />
                          <span className="capitalize">{profile.role}</span>
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 pt-2">
                        <Button size="sm" onClick={handleSaveProfile} isLoading={isSavingProfile} disabled={isSavingProfile}>
                          <Check className="mr-1.5 h-3.5 w-3.5" /> Save Changes
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => { setIsEditingProfile(false); setProfileErrors({}); }} disabled={isSavingProfile}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Full Name</p>
                        <p className="mt-0.5 text-[13px] font-medium text-slate-900">{profile.full_name}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Email</p>
                        <p className="mt-0.5 text-[13px] font-medium text-slate-900">{profile.email}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Phone</p>
                        <p className="mt-0.5 text-[13px] font-medium text-slate-900">{profile.phone || "—"}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Role</p>
                        <Badge variant={roleVariant[profile.role] || "default"} size="sm">
                          <Shield className="mr-1 h-3 w-3" />
                          <span className="capitalize">{profile.role}</span>
                        </Badge>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* --- Organization Card --- */}
            {profile?.organization && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Landmark className="h-4 w-4 text-slate-400" />
                      <CardTitle className="text-base">Organization</CardTitle>
                    </div>
                    {userCanManageOrg && !isEditingOrg && (
                      <Button variant="outline" size="sm" onClick={startEditingOrg}>
                        <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Agent restriction notice */}
                  {!userCanManageOrg && (
                    <div className="mb-4 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                      <Lock className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <p className="text-xs text-slate-500">Only owners and admins can edit organization settings.</p>
                    </div>
                  )}

                  {/* Logo section */}
                  <div className="flex items-center gap-5 mb-6 pb-6 border-b border-slate-100">
                    <div className="relative group">
                      {profile.organization.logo_url ? (
                        <Avatar src={profile.organization.logo_url} name={profile.organization.name} size="lg" className="h-16 w-16 text-lg rounded-xl" />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                          <Landmark className="h-7 w-7" />
                        </div>
                      )}
                      {userCanManageOrg && (
                        <button
                          type="button"
                          onClick={() => logoInputRef.current?.click()}
                          disabled={isUploadingLogo}
                          className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:cursor-wait"
                        >
                          {isUploadingLogo ? <Spinner className="h-4 w-4 text-white" /> : <Camera className="h-4 w-4 text-white" />}
                        </button>
                      )}
                      <input ref={logoInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleLogoUpload} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{profile.organization.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="default" size="sm" className="capitalize">{currentPlan} plan</Badge>
                      </div>
                      {userCanManageOrg && (
                        <button
                          type="button"
                          onClick={() => logoInputRef.current?.click()}
                          disabled={isUploadingLogo}
                          className="mt-1.5 text-xs font-medium text-primary-600 hover:text-primary-700 disabled:opacity-50"
                        >
                          {isUploadingLogo ? "Uploading..." : "Change logo"}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Organization fields */}
                  {isEditingOrg && userCanManageOrg ? (
                    <div className="space-y-4">
                      <Input label="Organization Name" value={orgName} onChange={(e) => setOrgName(e.target.value)} />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input label="Email" type="email" value={orgEmail} onChange={(e) => setOrgEmail(e.target.value)} placeholder="contact@company.com" />
                        <Input label="Phone" value={orgPhone} onChange={(e) => setOrgPhone(e.target.value)} placeholder="+91 98765 43210" />
                      </div>
                      <Input label="Address" value={orgAddress} onChange={(e) => setOrgAddress(e.target.value)} placeholder="Office address" />
                      <Input label="City" value={orgCity} onChange={(e) => setOrgCity(e.target.value)} placeholder="e.g. Mumbai" />
                      <div className="flex items-center gap-3 pt-2">
                        <Button size="sm" onClick={handleSaveOrg} isLoading={isSavingOrg} disabled={isSavingOrg}>
                          <Check className="mr-1.5 h-3.5 w-3.5" /> Save Changes
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setIsEditingOrg(false)} disabled={isSavingOrg}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-slate-500">Organization Name</p>
                        <p className="text-sm font-medium text-slate-900">{profile.organization.name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Email</p>
                        <p className="text-sm font-medium text-slate-900">{profile.organization.email || "—"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Phone</p>
                        <p className="text-sm font-medium text-slate-900">{profile.organization.phone || "—"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">City</p>
                        <p className="text-sm font-medium text-slate-900">{profile.organization.city || "—"}</p>
                      </div>
                      <div className="sm:col-span-2">
                        <p className="text-xs text-slate-500">Address</p>
                        <p className="text-sm font-medium text-slate-900">{profile.organization.address || "—"}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* --- Plan & Usage Card --- */}
            {quota && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">Plan & Usage</CardTitle>
                      <Badge variant={currentPlan === "free" ? "default" : currentPlan === "pro" ? "primary" : "purple"} size="sm">
                        {currentPlan === "free" ? "Starter" : currentPlan === "pro" ? "Pro" : "Business"}
                      </Badge>
                    </div>
                    {userCanManageBilling && (
                      <Button variant="outline" size="sm" onClick={() => setActiveTab("billing")}>
                        Manage Billing
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Listings */}
                    <div className="rounded-lg border border-slate-200 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-medium text-slate-500">Listings</p>
                        <p className="text-xs text-slate-400">
                          {quota.listings.current} / {quota.listings.max === -1 ? "Unlimited" : quota.listings.max}
                        </p>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-primary-500 transition-all"
                          style={{ width: quota.listings.max === -1 ? "5%" : `${Math.min((quota.listings.current / quota.listings.max) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                    {/* Leads */}
                    <div className="rounded-lg border border-slate-200 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-medium text-slate-500">Leads</p>
                        <p className="text-xs text-slate-400">
                          {quota.leads.current} / {quota.leads.max === -1 ? "Unlimited" : quota.leads.max}
                        </p>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-info-500 transition-all"
                          style={{ width: quota.leads.max === -1 ? "5%" : `${Math.min((quota.leads.current / quota.leads.max) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                    {/* Agents */}
                    <div className="rounded-lg border border-slate-200 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-medium text-slate-500">Team Members</p>
                        <p className="text-xs text-slate-400">
                          {quota.agents.current} / {(quota.agents.max as number) === -1 ? "Unlimited" : quota.agents.max}
                        </p>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-purple-500 transition-all"
                          style={{ width: (quota.agents.max as number) === -1 ? "5%" : `${Math.min((quota.agents.current / quota.agents.max) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

        /* ========== TEAM TAB ========== */
        ) : activeTab === "team" ? (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Team Members ({teamMembers.length})</CardTitle>
                    <p className="mt-1 text-xs text-slate-500">
                      {activeMembers} of {(planLimits.maxAgents as number) === -1 ? "unlimited" : planLimits.maxAgents} seats used
                      <span className="ml-1">({currentPlan === "free" ? "Starter" : currentPlan === "pro" ? "Pro" : "Business"} plan)</span>
                    </p>
                  </div>
                  {userCanManageTeam && (
                    canAddMore ? (
                      <Button size="sm" onClick={() => setShowInviteModal(true)}>
                        <Plus className="mr-1.5 h-3.5 w-3.5" />
                        Invite Member
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => setActiveTab("billing")}>
                        Upgrade to add more
                      </Button>
                    )
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {teamLoading ? (
                  <div className="divide-y divide-slate-100">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-3 px-5 py-4">
                        <Skeleton variant="circular" className="h-8 w-8 shrink-0" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-3.5 w-36" />
                          <Skeleton className="h-3 w-48" />
                        </div>
                        <Skeleton className="h-6 w-16 rounded-full" />
                      </div>
                    ))}
                  </div>
                ) : teamMembers.length === 0 ? (
                  <p className="px-5 py-8 text-center text-sm text-slate-400">No team members yet</p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {teamMembers.map((member) => (
                      <div key={member.id} className="px-5 py-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 min-w-0">
                            <Avatar name={member.full_name} size="sm" />
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-sm font-medium text-slate-900 truncate">
                                  {member.full_name}
                                  {member.id === profile?.id && <span className="ml-1 text-xs text-slate-400">(you)</span>}
                                </p>
                                <Badge variant={roleVariant[member.role] || "default"} size="sm">
                                  <Shield className="mr-1 h-3 w-3" />
                                  {USER_ROLES.find((r) => r.value === member.role)?.label || member.role}
                                </Badge>
                                {!member.is_active && <Badge variant="danger" size="sm">Inactive</Badge>}
                              </div>
                              <p className="text-xs text-slate-500 truncate">{member.email}</p>
                              {teamStats && (
                                <div className="flex items-center gap-3 mt-0.5">
                                  <span className="text-[11px] text-slate-400">
                                    <Landmark className="mr-0.5 inline h-3 w-3" />
                                    {teamStats.get(member.id)?.listingsCreated ?? 0} listings
                                  </span>
                                  <span className="text-[11px] text-slate-400">
                                    <Shield className="mr-0.5 inline h-3 w-3" />
                                    {teamStats.get(member.id)?.leadsAssigned ?? 0} leads
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          <span className="hidden sm:block text-[10px] text-slate-400 shrink-0 ml-3">
                            Joined {formatRelativeTime(member.created_at)}
                          </span>
                        </div>
                        {/* Admin controls on separate row for clean mobile layout */}
                        {userCanManageTeam && member.id !== profile?.id && member.role !== "owner" && (
                          <div className="flex items-center gap-2 mt-2 ml-11">
                            {/* Role change: owner can change anyone, admin can only change agents */}
                            {(isOwner || member.role === "agent") && (
                              <Select
                                options={USER_ROLES.filter((r) => r.value !== "owner").map((r) => ({ value: r.value, label: r.label }))}
                                value={member.role}
                                onChange={(e) => updateRoleMutation.mutate({ memberId: member.id, role: e.target.value })}
                                className="w-24 text-xs"
                              />
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleStatusMutation.mutate({ memberId: member.id, isActive: !member.is_active })}
                              title={member.is_active ? "Deactivate" : "Activate"}
                            >
                              {member.is_active ? <UserX className="h-4 w-4 text-slate-400" /> : <UserCheck className="h-4 w-4 text-green-500" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => { setRemoveMemberId(member.id); setReassignLeadsTo(""); }}
                              title="Remove member"
                            >
                              <Trash2 className="h-4 w-4 text-danger-400 hover:text-danger-600" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {!canAddMore && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 rounded-lg border border-warning-200 bg-warning-50 p-4">
                    <Shield className="h-5 w-5 text-warning-600" />
                    <div>
                      <p className="text-sm font-medium text-warning-800">Team limit reached</p>
                      <p className="text-xs text-warning-700">
                        Your {currentPlan === "free" ? "Starter" : currentPlan === "pro" ? "Pro" : "Business"} plan supports up to {planLimits.maxAgents} team member(s). Upgrade to add more agents.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Pending Invites */}
            {userCanManageTeam && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <CardTitle className="text-base">
                      Pending Invites
                      {pendingInvites.length > 0 && (
                        <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-warning-100 text-[10px] font-semibold text-warning-700">
                          {pendingInvites.length}
                        </span>
                      )}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {invitesLoading ? (
                    <div className="px-5 py-4 space-y-3">
                      {[1, 2].map((i) => (
                        <div key={i} className="flex items-center gap-3">
                          <Skeleton className="h-3.5 w-48" />
                          <Skeleton className="h-5 w-14 rounded-full ml-auto" />
                        </div>
                      ))}
                    </div>
                  ) : pendingInvites.length === 0 ? (
                    <p className="px-5 py-6 text-center text-sm text-slate-400">No pending invites</p>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {pendingInvites.map((invite) => (
                        <div key={invite.id} className="flex items-center justify-between px-5 py-3">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-800 truncate">{invite.email}</p>
                            <p className="text-xs text-slate-500">
                              Invited as <span className="capitalize font-medium">{invite.role}</span>
                              {" · "}
                              {new Date(invite.invited_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => revokeInviteMutation.mutate(invite.id)}
                            title="Revoke invite"
                            className="ml-3 shrink-0"
                          >
                            <X className="h-4 w-4 text-slate-400 hover:text-danger-500" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Ownership Transfer — owner only, shown in team tab */}
            {isOwner && (
              <Card className="border-warning-200">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Crown className="h-4 w-4 text-warning-500" />
                    <CardTitle className="text-base text-warning-700">Transfer Ownership</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 mb-4">
                    Transfer your owner role to another team member. You will become an admin. This action cannot be undone without their cooperation.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-warning-300 text-warning-700 hover:bg-warning-50"
                    onClick={() => { setShowTransferModal(true); setTransferToId(""); setTransferConfirmText(""); }}
                  >
                    <Crown className="mr-1.5 h-3.5 w-3.5" /> Transfer Ownership
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

        /* ========== BILLING TAB ========== */
        ) : activeTab === "billing" && userCanManageBilling ? (
          <div className="space-y-8">
            <BillingInfo currentPlan={currentPlan} />
            <div>
              <h2 className="mb-4 text-lg font-semibold text-slate-900">Change Plan</h2>
              <PlanSelector currentPlan={currentPlan} />
            </div>
          </div>
        ) : activeTab === "billing" ? (
          <Card>
            <CardContent className="py-12">
              <div className="flex flex-col items-center text-center">
                <Lock className="h-8 w-8 text-slate-300 mb-3" />
                <p className="text-sm font-medium text-slate-600">Billing access restricted</p>
                <p className="text-xs text-slate-400 mt-1">Contact your organization owner or admin to manage billing.</p>
              </div>
            </CardContent>
          </Card>

        /* ========== SECURITY TAB ========== */
        ) : activeTab === "security" ? (
          <div className="space-y-6">
            {/* Change Password */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <KeyRound className="h-4 w-4 text-slate-400" />
                  <CardTitle className="text-base">Change Password</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="max-w-md space-y-4">
                  <Input
                    label="Current Password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                  />
                  <Input
                    label="New Password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => { setNewPassword(e.target.value); setPasswordError(null); }}
                    placeholder="Min. 8 characters"
                  />
                  <Input
                    label="Confirm New Password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setPasswordError(null); }}
                    placeholder="Re-enter new password"
                  />
                  {passwordError && (
                    <p className="text-xs text-danger-500">{passwordError}</p>
                  )}
                  <Button
                    size="sm"
                    onClick={handleChangePassword}
                    isLoading={isChangingPassword}
                    disabled={isChangingPassword || !newPassword || !confirmPassword}
                  >
                    Update Password
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Active Sessions */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-slate-400" />
                  <CardTitle className="text-base">Active Sessions</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
                      <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Current Session</p>
                      <p className="text-xs text-slate-500">Active now</p>
                    </div>
                  </div>
                  <Badge variant="success" size="sm">Active</Badge>
                </div>
                <p className="mt-3 text-xs text-slate-400">
                  Sign out from all other devices by changing your password.
                </p>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-danger-200">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-danger-500" />
                  <CardTitle className="text-base text-danger-600">Danger Zone</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Sign Out All */}
                  <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
                    <div>
                      <p className="text-sm font-medium text-slate-900">Sign out everywhere</p>
                      <p className="text-xs text-slate-500">Sign out from all devices and sessions.</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        const supabase = createClient();
                        await supabase.auth.signOut({ scope: "global" });
                        router.push("/login");
                      }}
                    >
                      <LogOut className="mr-1.5 h-3.5 w-3.5" /> Sign Out All
                    </Button>
                  </div>

                  {/* Deactivate Account */}
                  <div className="flex items-center justify-between rounded-lg border border-danger-200 bg-danger-50/50 p-4">
                    <div>
                      <p className="text-sm font-medium text-danger-700">Deactivate account</p>
                      <p className="text-xs text-danger-600/70">Your account will be disabled. Contact support to reactivate.</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-danger-300 text-danger-600 hover:bg-danger-50"
                      onClick={() => setShowDeleteConfirm(true)}
                    >
                      Deactivate
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>

      {/* Invite Modal */}
      <Modal isOpen={showInviteModal} onClose={handleCloseInviteModal} title="Invite Team Member" size="sm">
        {inviteSent ? (
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-3 rounded-lg bg-success-50 py-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success-100">
                <Check className="h-6 w-6 text-success-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-success-800">Invite sent!</p>
                <p className="mt-1 text-xs text-success-700">
                  An email invitation has been sent to<br />
                  <span className="font-medium">{inviteEmail}</span>
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-500 text-center">
              They will join your organization as <span className="font-medium capitalize">{inviteRole}</span> once they accept.
            </p>
            <div className="flex justify-end">
              <Button size="sm" onClick={handleCloseInviteModal}>Done</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-slate-500">
              An email invite will be sent. They can sign up and will automatically join your organization.
            </p>
            <Input label="Email Address" type="email" placeholder="agent@company.com" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
            <Select
              label="Role"
              options={USER_ROLES.filter((r) => r.value !== "owner").map((r) => ({ value: r.value, label: r.label }))}
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
            />
            <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-500 space-y-1">
              <p className="font-medium text-slate-600">Role permissions:</p>
              <p><span className="font-medium text-slate-700">Admin</span> — can manage listings, leads, team, and billing</p>
              <p><span className="font-medium text-slate-700">Agent</span> — can manage listings and leads only</p>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" size="sm" onClick={handleCloseInviteModal}>Cancel</Button>
              <Button size="sm" onClick={handleInvite} isLoading={isInviting} disabled={!inviteEmail.trim() || isInviting}>
                Send Invite
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Account Confirmation Modal */}
      <Modal isOpen={showDeleteConfirm} onClose={() => { setShowDeleteConfirm(false); setDeleteConfirmText(""); }} title="Deactivate Account" size="sm">
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-lg border border-danger-200 bg-danger-50 p-3">
            <AlertTriangle className="h-5 w-5 shrink-0 text-danger-500" />
            <p className="text-sm text-danger-700">This action will disable your account. You will be signed out immediately.</p>
          </div>
          <div>
            <p className="mb-1.5 text-sm font-medium text-slate-700">
              Type <span className="font-mono font-bold">DELETE</span> to confirm
            </p>
            <Input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE"
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" size="sm" onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(""); }}>
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-danger-500 hover:bg-danger-600 text-white"
              onClick={handleDeleteAccount}
              disabled={deleteConfirmText !== "DELETE"}
            >
              Deactivate Account
            </Button>
          </div>
        </div>
      </Modal>

      {/* Remove Member Modal */}
      <Modal
        isOpen={!!removeMemberId}
        onClose={() => setRemoveMemberId(null)}
        title="Remove Team Member"
        size="sm"
      >
        {removeMember && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-lg border border-danger-200 bg-danger-50 p-3">
              <AlertTriangle className="h-5 w-5 shrink-0 text-danger-500" />
              <p className="text-sm text-danger-700">
                <span className="font-medium">{removeMember.full_name}</span> will lose access to your organization immediately.
              </p>
            </div>
            {removeMemberLeadCount !== null && removeMemberLeadCount > 0 && (
              <div className="flex items-center gap-2 rounded-lg border border-warning-200 bg-warning-50 px-3 py-2">
                <Shield className="h-3.5 w-3.5 shrink-0 text-warning-600" />
                <p className="text-xs text-warning-700">
                  This member has <span className="font-semibold">{removeMemberLeadCount} assigned lead{removeMemberLeadCount !== 1 ? "s" : ""}</span>. Choose what to do with them below.
                </p>
              </div>
            )}
            <div>
              <p className="mb-1.5 text-sm font-medium text-slate-700">Reassign their leads to (optional)</p>
              <Select
                options={[
                  { value: "", label: "Unassign leads" },
                  ...teamMembers
                    .filter((m) => m.is_active && m.id !== removeMemberId)
                    .map((m) => ({ value: m.id, label: m.full_name || m.email })),
                ]}
                value={reassignLeadsTo}
                onChange={(e) => setReassignLeadsTo(e.target.value)}
              />
              <p className="mt-1 text-xs text-slate-400">
                {reassignLeadsTo ? "Their leads will be transferred to the selected member." : "Their leads will become unassigned."}
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" size="sm" onClick={() => setRemoveMemberId(null)}>
                Cancel
              </Button>
              <Button
                size="sm"
                className="bg-danger-500 hover:bg-danger-600 text-white"
                isLoading={removeMembers.isPending}
                disabled={removeMembers.isPending}
                onClick={() => {
                  removeMembers.mutate(
                    { memberId: removeMemberId!, reassignLeadsTo: reassignLeadsTo || undefined },
                    { onSuccess: () => setRemoveMemberId(null) }
                  );
                }}
              >
                <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Remove Member
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Transfer Ownership Modal */}
      <Modal
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        title="Transfer Ownership"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-lg border border-warning-200 bg-warning-50 p-3">
            <Crown className="h-5 w-5 shrink-0 text-warning-500" />
            <p className="text-sm text-warning-700">
              You will become an admin. The new owner will have full control of the organization.
            </p>
          </div>
          <div>
            <p className="mb-1.5 text-sm font-medium text-slate-700">Transfer to</p>
            <Select
              options={[
                { value: "", label: "Select a member..." },
                ...teamMembers
                  .filter((m) => m.is_active && m.id !== profile?.id)
                  .map((m) => ({ value: m.id, label: `${m.full_name || m.email} (${m.role})` })),
              ]}
              value={transferToId}
              onChange={(e) => setTransferToId(e.target.value)}
            />
          </div>
          <div>
            <p className="mb-1.5 text-sm font-medium text-slate-700">
              Type <span className="font-mono font-bold">TRANSFER</span> to confirm
            </p>
            <Input
              value={transferConfirmText}
              onChange={(e) => setTransferConfirmText(e.target.value)}
              placeholder="TRANSFER"
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" size="sm" onClick={() => setShowTransferModal(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-warning-500 hover:bg-warning-600 text-white"
              isLoading={transferOwnership.isPending}
              disabled={!transferToId || transferConfirmText !== "TRANSFER" || transferOwnership.isPending}
              onClick={() => {
                transferOwnership.mutate(transferToId, {
                  onSuccess: () => setShowTransferModal(false),
                });
              }}
            >
              <Crown className="mr-1.5 h-3.5 w-3.5" /> Transfer Ownership
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
