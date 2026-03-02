import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { validateTwilioSignature } from "@/lib/whatsapp";
import { sendEmailNotification, buildNewMessageEmailHtml } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    // Parse Twilio's form-encoded body
    const formData = await request.formData();
    const params: Record<string, string> = {};
    formData.forEach((value, key) => {
      params[key] = value.toString();
    });

    // Validate Twilio signature
    const signature = request.headers.get("x-twilio-signature") || "";
    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/whatsapp/webhook`;

    if (!validateTwilioSignature(webhookUrl, params, signature)) {
      console.error("Invalid Twilio signature");
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Extract message fields
    const from = params.From?.replace("whatsapp:", "") || "";
    const body = params.Body || "";
    const messageSid = params.MessageSid || "";
    const numMedia = parseInt(params.NumMedia || "0", 10);
    const mediaUrl = numMedia > 0 ? params.MediaUrl0 : null;

    // Use admin client (no user session for webhooks)
    const supabase = createAdminClient();

    // Find lead by WhatsApp number
    const { data: lead } = await supabase
      .from("leads")
      .select("id, name, organization_id, assigned_to")
      .eq("whatsapp_number", from)
      .single();

    if (!lead) {
      console.warn("Incoming WhatsApp from unknown number:", from);
      return new NextResponse("<Response></Response>", {
        status: 200,
        headers: { "Content-Type": "text/xml" },
      });
    }

    // Store inbound message
    const { data: message } = await supabase
      .from("whatsapp_messages")
      .insert({
        organization_id: lead.organization_id,
        lead_id: lead.id,
        direction: "inbound",
        message_type: mediaUrl ? "image" : "text",
        content: body,
        media_url: mediaUrl,
        status: "delivered",
        whatsapp_message_id: messageSid,
      })
      .select()
      .single();

    // Create lead activity
    await supabase.from("lead_activities").insert({
      lead_id: lead.id,
      performed_by: null,
      type: "whatsapp",
      description: `Received WhatsApp message: "${body.substring(0, 100)}${body.length > 100 ? "..." : ""}"`,
      metadata: { message_id: message?.id, direction: "inbound" },
    });

    // Send email notification to assigned agent
    if (lead.assigned_to) {
      const { data: agent } = await supabase
        .from("profiles")
        .select("email, full_name")
        .eq("id", lead.assigned_to)
        .single();

      if (agent?.email) {
        const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/messages?lead=${lead.id}`;
        await sendEmailNotification({
          to: agent.email,
          subject: `New WhatsApp message from ${lead.name}`,
          html: buildNewMessageEmailHtml({
            leadName: lead.name,
            messageContent: body,
            dashboardUrl,
          }),
        }).catch((err) => console.error("Email notification failed:", err));
      }
    }

    return new NextResponse("<Response></Response>", {
      status: 200,
      headers: { "Content-Type": "text/xml" },
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new NextResponse("<Response></Response>", {
      status: 200,
      headers: { "Content-Type": "text/xml" },
    });
  }
}
