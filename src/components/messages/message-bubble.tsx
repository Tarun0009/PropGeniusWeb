"use client";

import Image from "next/image";
import { Check, CheckCheck, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WhatsAppMessage } from "@/types/message";

interface MessageBubbleProps {
  message: WhatsAppMessage;
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case "sent":
      return <Check className="h-3 w-3 text-slate-400" />;
    case "delivered":
      return <CheckCheck className="h-3 w-3 text-slate-400" />;
    case "read":
      return <CheckCheck className="h-3 w-3 text-blue-500" />;
    case "failed":
      return <X className="h-3 w-3 text-danger-500" />;
    default:
      return <Check className="h-3 w-3 text-slate-300" />;
  }
}

function MessageBubble({ message }: MessageBubbleProps) {
  const isOutbound = message.direction === "outbound";

  return (
    <div className={cn("flex", isOutbound ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[70%] px-3.5 py-2",
          isOutbound
            ? "rounded-l-xl rounded-tr-sm rounded-br-xl bg-primary-500 text-white"
            : "rounded-r-xl rounded-tl-sm rounded-bl-xl border border-slate-200 bg-white text-slate-900"
        )}
      >
        {/* Template badge */}
        {message.template_name && (
          <p
            className={cn(
              "mb-1 text-[10px] font-medium uppercase tracking-wide",
              isOutbound ? "text-primary-200" : "text-slate-400"
            )}
          >
            Template: {message.template_name}
          </p>
        )}

        {/* Media */}
        {message.media_url && (
          <div className="mb-1.5 overflow-hidden rounded-lg">
            <div className="relative h-48 w-full">
              <Image
                src={message.media_url}
                alt="Media"
                fill
                className="object-cover"
                sizes="300px"
              />
            </div>
          </div>
        )}

        {/* Content */}
        {message.content && (
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
        )}

        {/* Timestamp + status */}
        <div
          className={cn(
            "mt-1 flex items-center justify-end gap-1",
            isOutbound ? "text-primary-200" : "text-slate-400"
          )}
        >
          <span className="text-[10px]">{formatTime(message.created_at)}</span>
          {isOutbound && <StatusIcon status={message.status} />}
        </div>
      </div>
    </div>
  );
}

export { MessageBubble };
