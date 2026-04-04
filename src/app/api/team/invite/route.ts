import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { canManageTeam } from "@/lib/permissions";
import type { UserRole } from "@/types/user";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get inviter's profile and org
    const { data: profile } = await supabase
      .from("profiles")
      .select("organization_id, role, full_name")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 400 });
    }

    if (!canManageTeam(profile.role as UserRole)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    const body = await request.json();
    const { email, role } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    if (!role || !["admin", "agent"].includes(role)) {
      return NextResponse.json({ error: "Role must be admin or agent" }, { status: 400 });
    }

    // Check if email already exists in this org
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email.toLowerCase())
      .eq("organization_id", profile.organization_id)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "A team member with this email already exists in your organization" },
        { status: 409 }
      );
    }

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

    // Send invite via Supabase admin
    const adminClient = createAdminClient();
    const { error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(
      email.toLowerCase(),
      {
        data: {
          organization_id: profile.organization_id,
          role,
          invited_by: user.id,
          invited_by_name: profile.full_name,
        },
        redirectTo: `${appUrl}/api/auth/callback`,
      }
    );

    if (inviteError) {
      return NextResponse.json({ error: inviteError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, email });
  } catch (error) {
    console.error("Team invite error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to send invite" },
      { status: 500 }
    );
  }
}
