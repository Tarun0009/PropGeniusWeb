import twilio from "twilio";

function getTwilioClient() {
  return twilio(
    process.env.TWILIO_ACCOUNT_SID!,
    process.env.TWILIO_AUTH_TOKEN!
  );
}

export async function sendWhatsAppMessage(params: {
  to: string;
  body: string;
  mediaUrl?: string;
}): Promise<{ sid: string; status: string }> {
  const client = getTwilioClient();
  const message = await client.messages.create({
    from: process.env.TWILIO_WHATSAPP_NUMBER!,
    to: `whatsapp:${params.to}`,
    body: params.body,
    ...(params.mediaUrl ? { mediaUrl: [params.mediaUrl] } : {}),
    statusCallback: process.env.TWILIO_STATUS_CALLBACK_URL,
  });

  return { sid: message.sid, status: message.status };
}

export function validateTwilioSignature(
  url: string,
  params: Record<string, string>,
  signature: string
): boolean {
  return twilio.validateRequest(
    process.env.TWILIO_AUTH_TOKEN!,
    signature,
    url,
    params
  );
}
