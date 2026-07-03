"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { buildAuthCallbackUrl } from "@/features/auth/config";
import { getAuthErrorMessage } from "@/features/auth/errors";
import { forgotPasswordSchema, type ForgotPasswordFormData } from "@/features/auth/schemas";
import { Building2, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setError(null);
    const supabase = createClient();

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      data.email,
      {
        redirectTo: buildAuthCallbackUrl(window.location.origin, { type: "recovery" }),
      }
    );

    if (resetError) {
      setError(getAuthErrorMessage(resetError.message));
      return;
    }

    setSuccess(true);
  };

  if (success) {
    return (
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-success-100 p-3">
            <CheckCircle className="h-8 w-8 text-success-500" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Check your email</h2>
        <p className="text-slate-500 mt-2 mb-6">
          If an account exists for that address, you&apos;ll receive a password reset link shortly.
        </p>
        <Link
          href="/login"
          className="text-primary-600 font-medium hover:text-primary-700"
        >
          Back to sign in
        </Link>
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
        Reset your password
      </h2>
      <p className="text-slate-500 mt-1 mb-8">
        Enter your email and we&apos;ll send you a reset link
      </p>

      {error && (
        <div className="bg-danger-50 border border-danger-500 text-danger-700 rounded-lg px-4 py-3 mb-6 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />

        <Button
          type="submit"
          className="w-full"
          size="lg"
          isLoading={isSubmitting}
        >
          Send reset link
        </Button>
      </form>

      <p className="text-center text-sm text-slate-500 mt-8">
        Remember your password?{" "}
        <Link
          href="/login"
          className="text-primary-600 font-medium hover:text-primary-700"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}