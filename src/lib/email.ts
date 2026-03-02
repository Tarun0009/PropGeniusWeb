import { Resend } from "resend";

function getResendClient() {
  return new Resend(process.env.RESEND_API_KEY!);
}

export async function sendEmailNotification(params: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  const resend = getResendClient();
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "PropGenius <notifications@propgenius.app>",
    to: params.to,
    subject: params.subject,
    html: params.html,
  });
}

export function buildNewMessageEmailHtml(params: {
  leadName: string;
  messageContent: string;
  dashboardUrl: string;
}): string {
  return `
    <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1e293b;">New WhatsApp Message</h2>
      <p style="color: #475569;">You received a new message from <strong>${params.leadName}</strong>:</p>
      <div style="background: #f1f5f9; border-radius: 8px; padding: 16px; margin: 16px 0;">
        <p style="color: #334155; margin: 0;">${params.messageContent}</p>
      </div>
      <a href="${params.dashboardUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none;">
        View in PropGenius
      </a>
    </div>
  `;
}
