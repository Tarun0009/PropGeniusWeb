import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const type = searchParams.get("type");

  if (code) {
    const supabase = await createClient();
    const { error, data } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data?.user) {
      const user = data.user;

      // Handle invited users: user_metadata has organization_id and role set by the invite
      const invitedOrgId = user.user_metadata?.organization_id as string | undefined;
      const invitedRole = user.user_metadata?.role as string | undefined;

      if (invitedOrgId && invitedRole) {
        try {
          const adminClient = createAdminClient();

          // Get the auto-created profile (created by the Supabase trigger on signup)
          const { data: profile } = await adminClient
            .from("profiles")
            .select("organization_id")
            .eq("id", user.id)
            .single();

          // If the auto-created org is different from the invited org, fix it
          if (profile && profile.organization_id !== invitedOrgId) {
            const oldOrgId = profile.organization_id;

            // Update profile to join the invited organization with the assigned role
            await adminClient
              .from("profiles")
              .update({
                organization_id: invitedOrgId,
                role: invitedRole,
                updated_at: new Date().toISOString(),
              })
              .eq("id", user.id);

            // Remove the auto-created (empty) organization
            if (oldOrgId) {
              await adminClient
                .from("organizations")
                .delete()
                .eq("id", oldOrgId);
            }
          }
        } catch {
          // Non-fatal: user can still access the app; org join may need manual fix
        }
      }

      // Password recovery flow → redirect to reset-password page
      if (type === "recovery") {
        return NextResponse.redirect(`${origin}/reset-password`);
      }

      // Invited new user → redirect to set-password page so they can choose a password
      if (invitedOrgId && invitedRole) {
        return NextResponse.redirect(`${origin}/reset-password?invited=true`);
      }

      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  return NextResponse.redirect(`${origin}/login`);
}
