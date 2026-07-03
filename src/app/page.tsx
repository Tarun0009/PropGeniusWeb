import { LandingPageView } from "@/features/landing/components/landing-page-view";
import { createClient } from "@/lib/supabase/server";

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <LandingPageView isAuthenticated={Boolean(user)} />;
}