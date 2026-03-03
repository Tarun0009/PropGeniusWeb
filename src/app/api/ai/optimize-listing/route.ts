import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { optimizeListingRequestSchema } from "@/lib/validations";
import { optimizeListing } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = optimizeListingRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const result = await optimizeListing(parsed.data);

    return NextResponse.json(result);
  } catch (error) {
    console.error("AI listing optimization error:", error);
    return NextResponse.json(
      { error: "Failed to optimize listing" },
      { status: 500 }
    );
  }
}
