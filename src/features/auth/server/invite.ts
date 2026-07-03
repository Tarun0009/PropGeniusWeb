import type { User } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import type { UserRole } from "@/features/users/types";

const INVITE_ROLES: UserRole[] = ["admin", "agent"];

export function getInviteMetadata(user: User) {
  const organizationId = user.user_metadata?.organization_id;
  const role = user.user_metadata?.role;

  if (typeof organizationId !== "string" || typeof role !== "string") {
    return null;
  }

  if (!INVITE_ROLES.includes(role as UserRole)) {
    return null;
  }

  return { organizationId, role: role as UserRole };
}

export async function reconcileInvitedUser(user: User) {
  const invite = getInviteMetadata(user);
  if (!invite) return null;

  const adminClient = createAdminClient();

  const { data: profile, error: profileError } = await adminClient
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    throw profileError || new Error("Invited user profile was not created");
  }

  if (profile.organization_id === invite.organizationId) {
    return invite;
  }

  const oldOrganizationId = profile.organization_id;

  const { error: updateError } = await adminClient
    .from("profiles")
    .update({
      organization_id: invite.organizationId,
      role: invite.role,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (updateError) throw updateError;

  if (oldOrganizationId) {
    await adminClient.from("organizations").delete().eq("id", oldOrganizationId);
  }

  return invite;
}