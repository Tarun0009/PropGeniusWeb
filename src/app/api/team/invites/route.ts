import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { canManageTeam } from "@/lib/permissions";
import type { UserRole } from "@/types/user";

// GET /api/team/invites — list pending (unconfirmed) invites for the org
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, organization_id")
      .eq("id", user.id)
      .single();

    if (!profile || !canManageTeam(profile.role as UserRole)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    const adminClient = createAdminClient();
    const { data: usersData, error: listError } = await adminClient.auth.admin.listUsers({
      perPage: 1000,
    });

    if (listError) throw listError;

    // Filter users who:
    // 1. Were invited to this org (have organization_id in metadata)
    // 2. Have NOT confirmed email yet (email_confirmed_at is null)
    const pendingInvites = usersData.users
      .filter((u) => {
        const meta = u.user_metadata || {};
        return (
          meta.organization_id === profile.organization_id &&
          !u.email_confirmed_at &&
          u.invited_at
        );
      })
      .map((u) => ({
        id: u.id,
        email: u.email,
        role: u.user_metadata?.role || "agent",
        invited_by_name: u.user_metadata?.invited_by_name || "Unknown",
        invited_at: u.invited_at,
      }));

    return NextResponse.json({ invites: pendingInvites });
  } catch (error) {
    console.error("List invites error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to list invites" },
      { status: 500 }
    );
  }
}

// DELETE /api/team/invites?userId=xxx — revoke a pending invite
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, organization_id")
      .eq("id", user.id)
      .single();

    if (!profile || !canManageTeam(profile.role as UserRole)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    const adminClient = createAdminClient();

    // Verify the invited user belongs to this org
    const { data: invitedUser, error: getUserError } = await adminClient.auth.admin.getUserById(userId);
    if (getUserError || !invitedUser.user) {
      return NextResponse.json({ error: "Invite not found" }, { status: 404 });
    }

    const meta = invitedUser.user.user_metadata || {};
    if (meta.organization_id !== profile.organization_id) {
      return NextResponse.json({ error: "Invite not found in your organization" }, { status: 404 });
    }

    // Delete the unconfirmed auth user (revokes the invite)
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId);
    if (deleteError) throw deleteError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Revoke invite error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to revoke invite" },
      { status: 500 }
    );
  }
}
