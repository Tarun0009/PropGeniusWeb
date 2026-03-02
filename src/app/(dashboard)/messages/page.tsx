"use client";

import { Suspense } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Spinner } from "@/components/ui/spinner";
import { ChatLayout } from "@/components/messages/chat-layout";

export default function MessagesPage() {
  return (
    <div>
      <PageHeader
        title="Messages"
        description="WhatsApp conversations with your leads"
      />
      <div className="mt-4">
        <Suspense
          fallback={
            <div className="flex min-h-75 items-center justify-center">
              <Spinner size="lg" />
            </div>
          }
        >
          <ChatLayout />
        </Suspense>
      </div>
    </div>
  );
}
