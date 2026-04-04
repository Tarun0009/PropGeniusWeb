"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building2, CheckCircle, PartyPopper } from "lucide-react";

const resetSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetForm = z.infer<typeof resetSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isInvite = searchParams.get("invited") === "true";
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async (data: ResetForm) => {
    setError(null);
    const supabase = createClient();

    const { error: updateError } = await supabase.auth.updateUser({
      password: data.password,
    });

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push("/dashboard"), 2000);
  };

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
            ? "Welcome to PropGenius. Taking you to your dashboard…"
            : "Redirecting you to your dashboard…"}
        </p>
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
          error={errors.password?.message}
          {...register("password")}
        />
        <Input
          label="Confirm Password"
          type="password"
          placeholder="Re-enter your password"
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
