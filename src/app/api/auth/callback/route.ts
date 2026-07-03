import { NextResponse } from "next/server";
import { PROTECTED_HOME, getSafeRedirectPath } from "@/features/auth/config";
import { getInviteMetadata, reconcileInvitedUser } from "@/features/auth/server/invite";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const type = url.searchParams.get("type");
  const next = getSafeRedirectPath(url.searchParams.get("next"), PROTECTED_HOME);
  const origin = url.origin;

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
  }

  const invite = getInviteMetadata(data.user);

  if (invite) {
    try {
      await reconcileInvitedUser(data.user);
    } catch (reconcileError) {
      console.error("Invite reconciliation failed:", reconcileError);
      return NextResponse.redirect(`${origin}/login?error=invite_setup_failed`);
    }
  }

  if (type === "recovery") {
    return NextResponse.redirect(`${origin}/reset-password`);
  }

  if (invite) {
    return NextResponse.redirect(`${origin}/reset-password?invited=true`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}