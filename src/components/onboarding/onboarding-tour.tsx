"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Sparkles,
  Users,
  MessageSquare,
  BarChart3,
  Rocket,
  ArrowRight,
  ArrowLeft,
  X,
} from "lucide-react";
import { useOnboarding } from "@/hooks/use-onboarding";

interface OnboardingStep {
  icon: React.ElementType;
  iconBg: string;
  title: string;
  description: string;
  detail: string;
}

const STEPS: OnboardingStep[] = [
  {
    icon: Rocket,
    iconBg: "bg-primary-100 text-primary-600",
    title: "Welcome to PropGenius AI!",
    description: "Your AI-powered real estate assistant",
    detail:
      "PropGenius helps you generate professional property listings with AI, manage leads, chat via WhatsApp, and track your performance — all from one dashboard. Let's take a quick tour!",
  },
  {
    icon: Sparkles,
    iconBg: "bg-amber-100 text-amber-600",
    title: "AI-Powered Listings",
    description: "Create listings in minutes, not hours",
    detail:
      "Fill in your property details and let AI generate compelling titles, descriptions, social media posts, and SEO content. Go to Listings in the sidebar to create your first listing.",
  },
  {
    icon: Users,
    iconBg: "bg-emerald-100 text-emerald-600",
    title: "Smart Lead Management",
    description: "Never miss a follow-up",
    detail:
      "Track every lead with our CRM. Use the Pipeline view to drag leads through stages (New → Contacted → Site Visit → Converted). Import existing leads via CSV in one click.",
  },
  {
    icon: MessageSquare,
    iconBg: "bg-blue-100 text-blue-600",
    title: "WhatsApp Messaging",
    description: "Chat with leads directly",
    detail:
      "Send and receive WhatsApp messages without leaving PropGenius. Use pre-built templates for instant replies — perfect for responding to portal inquiries within minutes.",
  },
  {
    icon: BarChart3,
    iconBg: "bg-purple-100 text-purple-600",
    title: "Analytics & Insights",
    description: "Data-driven decisions",
    detail:
      "Monitor your conversion funnel, track lead sources, and measure performance over time. Use the Analytics dashboard to identify where you're winning and where to improve.",
  },
  {
    icon: Building2,
    iconBg: "bg-primary-100 text-primary-600",
    title: "You're All Set!",
    description: "Start by creating your first listing",
    detail:
      "That's everything you need to know! Click the button below to create your first AI-powered property listing. You can always find help in Settings.",
  },
];

export function OnboardingTour() {
  const { isComplete, complete } = useOnboarding();
  const [currentStep, setCurrentStep] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const router = useRouter();

  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => complete(), 200);
  }, [complete]);

  const handleNext = useCallback(() => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((s) => s + 1);
    }
  }, [currentStep]);

  const handlePrev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  }, [currentStep]);

  const handleGetStarted = useCallback(() => {
    complete();
    router.push("/listings/new");
  }, [complete, router]);

  if (isComplete) return null;

  const step = STEPS[currentStep];
  const isLast = currentStep === STEPS.length - 1;
  const isFirst = currentStep === 0;
  const Icon = step.icon;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-200 ${
        isExiting ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        {/* Skip button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          aria-label="Skip tour"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Content */}
        <div className="px-8 pb-6 pt-8 text-center">
          {/* Icon */}
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br shadow-sm">
            <div
              className={`flex h-full w-full items-center justify-center rounded-2xl ${step.iconBg}`}
            >
              <Icon className="h-8 w-8" />
            </div>
          </div>

          {/* Text */}
          <h2 className="mb-1 text-xl font-bold text-slate-900">
            {step.title}
          </h2>
          <p className="mb-3 text-sm font-medium text-primary-600">
            {step.description}
          </p>
          <p className="mx-auto max-w-sm text-sm leading-relaxed text-slate-500">
            {step.detail}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 px-8 py-4">
          {/* Progress dots */}
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentStep(i)}
                className={`h-2 rounded-full transition-all ${
                  i === currentStep
                    ? "w-6 bg-primary-600"
                    : "w-2 bg-slate-200 hover:bg-slate-300"
                }`}
                aria-label={`Go to step ${i + 1}`}
              />
            ))}
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center gap-2">
            {!isFirst && (
              <button
                onClick={handlePrev}
                className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
            )}

            {isFirst && (
              <button
                onClick={handleClose}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition-colors hover:text-slate-600"
              >
                Skip
              </button>
            )}

            {isLast ? (
              <button
                onClick={handleGetStarted}
                className="flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700"
              >
                Create Your First Listing
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex items-center gap-1 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
