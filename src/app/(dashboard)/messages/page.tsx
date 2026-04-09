"use client";

import { MessageCircleMore, Clock, CheckCircle } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";

export default function MessagesPage() {
  return (
    <div>
      <PageHeader
        title="Messages"
        description="WhatsApp conversations with your leads"
      />

      <div className="mt-6 flex flex-col items-center justify-center">
        <Card className="w-full max-w-lg">
          <CardContent className="flex flex-col items-center py-16 text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50">
              <MessageCircleMore className="h-8 w-8 text-emerald-500" />
            </div>
            <h2 className="mb-2 text-lg font-semibold text-slate-900">
              WhatsApp Messaging
            </h2>
            <p className="mb-6 max-w-sm text-sm text-slate-500 leading-relaxed">
              Our team is working on integrating WhatsApp Business API. You&apos;ll be able to send and receive messages from your leads directly here.
            </p>

            <div className="w-full max-w-xs space-y-3 text-left">
              {[
                "Send & receive WhatsApp messages",
                "Pre-built templates for quick replies",
                "Auto-notify leads about new listings",
                "Message history per lead",
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-2.5">
                  <CheckCircle className="h-4 w-4 shrink-0 text-emerald-500" />
                  <span className="text-sm text-slate-600">{feature}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-xs font-medium text-amber-700 border border-amber-200">
              <Clock className="h-3.5 w-3.5" />
              Coming soon — our team is working on it
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
