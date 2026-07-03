"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { getAuthErrorMessage } from "@/features/auth/errors";
import { resetPasswordSchema, type ResetPasswordFormData } from "@/features/auth/schemas";
import { Building2, CheckCircle, PartyPopper, AlertTriangle } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isInvite = searchParams.get("invited") === "true";
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [hasSession, setHasSession] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    const supabase = createClient();
    let isMounted = true;

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!isMounted) return;
      setHasSession(Boolean(user));
      setIsCheckingSession(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const onSubmit = async (data: ResetPasswordFormData) => {
    setError(null);
    const supabase = createClient();

    const { error: updateError } = await supabase.auth.updateUser({
      password: data.password,
    });

    if (updateError) {
      setError(getAuthErrorMessage(updateError.message));
      return;
    }

    setSuccess(true);
    setTimeout(() => router.replace("/dashboard"), 1500);
  };

  if (isCheckingSession) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <Spinner className="h-6 w-6 text-primary-600" />
        <p className="mt-3 text-sm text-slate-500">Checking your reset link...</p>
      </div>
    );
  }

  if (!hasSession) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-8 lg:hidden">
          <Building2 className="h-8 w-8 text-primary-600" />
          <span className="text-2xl font-bold text-slate-900">PropGenius</span>
        </div>
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-warning-100 p-3">
              <AlertTriangle className="h-8 w-8 text-warning-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Reset link expired</h2>
          <p className="text-slate-500 mt-2 mb-6">
            Open the latest email link, or request a new password reset link.
          </p>
          <Link
            href="/forgot-password"
            className="text-primary-600 font-medium hover:text-primary-700"
          >
            Request a new link
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-success-100 p-3">
            {isInvite ? (
              <PartyPopper className="h-8 w-8 text-success-500" />
            ) : (
              <CheckCircle className="h-8 w-8 text-success-500" />
            )}
          </div>
        </div>
        <h2 className="text-2xl font-bold text-slate-900">
          {isInvite ? "You're all set!" : "Password updated!"}
        </h2>
        <p className="text-slate-500 mt-2">
          {isInvite
            ? "Welcome to PropGenius. Taking you to your dashboard..."
            : "Redirecting you to your dashboard..."}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-8 lg:hidden">
        <Building2 className="h-8 w-8 text-primary-600" />
        <span className="text-2xl font-bold text-slate-900">PropGenius</span>
      </div>

      <h2 className="text-2xl font-bold text-slate-900">
        {isInvite ? "Set your password" : "Set new password"}
      </h2>
      <p className="text-slate-500 mt-1 mb-8">
        {isInvite
          ? "You've been invited to PropGenius. Create a password to activate your account."
          : "Choose a strong password for your account."}
      </p>

      {error && (
        <div className="bg-danger-50 border border-danger-500 text-danger-700 rounded-lg px-4 py-3 mb-6 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="New Password"
          type="password"
          placeholder="Min. 8 characters"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register("password")}
        />
        <Input
          label="Confirm Password"
          type="password"
          placeholder="Re-enter your password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <Button
          type="submit"
          className="w-full"
          size="lg"
          isLoading={isSubmitting}
        >
          {isInvite ? "Activate account" : "Update password"}
        </Button>
      </form>
    </div>
  );
}