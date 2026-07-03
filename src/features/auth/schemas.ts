import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const signupSchema = z.object({
  fullName: z.string().trim().min(2, "Name must be at least 2 characters"),
  organizationName: z.string().trim().min(2, "Company name must be at least 2 characters"),
  email: z.string().trim().toLowerCase().email("Please enter a valid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email("Please enter a valid email"),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;