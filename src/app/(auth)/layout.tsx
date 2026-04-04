import { Building2, Wand2, Contact, TrendingUp } from "lucide-react";

const FEATURES = [
  {
    icon: Wand2,
    title: "AI Listing Generator",
    description: "Professional property descriptions in under 10 seconds",
  },
  {
    icon: Contact,
    title: "Smart CRM",
    description: "Lead scoring, pipeline & WhatsApp — all in one place",
  },
  {
    icon: TrendingUp,
    title: "Analytics Dashboard",
    description: "Revenue insights and AI-powered performance reports",
  },
];

const STATS = [
  { value: "10x", label: "Faster listings" },
  { value: "3×", label: "More leads closed" },
  { value: "500+", label: "Agents active" },
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-white">
      {/* Left: Form area */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 sm:px-12 bg-white">
        <div className="w-full max-w-100">{children}</div>
      </div>

      {/* Right: Branding panel (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-120 xl:w-135 bg-slate-900 text-white flex-col justify-between p-12 relative overflow-hidden shrink-0">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(37,99,235,0.3),transparent)]" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-primary-500/50 to-transparent" />
        <div className="bg-grid-dots-light absolute inset-0" />

        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-16">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">PropGenius</span>
          </div>

          {/* Headline */}
          <h2 className="text-3xl font-bold leading-tight mb-3 text-white">
            Close more deals with AI
          </h2>
          <p className="text-slate-400 text-base leading-relaxed mb-12">
            The all-in-one platform built for Indian real estate agents and agencies.
          </p>

          {/* Features */}
          <div className="space-y-5">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="flex items-start gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/8 border border-white/10">
                    <Icon className="h-4.5 w-4.5 text-primary-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{f.title}</p>
                    <p className="text-sm text-slate-400 mt-0.5">{f.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats */}
        <div className="relative z-10 mt-12 pt-8 border-t border-white/10">
          <div className="grid grid-cols-3 gap-4">
            {STATS.map((s) => (
              <div key={s.label}>
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex items-center gap-2">
            <div className="flex -space-x-2">
              {["SK", "RP", "MA"].map((initials) => (
                <div
                  key={initials}
                  className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-slate-900 bg-primary-600 text-[10px] font-bold text-white"
                >
                  {initials}
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-400">
              Trusted by 500+ agents across India
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
