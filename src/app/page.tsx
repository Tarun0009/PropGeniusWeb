import Link from "next/link";
import {
  Building2,
  Sparkles,
  Users,
  MessageSquare,
  BarChart3,
  Check,
  ArrowRight,
  Zap,
  Shield,
  Globe,
} from "lucide-react";
import { SUBSCRIPTION_PLANS } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";

const FEATURES = [
  {
    icon: Sparkles,
    title: "AI Listing Generator",
    description:
      "Generate professional property titles, descriptions, and social media posts in seconds with Google Gemini AI.",
  },
  {
    icon: Users,
    title: "Smart CRM",
    description:
      "Manage leads with AI scoring, Kanban board, activity timeline, and CSV import. Never miss a follow-up.",
  },
  {
    icon: MessageSquare,
    title: "WhatsApp Integration",
    description:
      "Send and receive WhatsApp messages directly. Use templates for quick responses and track conversations.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description:
      "Track listings, leads, conversion rates, and more with interactive charts and real-time insights.",
  },
];

const HIGHLIGHTS = [
  { icon: Zap, text: "Generate listings 10x faster with AI" },
  { icon: Shield, text: "Enterprise-grade security with Supabase" },
  { icon: Globe, text: "Built for Indian real estate market" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <Building2 className="h-7 w-7 text-primary-600" />
            <span className="text-xl font-bold text-slate-900">PropGenius</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-indigo-50" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:py-36">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-4 py-1.5 text-sm font-medium text-primary-700">
              <Sparkles className="h-4 w-4" />
              AI-Powered Real Estate Platform
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Generate Listings.{" "}
              <span className="text-primary-600">Manage Leads.</span>{" "}
              Close Deals.
            </h1>
            <p className="mt-6 text-lg text-slate-600 sm:text-xl">
              The all-in-one platform for Indian real estate agents and agencies.
              AI-powered listing generation, smart CRM with lead scoring, and
              WhatsApp integration — all in one place.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-primary-700 transition-colors sm:w-auto"
              >
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="flex w-full items-center justify-center rounded-lg border border-slate-300 bg-white px-6 py-3 text-base font-semibold text-slate-700 hover:bg-slate-50 transition-colors sm:w-auto"
              >
                Sign In
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
              {HIGHLIGHTS.map((item) => (
                <div
                  key={item.text}
                  className="flex items-center gap-2 text-sm text-slate-500"
                >
                  <item.icon className="h-4 w-4 text-primary-500" />
                  {item.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-slate-100 bg-slate-50 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
              Everything you need to grow your business
            </h2>
            <p className="mt-4 text-lg text-slate-500">
              From AI-powered listings to smart lead management — PropGenius has
              you covered.
            </p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-50">
                  <feature.icon className="h-5 w-5 text-primary-600" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-slate-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-lg text-slate-500">
              Start free and scale as you grow. No hidden fees.
            </p>
          </div>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {SUBSCRIPTION_PLANS.map((plan) => {
              const isEnterprise = plan.price_monthly === -1;
              const isFree = plan.price_monthly === 0;
              const isPopular = "popular" in plan && plan.popular;

              return (
                <div
                  key={plan.id}
                  className={`relative flex flex-col rounded-xl border-2 bg-white p-6 ${
                    isPopular
                      ? "border-primary-500 shadow-lg shadow-primary-500/10"
                      : "border-slate-200"
                  }`}
                >
                  {isPopular && (
                    <span className="absolute -top-3 right-4 rounded-full bg-primary-600 px-3 py-1 text-xs font-semibold text-white">
                      Popular
                    </span>
                  )}
                  <h3 className="text-lg font-bold text-slate-900">
                    {plan.name}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {plan.description}
                  </p>
                  <div className="mt-4">
                    {isEnterprise ? (
                      <p className="text-2xl font-bold text-slate-900">
                        Custom
                      </p>
                    ) : isFree ? (
                      <p className="text-2xl font-bold text-slate-900">Free</p>
                    ) : (
                      <div>
                        <span className="text-3xl font-bold text-slate-900">
                          {formatPrice(plan.price_monthly)}
                        </span>
                        <span className="text-sm text-slate-500">/month</span>
                      </div>
                    )}
                  </div>
                  <ul className="mt-6 flex-1 space-y-2.5">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-success-500" />
                        <span className="text-sm text-slate-600">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6">
                    <Link
                      href="/signup"
                      className={`block w-full rounded-lg py-2.5 text-center text-sm font-semibold transition-colors ${
                        isPopular
                          ? "bg-primary-600 text-white hover:bg-primary-700"
                          : "border border-slate-300 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {isEnterprise
                        ? "Contact Sales"
                        : isFree
                          ? "Get Started"
                          : `Start with ${plan.name}`}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-slate-100 bg-gradient-to-br from-primary-600 to-primary-900 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Ready to transform your real estate business?
          </h2>
          <p className="mt-4 text-lg text-primary-100">
            Join thousands of Indian real estate professionals using PropGenius
            to grow faster.
          </p>
          <Link
            href="/signup"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3 text-base font-semibold text-primary-700 shadow-sm hover:bg-primary-50 transition-colors"
          >
            Get Started Free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary-600" />
              <span className="font-bold text-slate-900">PropGenius AI</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <Link href="/login" className="hover:text-slate-900">
                Sign In
              </Link>
              <Link href="/signup" className="hover:text-slate-900">
                Sign Up
              </Link>
            </div>
            <p className="text-sm text-slate-400">
              &copy; {new Date().getFullYear()} PropGenius AI. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
