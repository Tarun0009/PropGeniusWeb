"use client";

import { useState } from "react";
import { CreditCard, Calendar, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Spinner } from "@/components/ui/spinner";
import { useSubscription, useCancelSubscription, usePaymentHistory } from "@/hooks/use-billing";
import { SUBSCRIPTION_PLANS } from "@/lib/constants";
import { formatDate, formatPrice } from "@/lib/utils";
import type { SubscriptionPlan } from "@/types/subscription";

interface BillingInfoProps {
  currentPlan: SubscriptionPlan;
}

function BillingInfo({ currentPlan }: BillingInfoProps) {
  const { data: subscription, isLoading } = useSubscription();
  const { data: history = [] } = usePaymentHistory();
  const cancelMutation = useCancelSubscription();
  const [showCancelModal, setShowCancelModal] = useState(false);

  const planConfig = SUBSCRIPTION_PLANS.find((p) => p.id === currentPlan);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner />
      </div>
    );
  }

  const handleCancel = async () => {
    await cancelMutation.mutateAsync({});
    setShowCancelModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Current Plan Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Current Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">
                  {planConfig?.name || "Free"} Plan
                </h3>
                <Badge variant={currentPlan === "free" ? "default" : "success"} size="sm">
                  {subscription?.status === "active" ? "Active" : currentPlan === "free" ? "Free" : "Inactive"}
                </Badge>
              </div>
              {subscription?.current_period_end && (
                <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                  <Calendar className="h-3.5 w-3.5" />
                  Renews on {formatDate(subscription.current_period_end)}
                </p>
              )}
              {subscription?.amount && (
                <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                  <CreditCard className="h-3.5 w-3.5" />
                  {formatPrice(subscription.amount)}/{subscription.currency || "INR"}
                </p>
              )}
            </div>
            {currentPlan !== "free" && subscription && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCancelModal(true)}
              >
                Cancel Plan
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment History */}
      {history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Payment History</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {history.map((item) => (
                <div key={item.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm font-medium capitalize text-slate-900">
                      {item.plan} Plan
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatDate(item.created_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">
                      {item.amount ? formatPrice(item.amount) : "Free"}
                    </p>
                    <Badge
                      variant={item.status === "active" ? "success" : item.status === "cancelled" ? "danger" : "default"}
                      size="sm"
                    >
                      {item.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cancel Confirmation Modal */}
      <Modal isOpen={showCancelModal} onClose={() => setShowCancelModal(false)} title="Cancel Subscription">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-warning-50 p-2">
            <AlertTriangle className="h-5 w-5 text-warning-500" />
          </div>
          <div>
            <p className="text-sm text-slate-600">
              Are you sure you want to cancel your <strong>{planConfig?.name}</strong> plan?
              You'll be downgraded to the Free plan and lose access to premium features.
            </p>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" size="sm" onClick={() => setShowCancelModal(false)}>
            Keep Plan
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleCancel}
            isLoading={cancelMutation.isPending}
          >
            Cancel Subscription
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export { BillingInfo };
