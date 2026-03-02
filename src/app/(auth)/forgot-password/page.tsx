"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building2, CheckCircle } from "lucide-react";

const forgotSchema = z.object({
  email: z.string().email("Please enter a valid email"),
});

type ForgotForm = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotForm>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data: ForgotForm) => {
    setError(null);
    const supabase = createClient();

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      data.email,
      {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      }
    );

    if (resetError) {
      setError(resetError.message);
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
          We&apos;ve sent a password reset link to your email address.
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
      {/* Mobile logo */}
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
