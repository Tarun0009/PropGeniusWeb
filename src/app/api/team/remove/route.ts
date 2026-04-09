import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { canManageTeam } from "@/lib/permissions";
import type { UserRole } from "@/types/user";

// POST /api/team/remove — remove a member and optionally reassign their leads
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: callerProfile } = await supabase
      .from("profiles")
      .select("id, role, organization_id")
      .eq("id", user.id)
      .single();

    if (!callerProfile || !canManageTeam(callerProfile.role as UserRole)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    const body = await request.json();
    const { memberId, reassignLeadsTo } = body;

    if (!memberId) {
      return NextResponse.json({ error: "memberId is required" }, { status: 400 });
    }

    if (memberId === user.id) {
      return NextResponse.json({ error: "Cannot remove yourself" }, { status: 400 });
    }

    const adminClient = createAdminClient();

    // Verify target is in same org and not owner
    const { data: targetMember } = await adminClient
      .from("profiles")
      .select("id, role, organization_id, full_name")
      .eq("id", memberId)
      .eq("organization_id", callerProfile.organization_id)
      .single();

    if (!targetMember) {
      return NextResponse.json({ error: "Member not found in your organization" }, { status: 404 });
    }

    if (targetMember.role === "owner") {
      return NextResponse.json({ error: "Cannot remove the owner" }, { status: 403 });
    }

    // Only owner can remove admins
    if (targetMember.role === "admin" && callerProfile.role !== "owner") {
      return NextResponse.json({ error: "Only the owner can remove an admin" }, { status: 403 });
    }

    // Reassign or unassign their leads
    if (reassignLeadsTo) {
      // Verify reassignment target is in same org and active
      const { data: reassignTarget } = await adminClient
        .from("profiles")
        .select("id")
        .eq("id", reassignLeadsTo)
        .eq("organization_id", callerProfile.organization_id)
        .eq("is_active", true)
        .single();

      if (!reassignTarget) {
        return NextResponse.json({ error: "Reassignment target not found or inactive" }, { status: 400 });
      }

      await adminClient
        .from("leads")
        .update({ assigned_to: reassignLeadsTo })
        .eq("assigned_to", memberId);
    } else {
      // Unassign leads
      await adminClient
        .from("leads")
        .update({ assigned_to: null })
        .eq("assigned_to", memberId);
    }

    // Soft-delete: deactivate the profile (keeps historical data intact)
    const { error: deactivateError } = await adminClient
      .from("profiles")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("id", memberId);

    if (deactivateError) throw deactivateError;

    // Revoke auth access by deleting auth user
    const { error: deleteAuthError } = await adminClient.auth.admin.deleteUser(memberId);
    if (deleteAuthError) {
      // Non-fatal — profile is deactivated, user just won't get a clean auth removal
      console.error("Auth deletion error (non-fatal):", deleteAuthError.message);
    }

    return NextResponse.json({
      success: true,
      message: `${targetMember.full_name} has been removed from your team`,
    });
  } catch (error) {
    console.error("Remove member error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to remove member" },
      { status: 500 }
    );
  }
}
