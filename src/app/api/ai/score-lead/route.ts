import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { scoreLeadRequestSchema } from "@/lib/validations";
import { scoreLead } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = scoreLeadRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const score = await scoreLead(parsed.data);

    return NextResponse.json(score);
  } catch (error) {
    console.error("AI lead scoring error:", error);
    return NextResponse.json(
      { error: "Failed to score lead" },
      { status: 500 }
    );
  }
}
