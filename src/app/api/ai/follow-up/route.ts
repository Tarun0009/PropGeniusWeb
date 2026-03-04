import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { followUpRequestSchema } from "@/lib/validations";
import { generateFollowUpSuggestions } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = followUpRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const result = await generateFollowUpSuggestions(parsed.data);

    return NextResponse.json(result);
  } catch (error) {
    console.error("AI follow-up error:", error);
    return NextResponse.json(
      { error: "Failed to generate follow-up suggestions" },
      { status: 500 }
    );
  }
}
