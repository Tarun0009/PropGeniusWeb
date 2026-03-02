export type MessageDirection = "inbound" | "outbound";
export type MessageType = "text" | "template" | "image" | "document";
export type MessageStatus = "queued" | "sent" | "delivered" | "read" | "failed";

export interface WhatsAppMessage {
  id: string;
  organization_id: string;
  lead_id: string | null;
  direction: MessageDirection;
  message_type: MessageType;
  content: string | null;
  template_name: string | null;
  media_url: string | null;
  status: MessageStatus;
  whatsapp_message_id: string | null;
  error_message: string | null;
  created_at: string;
}

export interface Conversation {
  lead: import("./lead").Lead;
  lastMessage: WhatsAppMessage | null;
  unreadCount: number;
}
