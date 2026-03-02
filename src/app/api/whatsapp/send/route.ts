import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendMessageSchema } from "@/lib/validations";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("organization_id")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 400 });
    }

    const body = await request.json();
    const parsed = sendMessageSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Get lead's WhatsApp number
    const { data: lead } = await supabase
      .from("leads")
      .select("id, name, whatsapp_number")
      .eq("id", parsed.data.lead_id)
      .single();

    if (!lead?.whatsapp_number) {
      return NextResponse.json(
        { error: "Lead has no WhatsApp number" },
        { status: 400 }
      );
    }

    // Send via Twilio
    const result = await sendWhatsAppMessage({
      to: lead.whatsapp_number,
      body: parsed.data.content,
      mediaUrl: parsed.data.media_url,
    });

    // Store in database
    const { data: message, error: dbError } = await supabase
      .from("whatsapp_messages")
      .insert({
        organization_id: profile.organization_id,
        lead_id: lead.id,
        direction: "outbound",
        message_type: parsed.data.message_type,
        content: parsed.data.content,
        template_name: parsed.data.template_name || null,
        media_url: parsed.data.media_url || null,
        status: result.status,
        whatsapp_message_id: result.sid,
      })
      .select()
      .single();

    if (dbError) throw dbError;

    // Auto-log to lead activity timeline
    await supabase.from("lead_activities").insert({
      lead_id: lead.id,
      performed_by: user.id,
      type: "whatsapp",
      description: `Sent WhatsApp message: "${parsed.data.content.substring(0, 100)}${parsed.data.content.length > 100 ? "..." : ""}"`,
      metadata: { message_id: message.id, direction: "outbound" },
    });

    // Update lead's last_contacted_at
    await supabase
      .from("leads")
      .update({ last_contacted_at: new Date().toISOString() })
      .eq("id", lead.id);

    return NextResponse.json(message);
  } catch (error) {
    console.error("WhatsApp send error:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
