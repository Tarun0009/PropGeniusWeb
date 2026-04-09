import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// POST /api/team/transfer-ownership — owner transfers ownership to an admin
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: callerProfile } = await supabase
      .from("profiles")
      .select("id, role, organization_id, full_name")
      .eq("id", user.id)
      .single();

    if (!callerProfile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 400 });
    }

    if (callerProfile.role !== "owner") {
      return NextResponse.json({ error: "Only the owner can transfer ownership" }, { status: 403 });
    }

    const body = await request.json();
    const { newOwnerId } = body;

    if (!newOwnerId) {
      return NextResponse.json({ error: "newOwnerId is required" }, { status: 400 });
    }

    if (newOwnerId === user.id) {
      return NextResponse.json({ error: "You are already the owner" }, { status: 400 });
    }

    const adminClient = createAdminClient();

    // Verify new owner is in the same org
    const { data: newOwner } = await adminClient
      .from("profiles")
      .select("id, role, full_name, is_active")
      .eq("id", newOwnerId)
      .eq("organization_id", callerProfile.organization_id)
      .single();

    if (!newOwner) {
      return NextResponse.json({ error: "Member not found in your organization" }, { status: 404 });
    }

    if (!newOwner.is_active) {
      return NextResponse.json({ error: "Cannot transfer ownership to an inactive member" }, { status: 400 });
    }

    // Atomically: demote current owner → admin, promote new member → owner
    const [demoteResult, promoteResult] = await Promise.all([
      adminClient
        .from("profiles")
        .update({ role: "admin", updated_at: new Date().toISOString() })
        .eq("id", user.id),
      adminClient
        .from("profiles")
        .update({ role: "owner", updated_at: new Date().toISOString() })
        .eq("id", newOwnerId),
    ]);

    if (demoteResult.error) throw demoteResult.error;
    if (promoteResult.error) throw promoteResult.error;

    return NextResponse.json({
      success: true,
      message: `Ownership transferred to ${newOwner.full_name}`,
    });
  } catch (error) {
    console.error("Transfer ownership error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to transfer ownership" },
      { status: 500 }
    );
  }
}
