import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { canManageTeam } from "@/lib/permissions";
import type { UserRole } from "@/types/user";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: memberId } = await params;
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get caller's profile
    const { data: callerProfile } = await supabase
      .from("profiles")
      .select("id, role, organization_id")
      .eq("id", user.id)
      .single();

    if (!callerProfile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 400 });
    }

    if (!canManageTeam(callerProfile.role as UserRole)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    if (memberId === user.id) {
      return NextResponse.json({ error: "Cannot modify your own role or status" }, { status: 400 });
    }

    // Get target member — must be in same org
    const { data: targetMember } = await supabase
      .from("profiles")
      .select("id, role, organization_id, full_name")
      .eq("id", memberId)
      .eq("organization_id", callerProfile.organization_id)
      .single();

    if (!targetMember) {
      return NextResponse.json({ error: "Member not found in your organization" }, { status: 404 });
    }

    const body = await request.json();
    const { action } = body;

    if (action === "role") {
      const { role: newRole } = body;

      if (!newRole || !["admin", "agent"].includes(newRole)) {
        return NextResponse.json({ error: "Role must be admin or agent" }, { status: 400 });
      }

      // Only owner can change an admin's role
      if (targetMember.role === "admin" && callerProfile.role !== "owner") {
        return NextResponse.json(
          { error: "Only the owner can change an admin's role" },
          { status: 403 }
        );
      }

      // Cannot change owner's role
      if (targetMember.role === "owner") {
        return NextResponse.json(
          { error: "Cannot change the owner's role. Use ownership transfer instead." },
          { status: 403 }
        );
      }

      const adminClient = createAdminClient();
      const { error: updateError } = await adminClient
        .from("profiles")
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq("id", memberId);

      if (updateError) throw updateError;

      return NextResponse.json({
        success: true,
        message: `${targetMember.full_name} is now ${newRole}`,
      });
    }

    if (action === "status") {
      const { is_active } = body;

      if (typeof is_active !== "boolean") {
        return NextResponse.json({ error: "is_active must be a boolean" }, { status: 400 });
      }

      // Only owner can deactivate an admin
      if (targetMember.role === "admin" && callerProfile.role !== "owner") {
        return NextResponse.json(
          { error: "Only the owner can deactivate an admin" },
          { status: 403 }
        );
      }

      if (targetMember.role === "owner") {
        return NextResponse.json({ error: "Cannot deactivate the owner" }, { status: 403 });
      }

      const adminClient = createAdminClient();
      const { error: updateError } = await adminClient
        .from("profiles")
        .update({ is_active, updated_at: new Date().toISOString() })
        .eq("id", memberId);

      if (updateError) throw updateError;

      return NextResponse.json({
        success: true,
        message: is_active
          ? `${targetMember.full_name} has been activated`
          : `${targetMember.full_name} has been deactivated`,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Team member update error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to update member" },
      { status: 500 }
    );
  }
}
