import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { validateTwilioSignature } from "@/lib/whatsapp";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const params: Record<string, string> = {};
    formData.forEach((value, key) => {
      params[key] = value.toString();
    });

    // Validate Twilio signature
    const signature = request.headers.get("x-twilio-signature") || "";
    const statusUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/whatsapp/status`;

    if (!validateTwilioSignature(statusUrl, params, signature)) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const messageSid = params.MessageSid;
    const messageStatus = params.MessageStatus;
    const errorMessage = params.ErrorMessage || null;

    if (!messageSid || !messageStatus) {
      return new NextResponse("OK", { status: 200 });
    }

    const supabase = createAdminClient();

    await supabase
      .from("whatsapp_messages")
      .update({
        status: messageStatus,
        ...(errorMessage ? { error_message: errorMessage } : {}),
      })
      .eq("whatsapp_message_id", messageSid);

    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("Status callback error:", error);
    return new NextResponse("OK", { status: 200 });
  }
}
